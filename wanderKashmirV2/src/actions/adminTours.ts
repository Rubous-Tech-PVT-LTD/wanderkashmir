"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export interface TourStayInput {
  id?: string;
  destination: string;
  stayType?: string | null;
  propertyId?: string | null;
  nights: number;
  displayOrder?: number;
}

export interface TourTransportInput {
  id?: string;
  origin: string;
  destination: string;
  purpose: string;
  vehicleId?: string | null;
  driverId?: string | null;
  displayOrder?: number;
  status?: string;
}

export interface TourExperienceInput {
  id?: string;
  experienceId: string;
  isOptional: boolean;
  dayNumber?: number | null;
  displayOrder?: number;
}

export interface TourTravelGuideInput {
  id?: string;
  guideId: string;
  displayOrder?: number;
}

export interface TourItineraryInputDay {
  day: string;
  title: string;
  description?: string;
  desc?: string;
  image?: string;
  location?: string;
  stay?: string;
  meals?: string;
  activities?: string[] | string;
}

export interface TourContentSectionsInput {
  bestTime?: string;
  food?: string;
  shopping?: string;
  nearby?: string;
  faqs?: { question: string; answer: string }[];
}

export interface TourDynamicBlockInput {
  id: string;
  type: string;
  title?: string;
  text?: string;
  level?: 2 | 3 | 4;
  url?: string;
  alt?: string;
  caption?: string;
  layout?: "full" | "inline-left" | "inline-right";
  headers?: string[];
  rows?: string[][];
  items?: string[];
  style?: "bullet" | "numbered" | "button" | "inline";
  variant?: "info" | "tip" | "warning" | "quote";
  isVisible?: boolean;
  displayOrder?: number;
  [key: string]: any;
}

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
  itinerary: TourItineraryInputDay[];
  contentSections?: TourContentSectionsInput;
  dynamicBlocks?: TourDynamicBlockInput[];
  travelStyleIds: string[];
  stays?: TourStayInput[];
  transports?: TourTransportInput[];
  experiences?: TourExperienceInput[];
  travelGuides?: TourTravelGuideInput[];
  isLive: boolean;
  isPopular?: boolean;
  popularOrder?: number | null;
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

function packTourItineraryPayload(
  itinerary: TourItineraryInputDay[],
  contentSections?: TourContentSectionsInput,
  dynamicBlocks?: TourDynamicBlockInput[],
  existingItinerary?: any
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  let existingDaysMap: Record<string, any> = {};
  if (existingItinerary) {
    const rawDays = Array.isArray(existingItinerary)
      ? existingItinerary
      : Array.isArray(existingItinerary?.days)
      ? existingItinerary.days
      : [];
    for (const d of rawDays) {
      if (d && (d.day || d.title)) {
        const key = String(d.day || "").toLowerCase().trim();
        if (key) existingDaysMap[key] = d;
      }
    }
  }

  const normalizedDays = Array.isArray(itinerary)
    ? itinerary.map((d, idx) => {
        const dayLabel = d.day ? String(d.day).trim() : `Day ${idx + 1}`;
        const existingDay = existingDaysMap[dayLabel.toLowerCase()] || {};

        return {
          day: dayLabel,
          title: String(d.title !== undefined ? d.title : existingDay.title || "").trim(),
          desc: String(
            d.description !== undefined
              ? d.description
              : d.desc !== undefined
              ? d.desc
              : existingDay.desc || existingDay.description || ""
          ).trim(),
          image:
            d.image !== undefined
              ? d.image
                ? String(d.image).trim()
                : undefined
              : existingDay.image,
          location:
            d.location !== undefined
              ? d.location
                ? String(d.location).trim()
                : undefined
              : existingDay.location,
          stay:
            d.stay !== undefined
              ? d.stay
                ? String(d.stay).trim()
                : undefined
              : existingDay.stay,
          meals:
            d.meals !== undefined
              ? d.meals
                ? String(d.meals).trim()
                : undefined
              : existingDay.meals,
          activities: Array.isArray(d.activities)
            ? d.activities.map((a: any) => String(a).trim()).filter(Boolean)
            : typeof d.activities === "string" && (d.activities as string).trim()
            ? (d.activities as string).split(",").map((a: string) => a.trim()).filter(Boolean)
            : existingDay.activities || [],
        };
      })
    : [];

  const hasSections = contentSections && Object.keys(contentSections).length > 0;
  const hasBlocks = Array.isArray(dynamicBlocks) && dynamicBlocks.length > 0;

  if (hasSections || hasBlocks) {
    return {
      days: normalizedDays,
      contentSections: contentSections || {},
      dynamicBlocks: dynamicBlocks || [],
    } as unknown as Prisma.InputJsonValue;
  }

  if (normalizedDays.length > 0) {
    return normalizedDays as unknown as Prisma.InputJsonValue;
  }

  return Prisma.JsonNull;
}

