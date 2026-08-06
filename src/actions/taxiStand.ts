"use server";

import prisma from "@/lib/prisma";
import { getVendorSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    revalidatePath("/partner", "layout");
    return { success: true, driver };
  } catch (error: any) {
    console.error("Failed to add driver", error);
    return { success: false, error: error.message };
  }
}

export async function updateDriver(driverId: string, data: { name: string; phone: string; drivingLicense: string }) {
  try {
    const session = await getVendorSession();
    if (!session || session.role !== "VENDOR") {
      return { success: false, error: "Unauthorized" };
    }

    const vendorProfileId = session.vendorProfileId;
    if (!vendorProfileId) return { success: false, error: "No vendor profile linked" };

    const existing = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!existing || existing.vendorProfileId !== vendorProfileId) {
      return { success: false, error: "Driver not found or access denied" };
    }

    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        name: data.name,
        phone: data.phone,
        drivingLicense: data.drivingLicense,
      }
    });

    revalidatePath("/partner", "layout");
    return { success: true, driver };
  } catch (error: any) {
    console.error("Failed to update driver", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDriver(driverId: string) {
  try {
    const session = await getVendorSession();
    if (!session || session.role !== "VENDOR") {
      return { success: false, error: "Unauthorized" };
    }

    const vendorProfileId = session.vendorProfileId;
    if (!vendorProfileId) return { success: false, error: "No vendor profile linked" };

    const existing = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!existing || existing.vendorProfileId !== vendorProfileId) {
      return { success: false, error: "Driver not found or access denied" };
    }

    await prisma.driver.delete({ where: { id: driverId } });

    revalidatePath("/partner", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete driver", error);
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

    revalidatePath("/partner", "layout");
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
      },
      include: {
        driver: true,
        vehicle: {
          include: { vendorProfile: true }
        },
        user: true
      }
    });

    // Send dispatch confirmation email to customer
    const customerEmail = booking.user?.email;
    if (customerEmail) {
        try {
          await resend.emails.send({
            from: 'WanderKashmir <support@wanderkashmir.com>',
            to: customerEmail,
            subject: `Taxi Dispatched: Your ride details for booking ${booking.id.slice(-6)}`,
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0f172a;">Hi ${booking.guestName || 'Traveler'},</h2>
                <p>Your taxi has been successfully dispatched for your upcoming trip!</p>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Driver Details</h3>
                  <p><strong>Name:</strong> ${booking.driver?.name || 'N/A'}</p>
                  <p><strong>Phone:</strong> ${booking.driver?.phone || 'N/A'}</p>
                  <h3 style="margin-bottom: 0;">Vehicle Details</h3>
                  <p><strong>Car:</strong> ${booking.vehicle?.make || ''} ${booking.vehicle?.model || ''}</p>
                  <p><strong>Registration:</strong> ${booking.vehicle?.registrationNum || 'N/A'}</p>
                  <p><strong>Stand:</strong> ${booking.vehicle?.vendorProfile?.businessName || 'N/A'}</p>
                </div>
                <p>Have a safe and wonderful journey!</p>
                <p>Best Regards,<br/><strong>The WanderKashmir Team</strong></p>
              </div>
            `
          });
        } catch (emailErr) {
          console.error("Failed to send dispatch email:", emailErr);
          // Don't fail the assignment if email fails
        }
      }

    revalidatePath("/partner", "layout");
    return { success: true, booking };
  } catch (error: any) {
    console.error("Failed to assign driver and vehicle", error);
    return { success: false, error: error.message };
  }
}
