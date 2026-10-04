"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export interface ExperienceFormInput {
  title: string;
  slug: string;
  destination: string;
  duration?: string | null;
  basePrice?: number | null;
  status: "ACTIVE" | "INACTIVE";
  description: string;
  images: string[];
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
 * Common security validator: Ensures that an active, verified ADMIN session exists
 * and re-confirms the role and active non-banned state in the database before any mutation.
 */
async function verifyAdminAuth(): Promise<{ authorized: boolean; error?: string; adminId?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { authorized: false, error: "Unauthorized: Admin session required." };
  }

  if (session.role !== "ADMIN") {
    return { authorized: false, error: "Forbidden: Administrator privileges required." };
  }

  // Database verification prevents stale/forged JWT claims
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isBanned: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isBanned) {
    return { authorized: false, error: "Forbidden: Account is not an active administrator." };
  }

  return { authorized: true, adminId: dbUser.id };
}

/**
 * Server Action: Create a new production Experience.
 * Authenticated Admin required. Protected with strict server validation.
 */
export async function createExperienceAction(
  input: ExperienceFormInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const title = (input.title || "").trim();
    if (title.length < 2) {
      return { success: false, error: "Experience title must be at least 2 characters." };
    }

    const destination = (input.destination || "").trim();
    if (destination.length < 2) {
      return { success: false, error: "Destination must be at least 2 characters." };
    }

    const description = (input.description || "").trim();
    if (description.length < 5) {
      return { success: false, error: "Description must be at least 5 characters." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(title);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    // 1. Check uniqueness of slug
    const existing = await prisma.experience.findUnique({
      where: { slug: rawSlug },
      select: { id: true, slug: true },
    });

    if (existing) {
      return { success: false, error: `An experience with slug "${rawSlug}" already exists.` };
    }

    // 2. Validate price
    let parsedPrice: number | null = null;
    if (input.basePrice !== undefined && input.basePrice !== null && !isNaN(Number(input.basePrice))) {
      parsedPrice = Math.max(0, Number(input.basePrice));
    }

    // 3. Clean images array
    const cleanImages = Array.isArray(input.images)
      ? input.images.map((img) => img.trim()).filter((img) => img.length > 0)
      : [];

    // 4. Status validation
    const status = input.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

    // 5. Create experience record
    const newExperience = await prisma.experience.create({
      data: {
        title,
        slug: rawSlug,
        destination,
        description,
        duration: input.duration?.trim() || null,
        basePrice: parsedPrice,
        status,
        images: cleanImages,
      },
    });

    // 6. Public revalidation
    try {
      revalidatePath("/experiences");
      revalidatePath(`/experiences/${newExperience.slug}`);
      revalidatePath("/admin/experiences");
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation warning after createExperience:", e);
    }

    return {
      success: true,
      data: {
        id: newExperience.id,
        slug: newExperience.slug,
      },
    };
  } catch (error) {
    console.error("Error creating experience:", error);
    return {
      success: false,
      error: "A database error occurred while creating the experience. Please verify inputs.",
    };
  }
}

/**
 * Server Action: Update an existing Experience.
 * Explicitly whitelists editable fields. Protects id and system fields.
 */
export async function updateExperienceAction(
  id: string,
  input: ExperienceFormInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid experience identifier." };
    }

    const currentExperience = await prisma.experience.findUnique({
      where: { id },
      include: {
        tourExperiences: {
          include: {
            tour: {
              select: { slug: true },
            },
          },
        },
      },
    });

    if (!currentExperience) {
      return { success: false, error: "Experience not found." };
    }

    const title = (input.title || "").trim();
    if (title.length < 2) {
      return { success: false, error: "Experience title must be at least 2 characters." };
    }

    const destination = (input.destination || "").trim();
    if (destination.length < 2) {
      return { success: false, error: "Destination must be at least 2 characters." };
    }

    const description = (input.description || "").trim();
    if (description.length < 5) {
      return { success: false, error: "Description must be at least 5 characters." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(title);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    // Slug uniqueness check against other records
    if (rawSlug !== currentExperience.slug) {
      const existingSlug = await prisma.experience.findUnique({
        where: { slug: rawSlug },
        select: { id: true },
      });
      if (existingSlug && existingSlug.id !== id) {
        return { success: false, error: `Slug "${rawSlug}" is already in use by another experience.` };
      }
    }

    let parsedPrice: number | null = null;
    if (input.basePrice !== undefined && input.basePrice !== null && !isNaN(Number(input.basePrice))) {
      parsedPrice = Math.max(0, Number(input.basePrice));
    }

    const cleanImages = Array.isArray(input.images)
      ? input.images.map((img) => img.trim()).filter((img) => img.length > 0)
      : [];

    const status = input.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: {
        title,
        slug: rawSlug,
        destination,
        description,
        duration: input.duration?.trim() || null,
        basePrice: parsedPrice,
        status,
        images: cleanImages,
      },
    });

    // Public revalidation
    try {
      revalidatePath("/experiences");
      revalidatePath(`/experiences/${currentExperience.slug}`);
      if (currentExperience.slug !== rawSlug) {
        revalidatePath(`/experiences/${rawSlug}`);
      }
      revalidatePath("/admin/experiences");
      revalidatePath(`/admin/experiences/${id}`);
      revalidatePath("/sitemap.xml");

      // Revalidate affected tour pages
      for (const te of currentExperience.tourExperiences) {
        if (te.tour?.slug) {
          revalidatePath(`/tours/${te.tour.slug}`);
        }
      }
    } catch (e) {
      console.warn("Revalidation warning after updateExperience:", e);
    }

    return {
      success: true,
      data: {
        id: updatedExperience.id,
        slug: updatedExperience.slug,
      },
    };
  } catch (error) {
    console.error("Error updating experience:", error);
    return {
      success: false,
      error: "A database error occurred while updating the experience.",
    };
  }
}

