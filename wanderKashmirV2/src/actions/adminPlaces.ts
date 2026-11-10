"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAdminOrEditorSession, getAdminSession } from "@/lib/admin/auth";
import { validateGalleryData, GalleryImageItem } from "@/lib/places/galleryValidation";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface PlaceCmsInput {
  name: string;
  slug: string;
  description?: string | null;
  destination?: string | null;
  destinationIds?: string[];
  imageUrl?: string | null;
  gallery?: GalleryImageItem[] | unknown;
  timings?: string | null;
  entryFee?: string | null;
  bestTimeToVisit?: string | null;
  thingsToDo?: unknown;
  visitorTips?: unknown;
  seoTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  isFeatured?: boolean;
  status?: "ACTIVE" | "INACTIVE";
}

function sanitizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Server Action: Create a new Place record with visitor info, Bento gallery, and SEO metadata.
 * Permitted for: ADMIN and EDITOR.
 */
export async function createPlaceAction(
  input: PlaceCmsInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // 1. Strict Server-Side Authorization
    const session = await getAdminOrEditorSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
      return { success: false, error: "Unauthorized: Administrator or Editor privileges required." };
    }

    // 2. Validate Basic Information
    const name = (input.name || "").trim();
    if (name.length < 2) {
      return { success: false, error: "Place name must be at least 2 characters long." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(name);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    // Check slug uniqueness
    const existing = await prisma.place.findUnique({
      where: { slug: rawSlug },
      select: { id: true },
    });
    if (existing) {
      return { success: false, error: `A place with slug "${rawSlug}" already exists.` };
    }

    // 3. Validate Gallery Payload
    let validatedGalleryData: GalleryImageItem[] = [];
    if (input.gallery) {
      const galleryCheck = validateGalleryData(input.gallery);
      if (!galleryCheck.valid) {
        return {
          success: false,
          error: `Gallery validation failed: ${galleryCheck.errors.join("; ")}`,
        };
      }
      validatedGalleryData = galleryCheck.data;
    }

    // 4. Create Place Record & Destination Linkages atomically
    const newPlace = await prisma.$transaction(async (tx) => {
      const created = await tx.place.create({
        data: {
          name,
          slug: rawSlug,
          description: input.description?.trim() || null,
          imageUrl: input.imageUrl?.trim() || null,
          gallery: validatedGalleryData.length > 0 ? (validatedGalleryData as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          destination: input.destination?.trim() || null,
          timings: input.timings?.trim() || null,
          entryFee: input.entryFee?.trim() || null,
          bestTimeToVisit: input.bestTimeToVisit?.trim() || null,
          thingsToDo: input.thingsToDo ? (input.thingsToDo as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          visitorTips: input.visitorTips ? (input.visitorTips as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          seoTitle: input.seoTitle?.trim() || null,
          metaDescription: input.metaDescription?.trim() || null,
          canonicalUrl: input.canonicalUrl?.trim() || null,
          isFeatured: Boolean(input.isFeatured),
          status: input.status || "ACTIVE",
        },
        select: { id: true, slug: true },
      });

      // 5. Link DestinationPlace records
      const destinationIds = Array.isArray(input.destinationIds) ? input.destinationIds : [];
      if (destinationIds.length > 0) {
        for (let i = 0; i < destinationIds.length; i++) {
          const destId = destinationIds[i];
          if (!destId) continue;
          await tx.destinationPlace.upsert({
            where: {
              destinationId_placeId: {
                destinationId: destId,
                placeId: created.id,
              },
            },
            create: {
              destinationId: destId,
              placeId: created.id,
              displayOrder: i,
            },
            update: {
              displayOrder: i,
            },
          });
        }
      } else if (input.destination?.trim()) {
        // Legacy fallback: resolve destination by title/slug
        const destTerm = input.destination.trim();
        const parentDest = await tx.seoLandingPage.findFirst({
          where: {
            type: "DESTINATION",
            OR: [
              { slug: sanitizeSlug(destTerm) },
              { title: { contains: destTerm, mode: "insensitive" } },
              { h1Heading: { contains: destTerm, mode: "insensitive" } },
            ],
          },
          select: { id: true, slug: true },
        });

        if (parentDest) {
          await tx.destinationPlace.upsert({
            where: {
              destinationId_placeId: {
                destinationId: parentDest.id,
                placeId: created.id,
              },
            },
            create: {
              destinationId: parentDest.id,
              placeId: created.id,
              displayOrder: 0,
            },
            update: {},
          });
        }
      }

      return created;
    });

    // 6. Invalidate relevant caches
    revalidatePath("/places");
    revalidatePath("/admin/places");
    revalidatePath("/destinations");
    revalidatePath("/sitemap.xml");

    return { success: true, data: { id: newPlace.id, slug: newPlace.slug } };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        error: "This Place URL is already in use. Please choose another slug.",
      };
    }
    console.error("Error creating place in CMS:", error);
    return { success: false, error: "Failed to create place." };
  }
}

/**
 * Server Action: Update an existing Place record with all visitor, gallery, and SEO fields.
 * Permitted for: ADMIN and EDITOR.
 */
export async function updatePlaceAction(
  id: string,
  input: PlaceCmsInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // 1. Strict Server-Side Authorization
    const session = await getAdminOrEditorSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
      return { success: false, error: "Unauthorized: Administrator or Editor privileges required." };
    }

    if (!id || id.trim() === "") {
      return { success: false, error: "Invalid Place ID." };
    }

    const existingPlace = await prisma.place.findUnique({
      where: { id },
      include: {
        destinationPlaces: {
          include: {
            destination: { select: { slug: true } },
          },
        },
      },
    });

    if (!existingPlace) {
      return { success: false, error: "Place not found." };
    }

    // 2. Validate Name & Slug
    const name = (input.name || existingPlace.name).trim();
    if (name.length < 2) {
      return { success: false, error: "Place name must be at least 2 characters long." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : existingPlace.slug;
    if (rawSlug !== existingPlace.slug) {
      const conflict = await prisma.place.findUnique({
        where: { slug: rawSlug },
        select: { id: true },
      });
      if (conflict && conflict.id !== id) {
        return { success: false, error: `A place with slug "${rawSlug}" already exists.` };
      }
    }

    // 3. Validate Gallery Payload
    let validatedGalleryData: GalleryImageItem[] | null = null;
    if (input.gallery !== undefined) {
      if (input.gallery === null || input.gallery === "") {
        validatedGalleryData = [];
      } else {
        const galleryCheck = validateGalleryData(input.gallery);
        if (!galleryCheck.valid) {
          return {
            success: false,
            error: `Gallery validation failed: ${galleryCheck.errors.join("; ")}`,
          };
        }
        validatedGalleryData = galleryCheck.data;
      }
    }

    // 4. Update Place Record and synchronize associations atomically
    const updated = await prisma.$transaction(async (tx) => {
      const placeRecord = await tx.place.update({
        where: { id },
        data: {
          name,
          slug: rawSlug,
          description: input.description !== undefined ? input.description?.trim() || null : undefined,
          imageUrl: input.imageUrl !== undefined ? input.imageUrl?.trim() || null : undefined,
          gallery: validatedGalleryData !== null
            ? (validatedGalleryData as unknown as Prisma.InputJsonValue)
            : input.gallery === null
            ? Prisma.JsonNull
            : undefined,
          destination: input.destination !== undefined ? input.destination?.trim() || null : undefined,
          timings: input.timings !== undefined ? input.timings?.trim() || null : undefined,
          entryFee: input.entryFee !== undefined ? input.entryFee?.trim() || null : undefined,
          bestTimeToVisit: input.bestTimeToVisit !== undefined ? input.bestTimeToVisit?.trim() || null : undefined,
          thingsToDo: input.thingsToDo !== undefined
            ? (input.thingsToDo ? (input.thingsToDo as unknown as Prisma.InputJsonValue) : Prisma.JsonNull)
            : undefined,
          visitorTips: input.visitorTips !== undefined
            ? (input.visitorTips ? (input.visitorTips as unknown as Prisma.InputJsonValue) : Prisma.JsonNull)
            : undefined,
          seoTitle: input.seoTitle !== undefined ? input.seoTitle?.trim() || null : undefined,
          metaDescription: input.metaDescription !== undefined ? input.metaDescription?.trim() || null : undefined,
          canonicalUrl: input.canonicalUrl !== undefined ? input.canonicalUrl?.trim() || null : undefined,
          isFeatured: input.isFeatured !== undefined ? Boolean(input.isFeatured) : undefined,
          status: input.status || undefined,
        },
        select: { id: true, slug: true },
      });

      // 5. Synchronize DestinationPlace relational associations inside transaction
      if (Array.isArray(input.destinationIds)) {
        const newDestIds = new Set(input.destinationIds.filter(Boolean));

        // Unlink destinations that were removed
        await tx.destinationPlace.deleteMany({
          where: {
            placeId: id,
            destinationId: { notIn: Array.from(newDestIds) },
          },
        });

        // Upsert current destinations maintaining sequential displayOrder
        let orderIndex = 0;
        for (const destId of input.destinationIds) {
          if (!destId) continue;
          await tx.destinationPlace.upsert({
            where: {
              destinationId_placeId: {
                destinationId: destId,
                placeId: id,
              },
            },
            create: {
              destinationId: destId,
              placeId: id,
              displayOrder: orderIndex,
            },
            update: {
              displayOrder: orderIndex,
            },
          });
          orderIndex++;
        }
      }

      return placeRecord;
    });

    // 6. Invalidate relevant caches
    revalidatePath("/places");
    revalidatePath("/admin/places");
    revalidatePath(`/admin/places/${id}/edit`);
    revalidatePath(`/admin/places/${id}/preview`);
    revalidatePath("/sitemap.xml");

    // Invalidate public destination pages
    for (const dp of existingPlace.destinationPlaces) {
      if (dp.destination?.slug) {
        revalidatePath(`/destinations/${dp.destination.slug}`);
        revalidatePath(`/destinations/${dp.destination.slug}/${existingPlace.slug}`);
        if (rawSlug !== existingPlace.slug) {
          revalidatePath(`/destinations/${dp.destination.slug}/${rawSlug}`);
        }
      }
    }

    return { success: true, data: { id: updated.id, slug: updated.slug } };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        error: "This Place URL is already in use. Please choose another slug.",
      };
    }
    console.error("Error updating place in CMS:", error);
    return { success: false, error: "Failed to update place." };
  }
}

