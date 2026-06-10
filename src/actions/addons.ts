"use server";

import prisma from "@/lib/prisma";

export async function getAvailableAddons() {
  try {
    // Fetch approved Taxis
    const taxis = await prisma.vehicle.findMany({
      where: {
        isApproved: true,
        status: "ACTIVE",
      },
      select: {
        id: true,
        make: true,
        model: true,
        type: true,
        vendorProfileId: true,
        vendorProfile: {
          select: { businessName: true }
        }
      }
    });

    // Fetch approved Guides
    const guides = await prisma.guideProfile.findMany({
      where: {
        isApproved: true,
        status: "ACTIVE",
      },
      select: {
        id: true,
        languages: true,
        pricePerDay: true,
        vendorProfileId: true,
        vendorProfile: {
          select: { businessName: true }
        }
      }
    });

    return { success: true, taxis, guides };
  } catch (error: any) {
    console.error("Error fetching addons:", error);
    return { success: false, error: error.message };
  }
}
