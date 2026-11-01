"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";

export interface TravelStyleInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  isActive?: boolean;
  displayOrder?: number;
  assignedTourIds?: string[];
}

export async function getTravelStylesAdmin() {
  try {
    const styles = await prisma.travelStyle.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        tours: {
          include: {
            tour: {
              select: {
                id: true,
                title: true,
                slug: true,
                isLive: true,
                duration: true,
                price: true,
                images: true,
              },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
        _count: {
          select: {
            tours: {
              where: {
                tour: {
                  isLive: true,
                },
              },
            },
          },
        },
      },
    });

    return styles;
  } catch (error) {
    console.error("Failed to fetch travel styles for admin:", error);
    return [];
  }
}

export async function getAllToursForSelect() {
  try {
    return await prisma.tour.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isLive: true,
        duration: true,
      },
      orderBy: { title: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch tours for select:", error);
    return [];
  }
}

export async function createTravelStyle(data: TravelStyleInput) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Name is required" };
    }

    const rawSlug = data.slug && data.slug.trim() ? data.slug : data.name;
    const slug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const existing = await prisma.travelStyle.findFirst({
      where: {
        OR: [{ name: { equals: data.name.trim(), mode: "insensitive" } }, { slug }],
      },
    });

    if (existing) {
      return { success: false, error: "A travel style with this name or slug already exists" };
    }

    // Determine max display order if not specified
    let displayOrder = data.displayOrder ?? 0;
    if (displayOrder === 0) {
      const maxOrder = await prisma.travelStyle.aggregate({
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder || 0) + 1;
    }

    const style = await prisma.travelStyle.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || "",
        imageUrl: data.imageUrl?.trim() || null,
        imageAlt: data.imageAlt?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        displayOrder,
        tours: data.assignedTourIds?.length
          ? {
              create: data.assignedTourIds.map((tourId, idx) => ({
                tourId,
                displayOrder: idx + 1,
              })),
            }
          : undefined,
      },
    });

    revalidatePath("/tours");
    revalidatePath(`/tours/${slug}`);
    revalidatePath("/");
    revalidatePath("/wander-admin");

    return { success: true, travelStyle: style };
  } catch (error: any) {
    console.error("Failed to create travel style:", error);
    return { success: false, error: error.message || "Failed to create travel style" };
  }
}

export async function updateTravelStyle(id: string, data: TravelStyleInput) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const current = await prisma.travelStyle.findUnique({
      where: { id },
    });
    if (!current) {
      return { success: false, error: "Travel style not found" };
    }

    const rawSlug = data.slug && data.slug.trim() ? data.slug : data.name || current.slug;
    const slug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Check slug collision with other styles
    if (slug !== current.slug) {
      const collision = await prisma.travelStyle.findFirst({
        where: { slug, id: { not: id } },
      });
      if (collision) {
        return { success: false, error: "Slug is already used by another travel style" };
      }
    }

    // Sync tours if assignedTourIds is provided
    if (data.assignedTourIds !== undefined) {
      await prisma.tourTravelStyle.deleteMany({
        where: { travelStyleId: id },
      });

      if (data.assignedTourIds.length > 0) {
        await prisma.tourTravelStyle.createMany({
          data: data.assignedTourIds.map((tourId, idx) => ({
            tourId,
            travelStyleId: id,
            displayOrder: idx + 1,
          })),
        });
      }
    }

    const updated = await prisma.travelStyle.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        slug,
        description: data.description !== undefined ? data.description.trim() : undefined,
        imageUrl: data.imageUrl !== undefined ? (data.imageUrl.trim() || null) : undefined,
        imageAlt: data.imageAlt !== undefined ? (data.imageAlt.trim() || null) : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        displayOrder: data.displayOrder !== undefined ? data.displayOrder : undefined,
      },
    });

    revalidatePath("/tours");
    revalidatePath(`/tours/${current.slug}`);
    revalidatePath(`/tours/${slug}`);
    revalidatePath("/");
    revalidatePath("/wander-admin");

    return { success: true, travelStyle: updated };
  } catch (error: any) {
    console.error("Failed to update travel style:", error);
    return { success: false, error: error.message || "Failed to update travel style" };
  }
}

export async function deleteTravelStyle(id: string, forceHardDelete: boolean = false) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const current = await prisma.travelStyle.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tours: true },
        },
      },
    });

    if (!current) {
      return { success: false, error: "Travel style not found" };
    }

    // Safe archive pattern if style has linked tours or was active
    if (!forceHardDelete && (current._count.tours > 0 || current.isActive)) {
      await prisma.travelStyle.update({
        where: { id },
        data: { isActive: false },
      });

      revalidatePath("/tours");
      revalidatePath(`/tours/${current.slug}`);
      revalidatePath("/");
      revalidatePath("/wander-admin");

      return {
        success: true,
        archived: true,
        message: "Travel style has assigned tours or was live; it was safely deactivated (archived) to preserve URLs and tour associations.",
      };
    }

    // Hard delete only if zero tours or forced
    await prisma.tourTravelStyle.deleteMany({
      where: { travelStyleId: id },
    });

    await prisma.travelStyle.delete({
      where: { id },
    });

    revalidatePath("/tours");
    revalidatePath(`/tours/${current.slug}`);
    revalidatePath("/");
    revalidatePath("/wander-admin");

    return { success: true, archived: false, message: "Travel style deleted successfully." };
  } catch (error: any) {
    console.error("Failed to delete travel style:", error);
    return { success: false, error: error.message || "Failed to delete travel style" };
  }
}

export async function toggleTravelStyleStatus(id: string) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const current = await prisma.travelStyle.findUnique({ where: { id } });
    if (!current) return { success: false, error: "Travel style not found" };

    const updated = await prisma.travelStyle.update({
      where: { id },
      data: { isActive: !current.isActive },
    });

    revalidatePath("/tours");
    revalidatePath(`/tours/${current.slug}`);
    revalidatePath("/");
    revalidatePath("/wander-admin");

    return { success: true, isActive: updated.isActive };
  } catch (error: any) {
    console.error("Failed to toggle status:", error);
    return { success: false, error: error.message || "Failed to toggle status" };
  }
}

export async function reorderTravelStyles(items: { id: string; displayOrder: number }[]) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.travelStyle.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    revalidatePath("/tours");
    revalidatePath("/");
    revalidatePath("/wander-admin");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to reorder travel styles:", error);
    return { success: false, error: error.message || "Failed to reorder" };
  }
}
