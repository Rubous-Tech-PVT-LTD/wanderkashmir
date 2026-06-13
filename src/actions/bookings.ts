"use server";

import prisma from "@/lib/prisma";

export async function getVendorBookings(vendorProfileId: string, vendorType: string) {
  try {
    let whereClause = {};

    if (vendorType === "HOTEL" || vendorType === "HOMESTAY") {
      whereClause = { property: { vendorProfileId } };
    } else if (vendorType === "TAXI") {
      whereClause = { vehicle: { vendorProfileId } };
    } else if (vendorType === "GUIDE") {
      whereClause = { guideProfile: { vendorProfileId } };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        property: { select: { name: true } },
        vehicle: { select: { make: true, model: true } },
        guideProfile: { select: { id: true } }, // guide doesn't have a name inside profile, we get it from VendorProfile via user if needed
      }
    });

    return { success: true, bookings };
  } catch (error: any) {
    console.error("Error fetching vendor bookings:", error);
    return { success: false, error: error.message };
  }
}
