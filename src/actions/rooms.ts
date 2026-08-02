"use server";

import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Add a new Room Type
export async function addRoomType(propertyId: string, data: any) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const roomType = await prisma.roomType.create({
      data: {
        propertyId,
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        capacity: data.capacity,
        totalUnits: data.totalUnits,
      }
    });

    revalidatePath("/partner", "layout");
    return { success: true, roomType };
  } catch (error) {
    console.error("Error adding room type:", error);
    return { success: false, error: "Failed to add room type" };
  }
}

// Update Room Inventory (Calendar logic)
export async function updateRoomInventory(roomTypeId: string, dateStr: string, available: number, priceOverride?: number) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const date = new Date(dateStr);

    const inventory = await prisma.roomInventory.upsert({
      where: {
        roomTypeId_date: {
          roomTypeId,
          date
        }
      },
      update: {
        available,
        priceOverride: priceOverride || null
      },
      create: {
        roomTypeId,
        date,
        available,
        priceOverride: priceOverride || null
      }
    });

    return { success: true, inventory };
  } catch (error) {
    console.error("Error updating inventory:", error);
    return { success: false, error: "Failed to update inventory" };
  }
}

// Get Room Types for a Property
export async function getRoomTypes(propertyId: string) {
  try {
    const roomTypes = await prisma.roomType.findMany({
      where: { propertyId },
      include: {
        inventories: true
      }
    });
    return { success: true, roomTypes };
  } catch (error) {
    console.error("Error fetching room types:", error);
    return { success: false, error: "Failed to fetch room types" };
  }
}

// Delete a Room Type
export async function deleteRoomType(id: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.roomType.delete({
      where: { id }
    });

    revalidatePath("/partner", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error deleting room type:", error);
    return { success: false, error: "Failed to delete room type" };
  }
}
