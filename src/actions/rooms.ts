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
        priceEP: data.priceEP ?? null,
        priceCP: data.priceCP ?? null,
        priceMAP: data.priceMAP ?? null,
        extraBedPriceEP: data.extraBedPriceEP ?? null,
        extraBedPriceCP: data.extraBedPriceCP ?? null,
        extraBedPriceMAP: data.extraBedPriceMAP ?? null,
        childNoBedPriceEP: data.childNoBedPriceEP ?? null,
        childNoBedPriceCP: data.childNoBedPriceCP ?? null,
        childNoBedPriceMAP: data.childNoBedPriceMAP ?? null,
      }
    });

    revalidatePath("/partner", "layout");
    return { success: true, roomType };
  } catch (error) {
    console.error("Error adding room type:", error);
    return { success: false, error: "Failed to add room type" };
  }
}

// Update an existing Room Type
export async function updateRoomType(id: string, data: any) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Verify ownership (the vendor must own the property this room belongs to)
    const existing = await prisma.roomType.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            vendorProfile: true
          }
        }
      }
    });

    if (!existing || existing.property.vendorProfile.userId !== userId) {
      return { success: false, error: "Room type not found or access denied." };
    }

    const roomType = await prisma.roomType.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        capacity: data.capacity,
        totalUnits: data.totalUnits,
        priceEP: data.priceEP ?? null,
        priceCP: data.priceCP ?? null,
        priceMAP: data.priceMAP ?? null,
        extraBedPriceEP: data.extraBedPriceEP ?? null,
        extraBedPriceCP: data.extraBedPriceCP ?? null,
        extraBedPriceMAP: data.extraBedPriceMAP ?? null,
        childNoBedPriceEP: data.childNoBedPriceEP ?? null,
        childNoBedPriceCP: data.childNoBedPriceCP ?? null,
        childNoBedPriceMAP: data.childNoBedPriceMAP ?? null,
      }
    });

    revalidatePath("/partner", "layout");
    return { success: true, roomType };
  } catch (error) {
    console.error("Error updating room type:", error);
    return { success: false, error: "Failed to update room type" };
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
