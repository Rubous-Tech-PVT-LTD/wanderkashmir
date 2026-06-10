"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getPayoutsSummary() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.role !== "ADMIN") return { success: false, error: "Forbidden" };

    // Fetch all vendors who have confirmed bookings
    const vendors = await prisma.vendorProfile.findMany({
      include: {
        properties: {
          include: {
            bookings: {
              where: { status: "CONFIRMED" }
            }
          }
        },
        vehicles: {
          include: {
            bookings: {
              where: { status: "CONFIRMED" }
            }
          }
        },
        guideProfiles: {
          include: {
            bookings: {
              where: { status: "CONFIRMED" }
            }
          }
        }
      }
    });

    const payouts = vendors.map(vendor => {
      let totalGenerated = 0;
      let pendingBalance = 0;
      let amountPaid = 0;

      // Sum from properties
      vendor.properties.forEach(prop => {
        prop.bookings.forEach(booking => {
          const amount = booking.baseAmount || booking.amount;
          const vendorShare = amount * 0.85; // 85% to vendor
          totalGenerated += amount;
          if (booking.hotelPayoutStatus === "PAID") {
            amountPaid += vendorShare;
          } else {
            pendingBalance += vendorShare;
          }
        });
      });

      // Sum from vehicles
      vendor.vehicles.forEach(vehicle => {
        vehicle.bookings.forEach(booking => {
          const amount = booking.taxiAmount || booking.amount;
          const vendorShare = amount * 0.85;
          totalGenerated += amount;
          if (booking.taxiPayoutStatus === "PAID") {
            amountPaid += vendorShare;
          } else {
            pendingBalance += vendorShare;
          }
        });
      });

      // Sum from guides
      vendor.guideProfiles.forEach(guide => {
        guide.bookings.forEach(booking => {
          const amount = booking.guideAmount || booking.amount;
          const vendorShare = amount * 0.90; // 90% to guides for example
          totalGenerated += amount;
          if (booking.guidePayoutStatus === "PAID") {
            amountPaid += vendorShare;
          } else {
            pendingBalance += vendorShare;
          }
        });
      });

      return {
        vendorId: vendor.id,
        businessName: vendor.businessName,
        accountHolderName: vendor.accountHolderName,
        bankName: vendor.bankName,
        accountNumber: vendor.accountNumber,
        ifscCode: vendor.ifscCode,
        totalGenerated,
        totalEarnings: totalGenerated * 0.85,
        amountPaid,
        pendingBalance
      };
    }).filter(p => p.totalGenerated > 0); // Only show vendors who generated revenue

    return { success: true, payouts };
  } catch (error) {
    console.error("Error fetching payouts summary:", error);
    return { success: false, error: "Failed to fetch payouts summary." };
  }
}

export async function markVendorPaid(vendorId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.role !== "ADMIN") return { success: false, error: "Forbidden" };

    // Find all properties and vehicles for this vendor
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: {
        properties: { select: { id: true } },
        vehicles: { select: { id: true } },
        guideProfiles: { select: { id: true } }
      }
    });

    if (!vendor) return { success: false, error: "Vendor not found" };

    const propertyIds = vendor.properties.map(p => p.id);
    const vehicleIds = vendor.vehicles.map(v => v.id);

    // Update all pending bookings for properties
    if (propertyIds.length > 0) {
      await prisma.booking.updateMany({
        where: {
          propertyId: { in: propertyIds },
          status: "CONFIRMED",
          hotelPayoutStatus: "PENDING"
        },
        data: { hotelPayoutStatus: "PAID" }
      });
    }

    // Update all pending bookings for vehicles
    if (vehicleIds.length > 0) {
      await prisma.booking.updateMany({
        where: {
          vehicleId: { in: vehicleIds },
          status: "CONFIRMED",
          taxiPayoutStatus: "PENDING"
        },
        data: { taxiPayoutStatus: "PAID" }
      });
    }

    // Update all pending bookings for guides
    const guideIds = vendor.guideProfiles.map(g => g.id);
    if (guideIds.length > 0) {
      await prisma.booking.updateMany({
        where: {
          guideProfileId: { in: guideIds },
          status: "CONFIRMED",
          guidePayoutStatus: "PENDING"
        },
        data: { guidePayoutStatus: "PAID" }
      });
    }

    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Error marking vendor paid:", error);
    return { success: false, error: "Failed to mark vendor paid." };
  }
}