/**
 * Common security check: verified active ADMIN session and DB verification.
 */
async function verifyAdminAuth(): Promise<{ authorized: boolean; error?: string; adminId?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { authorized: false, error: "Unauthorized: Admin session required." };
  }

  if (session.role !== "ADMIN") {
    return { authorized: false, error: "Forbidden: Administrator role required." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isBanned: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isBanned) {
    return { authorized: false, error: "Forbidden: Account is not an active administrator." };
  }

  return { authorized: true, adminId: dbUser.id };
}

function revalidateTourPaths(slug?: string, prevSlug?: string) {
  try {
    revalidatePath("/tours");
    revalidatePath("/tour");
    revalidatePath("/");
    if (slug) revalidatePath(`/tours/${slug}`);
    if (prevSlug && prevSlug !== slug) revalidatePath(`/tours/${prevSlug}`);
    revalidatePath("/admin/tours");
    revalidatePath("/sitemap.xml");
  } catch (e) {
    console.warn("Revalidation warning:", e);
  }
}

/**
 * Server Action: Create a new production Tour.
 * Authenticated Admin required. Protected with strict server validation.
 */
export async function createTourAction(
  input: TourFormInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
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
      return {
        success: false,
        error: "Original price must be greater than or equal to current price.",
      };
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

    // 5. Database transaction to create Tour and assign relations
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
          destinations: Array.isArray(input.destinations)
            ? input.destinations.map((d) => String(d).trim()).filter(Boolean)
            : [],
          images: Array.isArray(input.images)
            ? input.images.map((img) => String(img).trim()).filter(Boolean)
            : [],
          highlights: Array.isArray(input.highlights)
            ? input.highlights.map((h) => String(h).trim()).filter(Boolean)
            : [],
          inclusions: Array.isArray(input.inclusions)
            ? input.inclusions.map((inc) => String(inc).trim()).filter(Boolean)
            : [],
          exclusions: Array.isArray(input.exclusions)
            ? input.exclusions.map((exc) => String(exc).trim()).filter(Boolean)
            : [],
          itinerary: packTourItineraryPayload(
            input.itinerary,
            input.contentSections,
            input.dynamicBlocks
          ),
          isLive: !!input.isLive,
          isPopular: !!input.isPopular,
          popularOrder:
            input.isPopular && typeof input.popularOrder === "number" && input.popularOrder > 0
              ? Math.floor(input.popularOrder)
              : null,
        },
      });

      // Assign TravelStyles
      if (validStyleIds.length > 0) {
        await tx.tourTravelStyle.createMany({
          data: validStyleIds.map((styleId, idx) => ({
            tourId: newTour.id,
            travelStyleId: styleId,
            displayOrder: idx + 1,
          })),
        });
      }

      // Assign Stays if provided
      if (Array.isArray(input.stays) && input.stays.length > 0) {
        await tx.tourStay.createMany({
          data: input.stays.map((s, idx) => ({
            tourId: newTour.id,
            destination: (s.destination || "Kashmir").trim(),
            stayType: s.stayType || null,
            propertyId: s.propertyId && s.propertyId.trim() !== "" ? s.propertyId : null,
            nights: Math.max(1, Number(s.nights) || 1),
            displayOrder: s.displayOrder !== undefined ? Number(s.displayOrder) : idx + 1,
          })),
        });
      }

      // Assign Transports if provided
      if (Array.isArray(input.transports) && input.transports.length > 0) {
        await tx.tourTransport.createMany({
          data: input.transports.map((t, idx) => ({
            tourId: newTour.id,
            origin: (t.origin || "Srinagar").trim(),
            destination: (t.destination || "Kashmir").trim(),
            purpose: t.purpose || "Transfer",
            vehicleId: t.vehicleId && t.vehicleId.trim() !== "" ? t.vehicleId : null,
            driverId: t.driverId && t.driverId.trim() !== "" ? t.driverId : null,
            displayOrder: t.displayOrder !== undefined ? Number(t.displayOrder) : idx + 1,
            status: t.status || "ACTIVE",
          })),
        });
      }

      // Assign Experiences if provided
      if (Array.isArray(input.experiences) && input.experiences.length > 0) {
        await tx.tourExperience.createMany({
          data: input.experiences.map((exp, idx) => ({
            tourId: newTour.id,
            experienceId: exp.experienceId,
            isOptional: !!exp.isOptional,
            dayNumber: exp.dayNumber ? Number(exp.dayNumber) : null,
            displayOrder: exp.displayOrder !== undefined ? Number(exp.displayOrder) : idx + 1,
          })),
        });
      }

      // Assign Travel Guides if provided
      if (Array.isArray(input.travelGuides) && input.travelGuides.length > 0) {
        await tx.tourTravelGuide.createMany({
          data: input.travelGuides.map((g, idx) => ({
            tourId: newTour.id,
            guideId: g.guideId,
            displayOrder: g.displayOrder !== undefined ? Number(g.displayOrder) : idx + 1,
          })),
        });
      }

      return newTour;
    });

    revalidateTourPaths(created.slug);

    return {
      success: true,
      data: { id: created.id, slug: created.slug },
    };
  } catch (error) {
    console.error("Error creating tour:", error);
    return {
      success: false,
      error: "Failed to create tour in database. Please check required fields.",
    };
  }
}