/**
 * Server Action: Activate / Deactivate an Experience.
 * Uses existing `status` field ("ACTIVE" | "INACTIVE").
 */
export async function toggleExperienceStatusAction(
  id: string,
  newStatus: "ACTIVE" | "INACTIVE"
): Promise<ActionResult<{ id: string; status: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        tourExperiences: {
          include: {
            tour: {
              select: { slug: true },
            },
          },
        },
      },
    });

    if (!experience) {
      return { success: false, error: "Experience not found." };
    }

    const updated = await prisma.experience.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, slug: true, status: true },
    });

    // Public revalidation
    try {
      revalidatePath("/experiences");
      revalidatePath(`/experiences/${experience.slug}`);
      revalidatePath("/admin/experiences");
      revalidatePath(`/admin/experiences/${id}`);
      revalidatePath("/sitemap.xml");

      for (const te of experience.tourExperiences) {
        if (te.tour?.slug) {
          revalidatePath(`/tours/${te.tour.slug}`);
        }
      }
    } catch (e) {
      console.warn("Revalidation warning after toggleExperienceStatus:", e);
    }

    return {
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
      },
    };
  } catch (error) {
    console.error("Error toggling experience status:", error);
    return {
      success: false,
      error: "Failed to update experience status.",
    };
  }
}

/**
 * Server Action: Assign an existing Tour to an Experience via TourExperience relation.
 * Tour records are strictly read-only and preserved.
 */
