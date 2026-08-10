"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTourCategories() {
  try {
    return await prisma.tourCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { tours: true }
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch tour categories:", error);
    return [];
  }
}

export async function createTourCategory(data: { name: string; description?: string }) {
  try {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = await prisma.tourCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
    });
    revalidatePath("/tours");
    revalidatePath("/wander-admin");
    return { success: true, category };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTourCategory(id: string, data: { name: string; description?: string }) {
  try {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = await prisma.tourCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
    });
    
    // Also update legacy `category` string field in all related tours to maintain backward compatibility for now
    await prisma.tour.updateMany({
      where: { categoryId: id },
      data: { category: data.name }
    });
    
    revalidatePath("/tours");
    revalidatePath("/wander-admin");
    return { success: true, category };
  } catch (error: any) {
    console.error("Failed to update category:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTourCategory(id: string) {
  try {
    // Optional: unlink tours first or let onDelete Cascade handle it if we set it (we didn't, so it might throw if linked)
    // To be safe, we just disconnect or nullify
    await prisma.tour.updateMany({
      where: { categoryId: id },
      data: { categoryId: null }
    });
    
    await prisma.tourCategory.delete({
      where: { id },
    });
    revalidatePath("/tours");
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { success: false, error: error.message };
  }
}

export async function migrateExistingToursToCategory(categoryId: string, categoryName: string) {
  try {
    // Find all tours that don't have a categoryId assigned yet
    const tours = await prisma.tour.findMany({
      where: { categoryId: null }
    });
    
    if (tours.length === 0) {
      return { success: true, count: 0, message: "No tours found without a category." };
    }
    
    await prisma.tour.updateMany({
      where: { categoryId: null },
      data: { 
        categoryId: categoryId,
        category: categoryName
      }
    });
    
    revalidatePath("/tours");
    revalidatePath("/wander-admin");
    return { success: true, count: tours.length, message: `Successfully moved ${tours.length} packages to ${categoryName}.` };
  } catch (error: any) {
    console.error("Failed to migrate tours:", error);
    return { success: false, error: error.message };
  }
}

export async function getToursByCategory(categoryId: string) {
  try {
    return await prisma.tour.findMany({
      where: { categoryId },
      select: { id: true, title: true, price: true, duration: true, isLive: true },
      orderBy: { createdAt: "desc" }
    });
  } catch (error: any) {
    console.error("Failed to fetch tours for category:", error);
    return [];
  }
}