/**
 * Server Action: Update an existing production Tour.
 * Authenticated Admin required. Protected against mass assignment.
 */
export async function updateTourAction(
  id: string,
  input: TourFormInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Missing required Tour ID." };
    }

    const existingTour = await prisma.tour.findUnique({
      where: { id },
      include: {
        travelStyles: {
          select: { travelStyleId: true, travelStyle: { select: { slug: true } } },
        },
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
      return {
        success: false,
        error: "Original price must be greater than or equal to current price.",
      };
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
          destinations: Array.isArray(input.destinations)
            ? input.destinations.map((d) => String(d).trim()).filter(Boolean)
            : [],
          images: Array.isArray(input.images)
            ? input.images.map((img) => String(img).trim()).filter(Boolean)
            : [],
          highlights: Array.isArray(input.highlights)
            ? input.highlights.map((h) => String(h).trim()).filter(Boolean)
            : [],
          inclusions: Array.isArray(input.inclusions)
            ? input.inclusions.map((inc) => String(inc).trim()).filter(Boolean)
            : [],
          exclusions: Array.isArray(input.exclusions)
            ? input.exclusions.map((exc) => String(exc).trim()).filter(Boolean)
            : [],
          itinerary: packTourItineraryPayload(
            input.itinerary,
            input.contentSections,
            input.dynamicBlocks,
            existingTour.itinerary
          ),
          isLive: !!input.isLive,
          isPopular: !!input.isPopular,
          popularOrder:
            input.isPopular && typeof input.popularOrder === "number" && input.popularOrder > 0
              ? Math.floor(input.popularOrder)
              : null,
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

      // Synchronize Stays if explicitly provided
      if (Array.isArray(input.stays)) {
        await tx.tourStay.deleteMany({ where: { tourId: id } });
        if (input.stays.length > 0) {
          await tx.tourStay.createMany({
            data: input.stays.map((s, idx) => ({
              tourId: id,
              destination: (s.destination || "Kashmir").trim(),
              stayType: s.stayType || null,
              propertyId: s.propertyId && s.propertyId.trim() !== "" ? s.propertyId : null,
              nights: Math.max(1, Number(s.nights) || 1),
              displayOrder: s.displayOrder !== undefined ? Number(s.displayOrder) : idx + 1,
            })),
          });
        }
      }

      // Synchronize Transports if explicitly provided
      if (Array.isArray(input.transports)) {
        await tx.tourTransport.deleteMany({ where: { tourId: id } });
        if (input.transports.length > 0) {
          await tx.tourTransport.createMany({
            data: input.transports.map((t, idx) => ({
              tourId: id,
              origin: (t.origin || "Srinagar").trim(),
              destination: (t.destination || "Kashmir").trim(),
              purpose: t.purpose || "Transfer",
              vehicleId: t.vehicleId && t.vehicleId.trim() !== "" ? t.vehicleId : null,
              driverId: t.driverId && t.driverId.trim() !== "" ? t.driverId : null,
              displayOrder: t.displayOrder !== undefined ? Number(t.displayOrder) : idx + 1,
              status: t.status || "ACTIVE",
            })),
          });
        }
      }

      // Synchronize Experiences if explicitly provided
      if (Array.isArray(input.experiences)) {
        await tx.tourExperience.deleteMany({ where: { tourId: id } });
        if (input.experiences.length > 0) {
          await tx.tourExperience.createMany({
            data: input.experiences.map((exp, idx) => ({
              tourId: id,
              experienceId: exp.experienceId,
              isOptional: !!exp.isOptional,
              dayNumber: exp.dayNumber ? Number(exp.dayNumber) : null,
              displayOrder: exp.displayOrder !== undefined ? Number(exp.displayOrder) : idx + 1,
            })),
          });
        }
      }

      // Synchronize Travel Guides if explicitly provided
      if (Array.isArray(input.travelGuides)) {
        await tx.tourTravelGuide.deleteMany({ where: { tourId: id } });
        if (input.travelGuides.length > 0) {
          await tx.tourTravelGuide.createMany({
            data: input.travelGuides.map((g, idx) => ({
              tourId: id,
              guideId: g.guideId,
              displayOrder: g.displayOrder !== undefined ? Number(g.displayOrder) : idx + 1,
            })),
          });
        }
      }

      return res;
    });

    revalidateTourPaths(updated.slug, existingTour.slug);

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
export async function toggleTourPublishAction(
  id: string,
  isLive: boolean
): Promise<ActionResult<{ id: string; isLive: boolean }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
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

    revalidateTourPaths(updated.slug);

    return {
      success: true,
      data: { id: updated.id, isLive: updated.isLive },
    };
  } catch (error) {
    console.error(`Error toggling tour status (${id}):`, error);
    return { success: false, error: "Failed to update tour publishing status." };
  }
}

/**
 * Server Action: Delete a Tour with foreign key booking safeguards.
 * Authenticated Admin required. Prevents accidental deletion if bookings exist.
 */
export async function deleteTourAction(id: string): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Missing required Tour ID." };
    }

    const tour = await prisma.tour.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!tour) {
      return { success: false, error: "Tour record not found in database." };
    }

    if (tour._count.bookings > 0) {
      return {
        success: false,
        error: `Cannot delete tour "${tour.title}" because it has ${tour._count.bookings} existing customer booking(s). Please unpublish it (set to Draft) instead to preserve financial and audit history.`,
      };
    }

    await prisma.tour.delete({
      where: { id },
    });

    revalidateTourPaths(tour.slug);

    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting tour (${id}):`, error);
    return { success: false, error: "Failed to delete tour from database." };
  }
}
