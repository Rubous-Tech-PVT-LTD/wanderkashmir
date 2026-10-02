"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export interface TravelStyleFormInput {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  isActive: boolean;
  displayOrder: number;
  assignedTourIds: string[];
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Server Action: Create a new production Travel Style.
 * Authenticated Admin required. Protected with strict server validation.
 */
export async function createTravelStyleAction(
  input: TravelStyleFormInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    const name = (input.name || "").trim();
    if (name.length < 2) {
      return { success: false, error: "Travel style name must be at least 2 characters." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(name);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    // 1. Check uniqueness of slug and name
    const existingSlug = await prisma.travelStyle.findFirst({
      where: {
        OR: [
          { slug: rawSlug },
          { name: { equals: name, mode: "insensitive" } },
        ],
      },
      select: { id: true, slug: true, name: true },
    });

    if (existingSlug) {
      return { success: false, error: `A travel style with this name or slug ("${rawSlug}") already exists.` };
    }

    // 2. Validate Tour IDs if provided
    const validTourIds: string[] = [];
    if (Array.isArray(input.assignedTourIds) && input.assignedTourIds.length > 0) {
      const existingTours = await prisma.tour.findMany({
        where: { id: { in: input.assignedTourIds } },
        select: { id: true },
      });
      validTourIds.push(...existingTours.map((t) => t.id));
    }

    // 3. Determine display order
    let displayOrder = Number(input.displayOrder) || 0;
    if (displayOrder <= 0) {
      const maxOrder = await prisma.travelStyle.aggregate({
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder || 0) + 1;
    }

    // 4. Transactional database write
    const created = await prisma.$transaction(async (tx) => {
      const style = await tx.travelStyle.create({
        data: {
          name,
          slug: rawSlug,
          description: input.description ? input.description.trim() : null,
          imageUrl: input.imageUrl ? input.imageUrl.trim() : null,
          imageAlt: input.imageAlt ? input.imageAlt.trim() : null,
          isActive: !!input.isActive,
          displayOrder,
        },
      });

      if (validTourIds.length > 0) {
        await tx.tourTravelStyle.createMany({
          data: validTourIds.map((tourId, idx) => ({
            tourId,
            travelStyleId: style.id,
            displayOrder: idx + 1,
          })),
        });
      }

      return style;
    });

    // 5. Trigger public V2 revalidation
    try {
      revalidatePath("/tours");
      revalidatePath(`/tours/${created.slug}`);
      revalidatePath("/");
      revalidatePath("/admin/travel-styles");
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation warning on travel style creation:", e);
    }

    return {
      success: true,
      data: { id: created.id, slug: created.slug },
    };
  } catch (error) {
    console.error("Error creating travel style:", error);
    return { success: false, error: "Failed to create travel style in database." };
  }
}

/**
 * Server Action: Update an existing production Travel Style.
 * Authenticated Admin required. Protected against mass assignment.
 * CRITICAL: Only modifies TravelStyle scalar fields and TourTravelStyle relation; Tours remain intact.
 */
export async function updateTravelStyleAction(
  id: string,
  input: TravelStyleFormInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Missing required Travel Style ID." };
    }

    const current = await prisma.travelStyle.findUnique({
      where: { id },
      select: { id: true, slug: true, name: true },
    });

    if (!current) {
      return { success: false, error: "Travel style not found in database." };
    }

    const name = (input.name || "").trim();
    if (name.length < 2) {
      return { success: false, error: "Travel style name must be at least 2 characters." };
    }

    const newSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(name);
    if (!newSlug || newSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    // 1. Check slug collision with other styles
    if (newSlug !== current.slug) {
      const collision = await prisma.travelStyle.findFirst({
        where: { slug: newSlug, id: { not: id } },
        select: { id: true },
      });
      if (collision) {
        return { success: false, error: `Slug "${newSlug}" is already in use by another travel style.` };
      }
    }

    // 2. Validate Tour IDs if provided
    const validTourIds: string[] = [];
    if (Array.isArray(input.assignedTourIds) && input.assignedTourIds.length > 0) {
      const existingTours = await prisma.tour.findMany({
        where: { id: { in: input.assignedTourIds } },
        select: { id: true },
      });
      validTourIds.push(...existingTours.map((t) => t.id));
    }

    const displayOrder = Number(input.displayOrder) >= 0 ? Number(input.displayOrder) : 0;

    // 3. Database transaction: update scalar fields and synchronize TourTravelStyle relations
    // Explicit whitelist: only update permitted fields.
    // Tours themselves are NEVER updated, altered, or deleted.
    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.travelStyle.update({
        where: { id },
        data: {
          name,
          slug: newSlug,
          description: input.description !== undefined ? (input.description?.trim() || null) : undefined,
          imageUrl: input.imageUrl !== undefined ? (input.imageUrl?.trim() || null) : undefined,
          imageAlt: input.imageAlt !== undefined ? (input.imageAlt?.trim() || null) : undefined,
          isActive: !!input.isActive,
          displayOrder,
        },
      });

      if (Array.isArray(input.assignedTourIds)) {
        await tx.tourTravelStyle.deleteMany({ where: { travelStyleId: id } });
        if (validTourIds.length > 0) {
          await tx.tourTravelStyle.createMany({
            data: validTourIds.map((tourId, idx) => ({
              tourId,
              travelStyleId: id,
              displayOrder: idx + 1,
            })),
          });
        }
      }

      return res;
    });

    // 4. Trigger public V2 revalidation
    try {
      revalidatePath("/tours");
      revalidatePath(`/tours/${current.slug}`);
      if (newSlug !== current.slug) {
        revalidatePath(`/tours/${newSlug}`);
      }
      revalidatePath("/");
      revalidatePath("/admin/travel-styles");
      revalidatePath(`/admin/travel-styles/${id}`);
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation warning on travel style update:", e);
    }

    return {
      success: true,
      data: { id: updated.id, slug: updated.slug },
    };
  } catch (error) {
    console.error(`Error updating travel style (${id}):`, error);
    return { success: false, error: "Failed to update travel style in database." };
  }
}

