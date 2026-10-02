"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export interface TourFormInput {
  title: string;
  slug: string;
  duration: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  categoryId?: string | null;
  maxPersons: number;
  badge?: string | null;
  overview?: string | null;
  destinations: string[];
  images: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: any[];
  travelStyleIds: string[];
  isLive: boolean;
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
 * Server Action: Create a new production Tour.
 * Authenticated Admin required. Protected with strict server validation.
 */
export async function createTourAction(input: TourFormInput): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    // 1. Server validation
    const title = (input.title || "").trim();
    if (title.length < 3) {
      return { success: false, error: "Tour title must be at least 3 characters." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(title);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    const duration = (input.duration || "").trim();
    if (!duration) {
      return { success: false, error: "Tour duration is required (e.g. '5 Days • 4 Nights')." };
    }

    const price = Number(input.price);
    if (isNaN(price) || price <= 0) {
      return { success: false, error: "Price must be a positive number." };
    }

    const originalPrice = input.originalPrice ? Number(input.originalPrice) : null;
    if (originalPrice !== null && (isNaN(originalPrice) || originalPrice < price)) {
      return { success: false, error: "Original price must be greater than or equal to current price." };
    }

    const maxPersons = Math.max(1, parseInt(String(input.maxPersons || 1), 10) || 1);

    // 2. Check slug uniqueness
    const existingTourWithSlug = await prisma.tour.findUnique({
      where: { slug: rawSlug },
      select: { id: true },
    });
    if (existingTourWithSlug) {
      return { success: false, error: `A tour with the slug "${rawSlug}" already exists.` };
    }

    // 3. Category validation and syncing
    let categoryName = (input.category || "General").trim();
    let categoryId = input.categoryId && input.categoryId.trim() !== "" ? input.categoryId : null;

    if (categoryId) {
      const cat = await prisma.tourCategory.findUnique({
        where: { id: categoryId },
        select: { id: true, name: true },
      });
      if (cat) {
        categoryName = cat.name;
      } else {
        categoryId = null;
      }
    }

    // 4. Validate Travel Styles if provided
    const validStyleIds: string[] = [];
    if (Array.isArray(input.travelStyleIds) && input.travelStyleIds.length > 0) {
      const styles = await prisma.travelStyle.findMany({
        where: {
          id: { in: input.travelStyleIds },
          isActive: true,
        },
        select: { id: true, slug: true },
      });
      validStyleIds.push(...styles.map((s) => s.id));
    }

    // 5. Database transaction to create Tour and assign TravelStyles
    const created = await prisma.$transaction(async (tx) => {
      const newTour = await tx.tour.create({
        data: {
          title,
          slug: rawSlug,
          duration,
          price,
          originalPrice,
          category: categoryName,
          categoryId,
          maxPersons,
          badge: input.badge ? input.badge.trim() : null,
          overview: input.overview ? input.overview.trim() : null,
          destinations: Array.isArray(input.destinations) ? input.destinations.map((d) => String(d).trim()).filter(Boolean) : [],
          images: Array.isArray(input.images) ? input.images.map((img) => String(img).trim()).filter(Boolean) : [],
          highlights: Array.isArray(input.highlights) ? input.highlights.map((h) => String(h).trim()).filter(Boolean) : [],
          inclusions: Array.isArray(input.inclusions) ? input.inclusions.map((inc) => String(inc).trim()).filter(Boolean) : [],
          exclusions: Array.isArray(input.exclusions) ? input.exclusions.map((exc) => String(exc).trim()).filter(Boolean) : [],
          itinerary: Array.isArray(input.itinerary) && input.itinerary.length > 0 ? (input.itinerary as Prisma.InputJsonValue) : Prisma.JsonNull,
          isLive: !!input.isLive,
        },
      });

      if (validStyleIds.length > 0) {
        await tx.tourTravelStyle.createMany({
          data: validStyleIds.map((styleId, idx) => ({
            tourId: newTour.id,
            travelStyleId: styleId,
            displayOrder: idx + 1,
          })),
        });
      }

      return newTour;
    });

    // 6. Public V2 Route Revalidation
    try {
      revalidatePath("/tours");
      revalidatePath(`/tours/${created.slug}`);
      revalidatePath("/admin/tours");
      revalidatePath("/sitemap.xml");
      if (validStyleIds.length > 0) {
        const affectedStyles = await prisma.travelStyle.findMany({
          where: { id: { in: validStyleIds } },
          select: { slug: true },
        });
        for (const s of affectedStyles) {
          revalidatePath(`/tours/${s.slug}`);
        }
      }
    } catch (e) {
      console.warn("Revalidation warning on tour creation:", e);
    }

    return {
      success: true,
      data: { id: created.id, slug: created.slug },
    };
  } catch (error) {
    console.error("Error creating tour:", error);
    return { success: false, error: "Failed to create tour in database. Please check required fields." };
  }
}