/**
 * Server Action: Toggle Place publication status (ACTIVE / INACTIVE).
 * Permitted for: ADMIN and EDITOR.
 */
export async function togglePlaceStatusAction(
  id: string,
  status: "ACTIVE" | "INACTIVE"
): Promise<ActionResult<{ id: string; status: string }>> {
  try {
    const session = await getAdminOrEditorSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "EDITOR")) {
      return { success: false, error: "Unauthorized: Administrator or Editor privileges required." };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid Place ID." };
    }

    const place = await prisma.place.update({
      where: { id },
      data: { status },
      select: { id: true, slug: true, status: true },
    });

    revalidatePath("/places");
    revalidatePath("/admin/places");
    revalidatePath(`/admin/places/${id}/preview`);
    revalidatePath("/sitemap.xml");

    return { success: true, data: { id: place.id, status: place.status } };
  } catch (error) {
    console.error("Error toggling place status:", error);
    return { success: false, error: "Failed to update place status." };
  }
}

/**
 * Server Action: Delete Place record.
 * STRICTLY PERMITTED FOR: ADMIN ONLY.
 * Editors cannot delete place records.
 */
export async function deletePlaceAction(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Strict Admin check
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Forbidden: Deleting Place records requires Administrator privileges." };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid Place ID." };
    }

    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        destinationPlaces: true,
      },
    });

    if (!place) {
      return { success: false, error: "Place not found." };
    }

    // Atomically delete join associations and place record
    await prisma.$transaction(async (tx) => {
      await tx.destinationPlace.deleteMany({
        where: { placeId: id },
      });
      await tx.place.delete({
        where: { id },
      });
    });

    revalidatePath("/places");
    revalidatePath("/admin/places");
    revalidatePath("/destinations");
    revalidatePath("/sitemap.xml");

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error deleting place:", error);
    return { success: false, error: "Failed to delete place." };
  }
}