/**
 * Server Action: Activate or deactivate a Travel Style.
 * Authenticated Admin required. Updates only isActive.
 */
export async function toggleTravelStyleActiveAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Missing required Travel Style ID." };
    }

    const current = await prisma.travelStyle.findUnique({
      where: { id },
      select: { id: true, slug: true, isActive: true },
    });

    if (!current) {
      return { success: false, error: "Travel style not found." };
    }

    const updated = await prisma.travelStyle.update({
      where: { id },
      data: { isActive: !!isActive },
      select: { id: true, slug: true, isActive: true },
    });

    try {
      revalidatePath("/tours");
      revalidatePath(`/tours/${updated.slug}`);
      revalidatePath("/");
      revalidatePath("/admin/travel-styles");
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation warning on travel style toggle:", e);
    }

    return {
      success: true,
      data: { id: updated.id, isActive: updated.isActive },
    };
  } catch (error) {
    console.error(`Error toggling travel style status (${id}):`, error);
    return { success: false, error: "Failed to update travel style status." };
  }
}

/**
 * Server Action: Update Travel Style display order.
 */
export async function updateTravelStyleOrderAction(
  id: string,
  displayOrder: number
): Promise<ActionResult<{ id: string; displayOrder: number }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    const orderNum = Math.max(0, parseInt(String(displayOrder), 10) || 0);

    const updated = await prisma.travelStyle.update({
      where: { id },
      data: { displayOrder: orderNum },
      select: { id: true, slug: true, displayOrder: true },
    });

    try {
      revalidatePath("/tours");
      revalidatePath("/");
      revalidatePath("/admin/travel-styles");
    } catch (e) {
      console.warn("Revalidation warning on order update:", e);
    }

    return {
      success: true,
      data: { id: updated.id, displayOrder: updated.displayOrder },
    };
  } catch (error) {
    console.error(`Error updating travel style order (${id}):`, error);
    return { success: false, error: "Failed to update display order." };
  }
}