export async function assignTourToExperienceAction(input: {
  experienceId: string;
  tourId: string;
  isOptional?: boolean;
  dayNumber?: number | null;
  displayOrder?: number;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const { experienceId, tourId } = input;
    if (!experienceId || !tourId) {
      return { success: false, error: "Experience ID and Tour ID are required." };
    }

    // 1. Verify experience exists
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
      select: { id: true, slug: true },
    });
    if (!experience) {
      return { success: false, error: "Experience does not exist." };
    }

    // 2. Verify tour exists
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true, slug: true, title: true },
    });
    if (!tour) {
      return { success: false, error: "Selected Tour does not exist." };
    }

    // 3. Verify relation doesn't already exist
    const existingRelation = await prisma.tourExperience.findUnique({
      where: {
        tourId_experienceId: {
          tourId,
          experienceId,
        },
      },
    });
    if (existingRelation) {
      return { success: false, error: `This tour ("${tour.title}") is already linked to this experience.` };
    }

    // 4. Create join record
    const relation = await prisma.tourExperience.create({
      data: {
        tourId,
        experienceId,
        isOptional: !!input.isOptional,
        dayNumber: input.dayNumber ? Number(input.dayNumber) : null,
        displayOrder: input.displayOrder ? Number(input.displayOrder) : 0,
      },
    });

    // 5. Revalidation
    try {
      revalidatePath(`/experiences/${experience.slug}`);
      revalidatePath(`/tours/${tour.slug}`);
      revalidatePath(`/admin/experiences/${experienceId}`);
      revalidatePath("/admin/experiences");
    } catch (e) {
      console.warn("Revalidation warning after assignTourToExperience:", e);
    }

    return {
      success: true,
      data: { id: relation.id },
    };
  } catch (error) {
    console.error("Error assigning tour to experience:", error);
    return {
      success: false,
      error: "Failed to link tour to experience.",
    };
  }
}

/**
 * Server Action: Remove Tour relation from Experience.
 * CRITICAL SAFETY: Removes ONLY the TourExperience join record.
 * The underlying Tour record is NEVER modified or deleted.
 */
export async function removeTourFromExperienceAction(
  experienceId: string,
  tourId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!experienceId || !tourId) {
      return { success: false, error: "Both Experience ID and Tour ID are required." };
    }

    const relation = await prisma.tourExperience.findUnique({
      where: {
        tourId_experienceId: {
          tourId,
          experienceId,
        },
      },
      include: {
        experience: { select: { slug: true } },
        tour: { select: { slug: true } },
      },
    });

    if (!relation) {
      return { success: false, error: "Tour assignment relation not found." };
    }

    // Delete ONLY the join record
    await prisma.tourExperience.delete({
      where: {
        tourId_experienceId: {
          tourId,
          experienceId,
        },
      },
    });

    // Revalidate
    try {
      if (relation.experience?.slug) {
        revalidatePath(`/experiences/${relation.experience.slug}`);
      }
      if (relation.tour?.slug) {
        revalidatePath(`/tours/${relation.tour.slug}`);
      }
      revalidatePath(`/admin/experiences/${experienceId}`);
      revalidatePath("/admin/experiences");
    } catch (e) {
      console.warn("Revalidation warning after removeTourFromExperience:", e);
    }

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error removing tour from experience:", error);
    return {
      success: false,
      error: "Failed to remove tour link.",
    };
  }
}

/**
 * Server Action: Delete an Experience safely.
 * PARITY & SAFETY: Follows V1 behavior. Checks if assigned to any tours first.
 * If assigned (assignmentCount > 0), rejects deletion to preserve relational integrity.
 * If unassigned, deletes safely and revalidates public and admin caches.
 */
export async function deleteExperienceAction(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid experience identifier." };
    }

    // Immediately re-fetch the Experience before deletion to check existence and relational safety
    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tourExperiences: true },
        },
      },
    });

    if (!experience) {
      return { success: false, error: "Experience not found." };
    }

    // Relational safety check: strictly prevent deleting experiences assigned to tours
    if (experience._count.tourExperiences > 0) {
      return {
        success: false,
        error: `Cannot delete experience because it is assigned to ${experience._count.tourExperiences} tour(s). Please remove it from tours first or deactivate it instead.`,
      };
    }

    // Hard delete safely supported since no blocking relations exist
    await prisma.experience.delete({
      where: { id },
    });

    // Revalidate affected paths
    try {
      revalidatePath("/experiences");
      revalidatePath(`/experiences/${experience.slug}`);
      revalidatePath("/admin/experiences");
      revalidatePath("/wander-admin/experiences");
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation warning after deleteExperience:", e);
    }

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("Error deleting experience:", error);
    return {
      success: false,
      error: "A database error occurred while deleting the experience.",
    };
  }
}