/**
 * Server Action: Update an existing production Tour.
 * Authenticated Admin required. Protected against mass assignment.
 * CRITICAL: Preserves existing stays, transports, experiences, and travelGuides.
 */
export async function updateTourAction(id: string, input: TourFormInput): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Missing required Tour ID." };
    }

    const existingTour = await prisma.tour.findUnique({
      where: { id },
      include: {
        travelStyles: { select: { travelStyleId: true, travelStyle: { select: { slug: true } } } },
      },
    });

    if (!existingTour) {
      return { success: false, error: "Tour record not found in database." };
    }

    // 1. Server validation
    const title = (input.title || "").trim();
    if (title.length < 3) {
      return { success: false, error: "Tour title must be at least 3 characters." };
    }

    const newSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(title);
    if (!newSlug || newSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    // If slug changed, verify uniqueness
    if (newSlug !== existingTour.slug) {
      const duplicateSlugCheck = await prisma.tour.findUnique({
        where: { slug: newSlug },
        select: { id: true },
      });
      if (duplicateSlugCheck && duplicateSlugCheck.id !== id) {
        return { success: false, error: `Slug "${newSlug}" is already in use by another tour.` };
      }
    }

    const duration = (input.duration || "").trim();
    if (!duration) {
      return { success: false, error: "Tour duration is required." };
    }

    const price = Number(input.price);
    if (isNaN(price) || price <= 0) {
      return { success: false, error: "Price must be a positive number." };
    }

    const originalPrice = input.originalPrice ? Number(input.originalPrice) : null;
    if (originalPrice !== null && (isNaN(originalPrice) || originalPrice < price)) {
      return { success: false, error: "Original price must be greater than or equal to current price." };
    }

    const maxPersons = Math.max(1, parseInt(String(input.maxPersons || 1), 10) || 1);

    // 2. Category validation and syncing
    let categoryName = (input.category || existingTour.category || "General").trim();
    let categoryId = input.categoryId && input.categoryId.trim() !== "" ? input.categoryId : null;

    if (categoryId) {
      const cat = await prisma.tourCategory.findUnique({
        where: { id: categoryId },
        select: { id: true, name: true },
      });
      if (cat) {
        categoryName = cat.name;
      } else {
        categoryId = null;
      }
    }

    // 3. Validate Travel Styles if provided
    const validStyleIds: string[] = [];
    if (Array.isArray(input.travelStyleIds) && input.travelStyleIds.length > 0) {
      const styles = await prisma.travelStyle.findMany({
        where: {
          id: { in: input.travelStyleIds },
          isActive: true,
        },
        select: { id: true, slug: true },
      });
      validStyleIds.push(...styles.map((s) => s.id));
    }

    // 4. Update in Prisma transaction
    // Explicit whitelist: only update permitted scalar fields and synchronize TravelStyles.
    // Stays, transports, experiences, and travel guides are NOT touched or deleted.
    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.tour.update({
        where: { id },
        data: {
          title,
          slug: newSlug,
          duration,
          price,
          originalPrice,
          category: categoryName,
          categoryId,
          maxPersons,
          badge: input.badge ? input.badge.trim() : null,
          overview: input.overview ? input.overview.trim() : null,
          destinations: Array.isArray(input.destinations) ? input.destinations.map((d) => String(d).trim()).filter(Boolean) : [],
          images: Array.isArray(input.images) ? input.images.map((img) => String(img).trim()).filter(Boolean) : [],
          highlights: Array.isArray(input.highlights) ? input.highlights.map((h) => String(h).trim()).filter(Boolean) : [],
          inclusions: Array.isArray(input.inclusions) ? input.inclusions.map((inc) => String(inc).trim()).filter(Boolean) : [],
          exclusions: Array.isArray(input.exclusions) ? input.exclusions.map((exc) => String(exc).trim()).filter(Boolean) : [],
          itinerary: Array.isArray(input.itinerary) && input.itinerary.length > 0 ? (input.itinerary as Prisma.InputJsonValue) : Prisma.JsonNull,
          isLive: !!input.isLive,
        },
      });

      // Synchronize TravelStyles safely
      if (Array.isArray(input.travelStyleIds)) {
        await tx.tourTravelStyle.deleteMany({ where: { tourId: id } });
        if (validStyleIds.length > 0) {
          await tx.tourTravelStyle.createMany({
            data: validStyleIds.map((styleId, idx) => ({
              tourId: id,
              travelStyleId: styleId,
              displayOrder: idx + 1,
            })),
          });
        }
      }

      return res;
    });

    // 5. Trigger public revalidation
    try {
      revalidatePath("/tours");
      revalidatePath(`/tours/${existingTour.slug}`);
      if (newSlug !== existingTour.slug) {
        revalidatePath(`/tours/${newSlug}`);
      }
      revalidatePath("/admin/tours");
      revalidatePath(`/admin/tours/${id}`);
      revalidatePath("/sitemap.xml");

      // Revalidate affected travel styles
      const affectedStyleSlugs = new Set<string>();
      existingTour.travelStyles.forEach((ts) => {
        if (ts.travelStyle?.slug) affectedStyleSlugs.add(ts.travelStyle.slug);
      });
      if (validStyleIds.length > 0) {
        const newStyles = await prisma.travelStyle.findMany({
          where: { id: { in: validStyleIds } },
          select: { slug: true },
        });
        newStyles.forEach((s) => affectedStyleSlugs.add(s.slug));
      }
      for (const sSlug of affectedStyleSlugs) {
        revalidatePath(`/tours/${sSlug}`);
      }
    } catch (e) {
      console.warn("Revalidation warning on tour update:", e);
    }

    return {
      success: true,
      data: { id: updated.id, slug: updated.slug },
    };
  } catch (error) {
    console.error(`Error updating tour (${id}):`, error);
    return { success: false, error: "Failed to save tour changes to database." };
  }
}

/**
 * Server Action: Publish or unpublish a Tour.
 * Authenticated Admin required. Updates only isLive.
 */
export async function toggleTourPublishAction(id: string, isLive: boolean): Promise<ActionResult<{ id: string; isLive: boolean }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Missing required Tour ID." };
    }

    const tour = await prisma.tour.findUnique({
      where: { id },
      select: { id: true, slug: true, isLive: true },
    });

    if (!tour) {
      return { success: false, error: "Tour record not found." };
    }

    const updated = await prisma.tour.update({
      where: { id },
      data: { isLive: !!isLive },
      select: { id: true, slug: true, isLive: true },
    });

    // Revalidate affected public routes
    try {
      revalidatePath("/tours");
      revalidatePath(`/tours/${updated.slug}`);
      revalidatePath("/admin/tours");
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation warning on tour toggle:", e);
    }

    return {
      success: true,
      data: { id: updated.id, isLive: updated.isLive },
    };
  } catch (error) {
    console.error(`Error toggling tour status (${id}):`, error);
    return { success: false, error: "Failed to update tour publishing status." };
  }
}
