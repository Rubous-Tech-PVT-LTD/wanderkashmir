"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export interface TourCategoryFormInput {
  name: string;
  slug?: string;
  description?: string | null;
  showInFilter?: boolean;
  displayOrder?: number;
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
 * Server Action: Create a new Tour Category.
 * Strict admin session and ADMIN role verification enforced.
 */
export async function createTourCategoryAction(
  input: TourCategoryFormInput
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    const name = (input.name || "").trim();
    if (name.length < 2) {
      return { success: false, error: "Category name must be at least 2 characters." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(name);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    // 1. Verify uniqueness of name and slug
    const existing = await prisma.tourCategory.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slug: rawSlug },
        ],
      },
      select: { id: true, name: true, slug: true },
    });

    if (existing) {
      if (existing.name.toLowerCase() === name.toLowerCase()) {
        return { success: false, error: `A category named "${name}" already exists.` };
      }
      return { success: false, error: `A category with the slug "${rawSlug}" already exists.` };
    }

    const showInFilter = input.showInFilter !== undefined ? !!input.showInFilter : true;
    let displayOrder = input.displayOrder !== undefined ? Number(input.displayOrder) : 0;
    if (input.displayOrder === undefined || isNaN(displayOrder) || displayOrder <= 0) {
      const maxOrderCat = await prisma.tourCategory.findFirst({
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      });
      displayOrder = (maxOrderCat?.displayOrder || 0) + 1;
    }

    // 2. Create in DB
    const category = await prisma.tourCategory.create({
      data: {
        name,
        slug: rawSlug,
        description: input.description ? input.description.trim() : null,
        showInFilter,
        displayOrder,
      },
    });

    // 3. Targeted cache revalidation
    try {
      revalidatePath("/admin/tour-categories");
      revalidatePath("/admin/tours");
      revalidatePath("/admin/tours/new");
      revalidatePath("/tours");
    } catch {
      // Revalidation during non-HTTP tests
    }

    return {
      success: true,
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error creating tour category:", err);
    return { success: false, error: err.message || "Failed to create tour category." };
  }
}

/**
 * Server Action: Update an existing Tour Category.
 * Preserves Category ID, validates uniqueness, and updates legacy category string in tours if name changed.
 */
export async function updateTourCategoryAction(
  id: string,
  input: TourCategoryFormInput
): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Category ID is required." };
    }

    const name = (input.name || "").trim();
    if (name.length < 2) {
      return { success: false, error: "Category name must be at least 2 characters." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(name);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    // 1. Verify existence of target category
    const existing = await prisma.tourCategory.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, showInFilter: true, displayOrder: true },
    });

    if (!existing) {
      return { success: false, error: "Category not found." };
    }

    // 2. Check conflict with OTHER categories
    const duplicate = await prisma.tourCategory.findFirst({
      where: {
        id: { not: id },
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slug: rawSlug },
        ],
      },
      select: { id: true, name: true, slug: true },
    });

    if (duplicate) {
      if (duplicate.name.toLowerCase() === name.toLowerCase()) {
        return { success: false, error: `Another category named "${name}" already exists.` };
      }
      return { success: false, error: `Another category with slug "${rawSlug}" already exists.` };
    }

    const nameChanged = existing.name !== name;
    const showInFilter = input.showInFilter !== undefined ? !!input.showInFilter : existing.showInFilter;
    const displayOrder = input.displayOrder !== undefined && !isNaN(Number(input.displayOrder))
      ? Number(input.displayOrder)
      : existing.displayOrder;

    // 3. Execute update in transaction
    const updated = await prisma.$transaction(async (tx) => {
      const cat = await tx.tourCategory.update({
        where: { id },
        data: {
          name,
          slug: rawSlug,
          description: input.description ? input.description.trim() : null,
          showInFilter,
          displayOrder,
        },
      });

      // Synchronize legacy `category` string field on related tours to maintain data consistency
      if (nameChanged) {
        await tx.tour.updateMany({
          where: { categoryId: id },
          data: { category: name },
        });
      }

      return cat;
    });

    // 4. Targeted cache revalidation
    try {
      revalidatePath("/admin/tour-categories");
      revalidatePath("/admin/tours");
      revalidatePath(`/admin/tour-categories/${id}`);
      revalidatePath("/tours");
    } catch {
      // Revalidation during non-HTTP tests
    }

    return {
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
      },
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error updating tour category:", err);
    return { success: false, error: err.message || "Failed to update tour category." };
  }
}

/**
 * Server Action: Safely delete a Tour Category.
 * If the category is linked to tours, deletion is prevented UNLESS a valid replacement category is provided for reassignment.
 */
export async function deleteTourCategoryAction(
  id: string,
  reassignToCategoryId?: string | null
): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Category ID is required." };
    }

    // 1. Fetch category and linked tour count
    const category = await prisma.tourCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tours: true },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found." };
    }

    const toursCount = category._count.tours;

    // 2. Enforce relationship dependency check
    if (toursCount > 0) {
      if (!reassignToCategoryId || reassignToCategoryId === id) {
        return {
          success: false,
          error: `Cannot delete "${category.name}" because it is currently assigned to ${toursCount} tour package(s). Please reassign these tours to another category before deleting.`,
        };
      }

      // Verify destination category exists
      const targetCategory = await prisma.tourCategory.findUnique({
        where: { id: reassignToCategoryId },
        select: { id: true, name: true },
      });

      if (!targetCategory) {
        return {
          success: false,
          error: "Selected reassignment category does not exist.",
        };
      }

      // Reassign tours and delete category atomically
      await prisma.$transaction(async (tx) => {
        await tx.tour.updateMany({
          where: { categoryId: id },
          data: {
            categoryId: targetCategory.id,
            category: targetCategory.name,
          },
        });

        await tx.tourCategory.delete({
          where: { id },
        });
      });
    } else {
      // 0 linked tours: safe direct deletion
      await prisma.tourCategory.delete({
        where: { id },
      });
    }

    // 3. Targeted cache revalidation
    try {
      revalidatePath("/admin/tour-categories");
      revalidatePath("/admin/tours");
      revalidatePath("/admin/tours/new");
      revalidatePath("/tours");
    } catch {
      // Revalidation during non-HTTP tests
    }

    return { success: true, data: { deletedId: id } };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error deleting tour category:", err);
    return { success: false, error: err.message || "Failed to delete tour category." };
  }
}

/**
 * Server Action: Reassign unassigned tours to a target category.
 * Preserves V1 migration capability without breaking existing assignments.
 */
export async function assignUnassignedToursAction(
  targetCategoryId: string
): Promise<ActionResult<{ reassignedCount: number }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin session required." };
    }

    const targetCategory = await prisma.tourCategory.findUnique({
      where: { id: targetCategoryId },
      select: { id: true, name: true },
    });

    if (!targetCategory) {
      return { success: false, error: "Target category not found." };
    }

    const result = await prisma.tour.updateMany({
      where: { categoryId: null },
      data: {
        categoryId: targetCategory.id,
        category: targetCategory.name,
      },
    });

    try {
      revalidatePath("/admin/tour-categories");
      revalidatePath("/admin/tours");
      revalidatePath("/tours");
    } catch {
      // Revalidation
    }

    return {
      success: true,
      data: { reassignedCount: result.count },
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error assigning unassigned tours:", err);
    return { success: false, error: err.message || "Failed to assign unassigned tours." };
  }
}
