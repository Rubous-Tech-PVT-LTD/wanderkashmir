"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

interface MutationResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Common security validator: Ensures that an active, verified ADMIN session exists
 * and re-confirms the role and active non-banned state in the database before any mutation.
 */
async function verifyAdminAuth(): Promise<{ authorized: boolean; error?: string; adminId?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { authorized: false, error: "Unauthorized: Admin session required." };
  }

  if (session.role !== "ADMIN") {
    return { authorized: false, error: "Forbidden: Administrator role required." };
  }

  // Database verification prevents stale/forged JWT claims
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isBanned: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isBanned) {
    return { authorized: false, error: "Forbidden: Account is not an active administrator." };
  }

  return { authorized: true, adminId: dbUser.id };
}

function revalidateTaxiPaths() {
  revalidatePath("/admin/taxis");
  revalidatePath("/admin/taxis/pending");
  revalidatePath("/admin/taxis/live");
  revalidatePath("/wander-admin/taxis");
  revalidatePath("/taxis");
}

/**
 * Server Action: Approve Vehicle / Taxi Listing.
 * Transitions vehicle to isApproved: true, status: "LIVE", and clears rejectionReason.
 */
export async function approveVehicleAction(vehicleId: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!vehicleId || typeof vehicleId !== "string") {
      return { success: false, error: "Invalid Vehicle ID provided." };
    }

    // Re-fetch current vehicle state immediately before mutation
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, model: true, make: true, status: true, isApproved: true },
    });

    if (!vehicle) {
      return { success: false, error: "Vehicle not found." };
    }

    if (vehicle.isApproved && (vehicle.status === "LIVE" || vehicle.status === "APPROVED")) {
      return { success: false, error: "This vehicle is already approved and live." };
    }

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        isApproved: true,
        status: "LIVE",
        rejectionReason: null,
      },
    });

    revalidateTaxiPaths();
    return { success: true };
  } catch (error) {
    console.error("Error approving vehicle:", error);
    return { success: false, error: "Failed to approve vehicle." };
  }
}

/**
 * Server Action: Reject Vehicle Listing with required rejection reason.
 */
export async function rejectVehicleAction(vehicleId: string, reason: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!vehicleId || typeof vehicleId !== "string") {
      return { success: false, error: "Invalid Vehicle ID provided." };
    }

    if (!reason || !reason.trim()) {
      return { success: false, error: "A valid rejection reason is required." };
    }

    // Re-fetch current vehicle state
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, status: true },
    });

    if (!vehicle) {
      return { success: false, error: "Vehicle not found." };
    }

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        isApproved: false,
        status: "REJECTED",
        rejectionReason: reason.trim(),
      },
    });

    revalidateTaxiPaths();
    return { success: true };
  } catch (error) {
    console.error("Error rejecting vehicle:", error);
    return { success: false, error: "Failed to reject vehicle." };
  }
}

/**
 * Server Action: Suspend an active Vehicle Listing with required reason.
 */
export async function suspendVehicleAction(vehicleId: string, reason: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!vehicleId || typeof vehicleId !== "string") {
      return { success: false, error: "Invalid Vehicle ID provided." };
    }

    if (!reason || !reason.trim()) {
      return { success: false, error: "A suspension reason is required." };
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, status: true },
    });

    if (!vehicle) {
      return { success: false, error: "Vehicle not found." };
    }

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        isApproved: false,
        status: "SUSPENDED",
        rejectionReason: reason.trim(),
      },
    });

    revalidateTaxiPaths();
    return { success: true };
  } catch (error) {
    console.error("Error suspending vehicle:", error);
    return { success: false, error: "Failed to suspend vehicle." };
  }
}

/**
 * Server Action: Reactivate a Suspended Vehicle Listing.
 */
export async function reactivateVehicleAction(vehicleId: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!vehicleId || typeof vehicleId !== "string") {
      return { success: false, error: "Invalid Vehicle ID provided." };
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, status: true },
    });

    if (!vehicle) {
      return { success: false, error: "Vehicle not found." };
    }

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        isApproved: true,
        status: "LIVE",
        rejectionReason: null,
      },
    });

    revalidateTaxiPaths();
    return { success: true };
  } catch (error) {
    console.error("Error reactivating vehicle:", error);
    return { success: false, error: "Failed to reactivate vehicle." };
  }
}

/**
 * Server Action: Safely Delete a Vehicle Listing.
 * Verifies relational integrity before deleting. If connected to bookings or tour transports,
 * hard delete is blocked to protect database relational integrity.
 */
export async function deleteVehicleAction(vehicleId: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!vehicleId || typeof vehicleId !== "string") {
      return { success: false, error: "Invalid Vehicle ID provided." };
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        _count: {
          select: {
            bookings: true,
            tourTransports: true,
          },
        },
      },
    });

    if (!vehicle) {
      return { success: false, error: "Vehicle not found." };
    }

    if (vehicle._count.bookings > 0) {
      return {
        success: false,
        error: `Cannot delete vehicle: It has ${vehicle._count.bookings} associated booking(s). Please suspend this vehicle instead to preserve historical records.`,
      };
    }

    if (vehicle._count.tourTransports > 0) {
      return {
        success: false,
        error: `Cannot delete vehicle: It is linked to ${vehicle._count.tourTransports} tour transport itinerary segment(s). Please unassign it from tours or suspend the vehicle.`,
      };
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    revalidateTaxiPaths();
    return { success: true };
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return { success: false, error: "Failed to delete vehicle." };
  }
}

/**
 * Server Action: Create or Update TaxiRateCard.
 */
export async function upsertTaxiRateCardAction(data: {
  id?: string;
  place: string;
  rates: Record<string, number>;
}): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!data.place || !data.place.trim()) {
      return { success: false, error: "Route / Place name is required." };
    }

    const cleanRates: Record<string, number> = {};
    for (const [key, val] of Object.entries(data.rates || {})) {
      const num = Number(val);
      if (!isNaN(num) && num > 0) {
        cleanRates[key.toUpperCase()] = Math.round(num);
      }
    }

    if (Object.keys(cleanRates).length === 0) {
      return { success: false, error: "At least one valid vehicle rate must be specified." };
    }

    if (data.id) {
      const existing = await prisma.taxiRateCard.findUnique({ where: { id: data.id } });
      if (!existing) {
        return { success: false, error: "Rate card not found." };
      }

      await prisma.taxiRateCard.update({
        where: { id: data.id },
        data: {
          place: data.place.trim(),
          rates: cleanRates,
        },
      });
    } else {
      await prisma.taxiRateCard.create({
        data: {
          place: data.place.trim(),
          rates: cleanRates,
        },
      });
    }

    revalidateTaxiPaths();
    return { success: true };
  } catch (error) {
    console.error("Error upserting taxi rate card:", error);
    return { success: false, error: "Failed to save rate card." };
  }
}

/**
 * Server Action: Delete TaxiRateCard.
 */
export async function deleteTaxiRateCardAction(id: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid Rate Card ID provided." };
    }

    await prisma.taxiRateCard.delete({
      where: { id },
    });

    revalidateTaxiPaths();
    return { success: true };
  } catch (error) {
    console.error("Error deleting taxi rate card:", error);
    return { success: false, error: "Failed to delete rate card." };
  }
}
