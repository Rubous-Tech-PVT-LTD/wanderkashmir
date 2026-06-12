"use server";

import prisma from "@/lib/prisma";
import { getVendorSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addDriver(data: { name: string; phone: string; drivingLicense: string }) {
  try {
    const session = await getVendorSession();
    if (!session || session.role !== "VENDOR") {
      return { success: false, error: "Unauthorized" };
    }

    const vendorProfileId = session.vendorProfileId;
    if (!vendorProfileId) {
      return { success: false, error: "No vendor profile linked" };
    }

    const driver = await prisma.driver.create({
      data: {
        vendorProfileId,
        name: data.name,
        phone: data.phone,
        drivingLicense: data.drivingLicense,
        status: "ACTIVE"
      }
    });

    revalidatePath("/partner/dashboard");
    return { success: true, driver };
  } catch (error: any) {
    console.error("Failed to add driver", error);
    return { success: false, error: error.message };
  }
}

export async function addRateOverride(data: { routePlace: string; customPrice: number }) {
  try {
    const session = await getVendorSession();
    if (!session || session.role !== "VENDOR") {
      return { success: false, error: "Unauthorized" };
    }

    const vendorProfileId = session.vendorProfileId;
    if (!vendorProfileId) {
      return { success: false, error: "No vendor profile linked" };
    }

    const rateOverride = await prisma.taxiStandRateOverride.upsert({
      where: {
        vendorProfileId_routePlace: {
          vendorProfileId,
          routePlace: data.routePlace,
        }
      },
      update: {
        customPrice: data.customPrice
      },
      create: {
        vendorProfileId,
        routePlace: data.routePlace,
        customPrice: data.customPrice
      }
    });

    revalidatePath("/partner/dashboard");
    return { success: true, rateOverride };
  } catch (error: any) {
    console.error("Failed to add rate override", error);
    return { success: false, error: error.message };
  }
}

export async function assignDriverAndVehicle(bookingId: string, driverId: string, vehicleId: string) {
  try {
    const session = await getVendorSession();
    if (!session || session.role !== "VENDOR") {
      return { success: false, error: "Unauthorized" };
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverId,
        vehicleId,
        standApprovalStatus: "APPROVED"
      }
    });

    revalidatePath("/partner/dashboard");
    return { success: true, booking };
  } catch (error: any) {
    console.error("Failed to assign driver and vehicle", error);
    return { success: false, error: error.message };
  }
}
