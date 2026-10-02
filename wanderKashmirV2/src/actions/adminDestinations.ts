"use server";

import prisma from "@/lib/prisma";
import { SeoWorkflowState } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export interface DestinationFormInput {
  title: string;
  slug: string;
  h1Heading: string;
  description?: string | null;
  imageUrl?: string | null;
  content?: string | null;
  cleanName?: string | null;
  workflowState?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  gallery?: string[];
  faqs?: { question: string; answer: string }[];
  overview?: string | null;
  bestTimeToVisit?: string | null;
  itinerary?: string | null;
  howToReach?: string | null;
  food?: string | null;
  shopping?: string | null;
  activities?: string | null;
  nearbyPlacesContent?: string | null;
}

export interface PlaceFormInput {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  destination?: string | null;
  status?: "ACTIVE" | "INACTIVE";
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
 * Server Action: Create a new Destination (SeoLandingPage type="DESTINATION").
 * Safe default: workflowState = "DRAFT".
 */
export async function createDestinationAction(
  input: DestinationFormInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    const title = (input.title || "").trim();
    if (title.length < 3) {
      return { success: false, error: "Destination title must be at least 3 characters." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(title);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    const h1Heading = (input.h1Heading || title).trim();

    // Check slug uniqueness across SeoLandingPage
    const existing = await prisma.seoLandingPage.findUnique({
      where: { slug: rawSlug },
      select: { id: true },
    });
    if (existing) {
      return { success: false, error: `A page with the slug "${rawSlug}" already exists.` };
    }

    const seoStrategy = {
      cleanName: input.cleanName?.trim() || title.split("|")[0].replace(/\s*Travel Guide.*$/i, "").trim(),
      gallery: Array.isArray(input.gallery) ? input.gallery.filter(Boolean) : [],
      overview: input.overview?.trim() || null,
      bestTimeToVisit: input.bestTimeToVisit?.trim() || null,
      itinerary: input.itinerary?.trim() || null,
      howToReach: input.howToReach?.trim() || null,
      food: input.food?.trim() || null,
      shopping: input.shopping?.trim() || null,
      activities: input.activities?.trim() || null,
      nearbyPlacesContent: input.nearbyPlacesContent?.trim() || null,
    };

    const newDest = await prisma.seoLandingPage.create({
      data: {
        type: "DESTINATION",
        slug: rawSlug,
        title,
        h1Heading,
        description: input.description?.trim() || null,
        imageUrl: input.imageUrl?.trim() || null,
        content: input.content?.trim() || null,
        faqs: input.faqs || [],
        seoStrategy,
        workflowState: (input.workflowState as SeoWorkflowState) || "DRAFT",
      },
      select: { id: true, slug: true },
    });

    revalidatePath("/destinations");
    revalidatePath(`/destinations/${rawSlug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/destinations");

    return { success: true, data: { id: newDest.id, slug: newDest.slug } };
  } catch (error) {
    console.error("Error creating destination:", error);
    return { success: false, error: "Failed to create destination. Please check inputs." };
  }
}

/**
 * Server Action: Update an existing Destination.
 */
export async function updateDestinationAction(
  id: string,
  input: DestinationFormInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || id.trim() === "") {
      return { success: false, error: "Invalid Destination ID." };
    }

    const existing = await prisma.seoLandingPage.findUnique({
      where: { id },
      select: { id: true, slug: true, type: true, seoStrategy: true },
    });

    if (!existing || existing.type !== "DESTINATION") {
      return { success: false, error: "Destination not found." };
    }

    const title = (input.title || "").trim();
    if (title.length < 3) {
      return { success: false, error: "Destination title must be at least 3 characters." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(title);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    const h1Heading = (input.h1Heading || title).trim();

    if (rawSlug !== existing.slug) {
      const collision = await prisma.seoLandingPage.findUnique({
        where: { slug: rawSlug },
        select: { id: true },
      });
      if (collision && collision.id !== id) {
        return { success: false, error: `A page with the slug "${rawSlug}" already exists.` };
      }
    }

    const existingStrategy: any =
      typeof existing.seoStrategy === "object" && existing.seoStrategy !== null
        ? existing.seoStrategy
        : {};

    const updatedStrategy = {
      ...existingStrategy,
      cleanName: input.cleanName?.trim() || title.split("|")[0].replace(/\s*Travel Guide.*$/i, "").trim(),
      gallery: Array.isArray(input.gallery) ? input.gallery.filter(Boolean) : existingStrategy.gallery || [],
      overview: input.overview !== undefined ? input.overview?.trim() || null : existingStrategy.overview,
      bestTimeToVisit: input.bestTimeToVisit !== undefined ? input.bestTimeToVisit?.trim() || null : existingStrategy.bestTimeToVisit,
      itinerary: input.itinerary !== undefined ? input.itinerary?.trim() || null : existingStrategy.itinerary,
      howToReach: input.howToReach !== undefined ? input.howToReach?.trim() || null : existingStrategy.howToReach,
      food: input.food !== undefined ? input.food?.trim() || null : existingStrategy.food,
      shopping: input.shopping !== undefined ? input.shopping?.trim() || null : existingStrategy.shopping,
      activities: input.activities !== undefined ? input.activities?.trim() || null : existingStrategy.activities,
      nearbyPlacesContent: input.nearbyPlacesContent !== undefined ? input.nearbyPlacesContent?.trim() || null : existingStrategy.nearbyPlacesContent,
    };

    await prisma.seoLandingPage.update({
      where: { id },
      data: {
        title,
        slug: rawSlug,
        h1Heading,
        description: input.description?.trim() || null,
        imageUrl: input.imageUrl?.trim() || null,
        content: input.content?.trim() || null,
        faqs: input.faqs || [],
        seoStrategy: updatedStrategy,
        ...(input.workflowState ? { workflowState: input.workflowState as SeoWorkflowState } : {}),
      },
    });

    revalidatePath("/destinations");
    revalidatePath(`/destinations/${existing.slug}`);
    if (rawSlug !== existing.slug) {
      revalidatePath(`/destinations/${rawSlug}`);
    }
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/destinations");
    revalidatePath(`/admin/destinations/${id}`);

    return { success: true, data: { id, slug: rawSlug } };
  } catch (error) {
    console.error("Error updating destination:", error);
    return { success: false, error: "Failed to update destination." };
  }
}

/**
 * Server Action: Publish or Unpublish a Destination.
 */
export async function toggleDestinationPublishAction(
  id: string,
  publish: boolean
): Promise<ActionResult<{ id: string; workflowState: SeoWorkflowState }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || id.trim() === "") {
      return { success: false, error: "Invalid Destination ID." };
    }

    const existing = await prisma.seoLandingPage.findUnique({
      where: { id },
      select: { id: true, slug: true, type: true },
    });

    if (!existing || existing.type !== "DESTINATION") {
      return { success: false, error: "Destination not found." };
    }

    const newState: SeoWorkflowState = publish ? "PUBLISHED" : "DRAFT";

    await prisma.seoLandingPage.update({
      where: { id },
      data: { workflowState: newState },
    });

    revalidatePath("/destinations");
    revalidatePath(`/destinations/${existing.slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/destinations");
    revalidatePath(`/admin/destinations/${id}`);

    return { success: true, data: { id, workflowState: newState } };
  } catch (error) {
    console.error("Error toggling destination publish state:", error);
    return { success: false, error: "Failed to update destination publish state." };
  }
}

/**
 * Server Action: Create a new Place.
 */
export async function createPlaceAction(
  input: PlaceFormInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    const name = (input.name || "").trim();
    if (name.length < 2) {
      return { success: false, error: "Place name must be at least 2 characters." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(name);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    const existing = await prisma.place.findUnique({
      where: { slug: rawSlug },
      select: { id: true },
    });
    if (existing) {
      return { success: false, error: `A place with slug "${rawSlug}" already exists.` };
    }

    const newPlace = await prisma.place.create({
      data: {
        name,
        slug: rawSlug,
        description: input.description?.trim() || null,
        imageUrl: input.imageUrl?.trim() || null,
        destination: input.destination?.trim() || null,
        status: input.status || "ACTIVE",
      },
      select: { id: true, slug: true },
    });

    revalidatePath("/destinations");
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/destinations");

    return { success: true, data: { id: newPlace.id, slug: newPlace.slug } };
  } catch (error) {
    console.error("Error creating place:", error);
    return { success: false, error: "Failed to create place." };
  }
}

/**
 * Server Action: Update an existing Place.
 */
export async function updatePlaceAction(
  id: string,
  input: PlaceFormInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || id.trim() === "") {
      return { success: false, error: "Invalid Place ID." };
    }

    const existing = await prisma.place.findUnique({
      where: { id },
      include: {
        destinationPlaces: {
          include: {
            destination: { select: { slug: true } },
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Place not found." };
    }

    const name = (input.name || "").trim();
    if (name.length < 2) {
      return { success: false, error: "Place name must be at least 2 characters." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(name);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    if (rawSlug !== existing.slug) {
      const collision = await prisma.place.findUnique({
        where: { slug: rawSlug },
        select: { id: true },
      });
      if (collision && collision.id !== id) {
        return { success: false, error: `A place with slug "${rawSlug}" already exists.` };
      }
    }

    await prisma.place.update({
      where: { id },
      data: {
        name,
        slug: rawSlug,
        description: input.description?.trim() || null,
        imageUrl: input.imageUrl?.trim() || null,
        destination: input.destination?.trim() || null,
        status: input.status || "ACTIVE",
      },
    });

    // Revalidate parent destinations and child routes
    for (const dp of existing.destinationPlaces) {
      const destSlug = dp.destination.slug;
      if (destSlug) {
        revalidatePath(`/destinations/${destSlug}`);
        revalidatePath(`/destinations/${destSlug}/${existing.slug}`);
        if (rawSlug !== existing.slug) {
          revalidatePath(`/destinations/${destSlug}/${rawSlug}`);
        }
      }
    }
    revalidatePath("/destinations");
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/destinations");

    return { success: true, data: { id, slug: rawSlug } };
  } catch (error) {
    console.error("Error updating place:", error);
    return { success: false, error: "Failed to update place." };
  }
}

/**
 * Server Action: Activate or Deactivate a Place.
 */
export async function togglePlaceActiveAction(
  id: string,
  active: boolean
): Promise<ActionResult<{ id: string; status: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || id.trim() === "") {
      return { success: false, error: "Invalid Place ID." };
    }

    const existing = await prisma.place.findUnique({
      where: { id },
      include: {
        destinationPlaces: {
          include: {
            destination: { select: { slug: true } },
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Place not found." };
    }

    const newStatus = active ? "ACTIVE" : "INACTIVE";

    await prisma.place.update({
      where: { id },
      data: { status: newStatus },
    });

    for (const dp of existing.destinationPlaces) {
      const destSlug = dp.destination.slug;
      if (destSlug) {
        revalidatePath(`/destinations/${destSlug}`);
        revalidatePath(`/destinations/${destSlug}/${existing.slug}`);
      }
    }
    revalidatePath("/destinations");
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/destinations");

    return { success: true, data: { id, status: newStatus } };
  } catch (error) {
    console.error("Error toggling place active status:", error);
    return { success: false, error: "Failed to update place active status." };
  }
}

/**
 * Server Action: Assign an existing Place to a Destination.
 * Prevents duplicate relations and validates existence.
 */
export async function assignPlaceToDestinationAction(
  destinationId: string,
  placeId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    const [destination, place] = await Promise.all([
      prisma.seoLandingPage.findUnique({
        where: { id: destinationId },
        select: { id: true, slug: true, type: true },
      }),
      prisma.place.findUnique({
        where: { id: placeId },
        select: { id: true, slug: true },
      }),
    ]);

    if (!destination || destination.type !== "DESTINATION") {
      return { success: false, error: "Destination not found." };
    }
    if (!place) {
      return { success: false, error: "Place not found." };
    }

    // Check for duplicate relation
    const existingRelation = await prisma.destinationPlace.findUnique({
      where: {
        destinationId_placeId: {
          destinationId,
          placeId,
        },
      },
    });

    if (existingRelation) {
      return { success: false, error: "This place is already linked to the destination." };
    }

    // Find highest displayOrder
    const last = await prisma.destinationPlace.findFirst({
      where: { destinationId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    const displayOrder = (last?.displayOrder ?? -1) + 1;

    const relation = await prisma.destinationPlace.create({
      data: {
        destinationId,
        placeId,
        displayOrder,
      },
    });

    revalidatePath("/destinations");
    revalidatePath(`/destinations/${destination.slug}`);
    revalidatePath(`/destinations/${destination.slug}/${place.slug}`);
    revalidatePath(`/admin/destinations/${destinationId}`);

    return { success: true, data: { id: relation.id } };
  } catch (error) {
    console.error("Error assigning place to destination:", error);
    return { success: false, error: "Failed to assign place to destination." };
  }
}

/**
 * Server Action: Remove a Place from a Destination.
 * Deletes the DestinationPlace join record ONLY; preserves the underlying Place.
 */
export async function removePlaceFromDestinationAction(
  destinationId: string,
  placeId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    const [destination, place] = await Promise.all([
      prisma.seoLandingPage.findUnique({
        where: { id: destinationId },
        select: { slug: true },
      }),
      prisma.place.findUnique({
        where: { id: placeId },
        select: { slug: true },
      }),
    ]);

    await prisma.destinationPlace.deleteMany({
      where: {
        destinationId,
        placeId,
      },
    });

    if (destination?.slug) {
      revalidatePath("/destinations");
      revalidatePath(`/destinations/${destination.slug}`);
      if (place?.slug) {
        revalidatePath(`/destinations/${destination.slug}/${place.slug}`);
      }
    }
    revalidatePath(`/admin/destinations/${destinationId}`);

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error removing place from destination:", error);
    return { success: false, error: "Failed to remove place from destination." };
  }
}

/**
 * Server Action: Reorder Places in a Destination.
 */
export async function reorderDestinationPlacesAction(
  destinationId: string,
  placeIds: string[]
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    const destination = await prisma.seoLandingPage.findUnique({
      where: { id: destinationId },
      select: { slug: true },
    });

    if (!destination) {
      return { success: false, error: "Destination not found." };
    }

    await prisma.$transaction([
      prisma.destinationPlace.deleteMany({
        where: { destinationId },
      }),
      prisma.destinationPlace.createMany({
        data: placeIds.map((placeId, index) => ({
          destinationId,
          placeId,
          displayOrder: index,
        })),
      }),
    ]);

    if (destination.slug) {
      revalidatePath("/destinations");
      revalidatePath(`/destinations/${destination.slug}`);
    }
    revalidatePath(`/admin/destinations/${destinationId}`);

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error reordering destination places:", error);
    return { success: false, error: "Failed to reorder places." };
  }
}
