"use server";

import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

let isEnsured = false;

async function ensureColumnsExist() {
  if (isEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        BEGIN
          ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "priceEP" DOUBLE PRECISION;
          ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "priceCP" DOUBLE PRECISION;
          ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "priceMAP" DOUBLE PRECISION;
          ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "extraBedPrice" DOUBLE PRECISION;
          ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "childNoBedPrice" DOUBLE PRECISION;
          ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "extraBedPriceEP" DOUBLE PRECISION;
          ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "extraBedPriceCP" DOUBLE PRECISION;
          ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "extraBedPriceMAP" DOUBLE PRECISION;
          ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "childNoBedPriceEP" DOUBLE PRECISION;
          ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "childNoBedPriceCP" DOUBLE PRECISION;
          ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "childNoBedPriceMAP" DOUBLE PRECISION;
        EXCEPTION
          WHEN others THEN NULL;
        END;
      END $$;
    `);
    isEnsured = true;
  } catch (e) {
    console.error("Auto schema migration error:", e);
  }
}

// Add a new Room Type
export async function addRoomType(propertyId: string, data: any) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "Unauthorized. Please log in again." };

    if (!propertyId) {
      return { success: false, error: "Invalid Property ID." };
    }

    await ensureColumnsExist();

    const parseNum = (val: any) => {
      if (val === undefined || val === null || val === "") return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    const roomPayload = {
      propertyId,
      name: data.name || "Room",
      description: data.description || null,
      basePrice: Number(data.basePrice) || 0,
      capacity: Number(data.capacity) || 2,
      totalUnits: Number(data.totalUnits) || 1,
      priceEP: parseNum(data.priceEP),
      priceCP: parseNum(data.priceCP),
      priceMAP: parseNum(data.priceMAP),
      extraBedPriceEP: parseNum(data.extraBedPriceEP),
      extraBedPriceCP: parseNum(data.extraBedPriceCP),
      extraBedPriceMAP: parseNum(data.extraBedPriceMAP),
      childNoBedPriceEP: parseNum(data.childNoBedPriceEP),
      childNoBedPriceCP: parseNum(data.childNoBedPriceCP),
      childNoBedPriceMAP: parseNum(data.childNoBedPriceMAP),
      ...(data.extraBedPrice !== undefined && { extraBedPrice: parseNum(data.extraBedPrice) }),
      ...(data.childNoBedPrice !== undefined && { childNoBedPrice: parseNum(data.childNoBedPrice) }),
    };

    let roomType;
    try {
      roomType = await prisma.roomType.create({
        data: roomPayload
      });
    } catch (createErr: any) {
      // If column error, force migration and retry once
      isEnsured = false;
      await ensureColumnsExist();
      roomType = await prisma.roomType.create({
        data: roomPayload
      });
    }

    try {
      revalidatePath("/partner", "layout");
      revalidatePath("/stays", "layout");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return { success: true, roomType };
  } catch (error: any) {
    console.error("Error adding room type:", error);
    return { success: false, error: error?.message || "Failed to add room type" };
  }
}

// Update an existing Room Type
export async function updateRoomType(id: string, data: any) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "Unauthorized. Please log in again." };

    if (!id) {
      return { success: false, error: "Invalid Room Type ID." };
    }

    await ensureColumnsExist();

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

    const parseNum = (val: any) => {
      if (val === undefined || val === null || val === "") return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    const updatePayload = {
      name: data.name || "Room",
      description: data.description || null,
      basePrice: Number(data.basePrice) || 0,
      capacity: Number(data.capacity) || 2,
      totalUnits: Number(data.totalUnits) || 1,
      priceEP: parseNum(data.priceEP),
      priceCP: parseNum(data.priceCP),
      priceMAP: parseNum(data.priceMAP),
      extraBedPriceEP: parseNum(data.extraBedPriceEP),
      extraBedPriceCP: parseNum(data.extraBedPriceCP),
      extraBedPriceMAP: parseNum(data.extraBedPriceMAP),
      childNoBedPriceEP: parseNum(data.childNoBedPriceEP),
      childNoBedPriceCP: parseNum(data.childNoBedPriceCP),
      childNoBedPriceMAP: parseNum(data.childNoBedPriceMAP),
      ...(data.extraBedPrice !== undefined && { extraBedPrice: parseNum(data.extraBedPrice) }),
      ...(data.childNoBedPrice !== undefined && { childNoBedPrice: parseNum(data.childNoBedPrice) }),
    };

    let roomType;
    try {
      roomType = await prisma.roomType.update({
        where: { id },
        data: updatePayload
      });
    } catch (updateErr: any) {
      isEnsured = false;
      await ensureColumnsExist();
      roomType = await prisma.roomType.update({
        where: { id },
        data: updatePayload
      });
    }

    try {
      revalidatePath("/partner", "layout");
      revalidatePath("/stays", "layout");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return { success: true, roomType };
  } catch (error: any) {
    console.error("Error updating room type:", error);
    return { success: false, error: error?.message || "Failed to update room type" };
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
    await ensureColumnsExist();
    const roomTypes = await prisma.roomType.findMany({
      where: { propertyId },
      include: {
        inventories: true
      }
    });
    return { success: true, roomTypes };
  } catch (error: any) {
    console.error("Error fetching room types:", error);
    // If schema mismatch, force column creation and retry
    try {
      isEnsured = false;
      await ensureColumnsExist();
      const roomTypes = await prisma.roomType.findMany({
        where: { propertyId },
        include: {
          inventories: true
        }
      });
      return { success: true, roomTypes };
    } catch (fallbackError) {
      console.error("Fatal error fetching room types:", fallbackError);
      return { success: false, error: "Failed to fetch room types" };
    }
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

    try {
      revalidatePath("/partner", "layout");
      revalidatePath("/stays", "layout");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting room type:", error);
    return { success: false, error: "Failed to delete room type" };
  }
}
