"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

interface MutationResult {
  success: boolean;
  error?: string;
  vendorId?: string;
}

/**
 * Common security validator: Ensures that an active, verified ADMIN session exists
 * and confirms the role in the database before any mutation can execute.
 */
async function verifyAdminAuth(): Promise<{ authorized: boolean; error?: string; adminId?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { authorized: false, error: "Unauthorized: Admin session required." };
  }

  if (session.role !== "ADMIN") {
    return { authorized: false, error: "Forbidden: Administrator role required." };
  }

  // Re-verify in database to avoid stale or tampered token payload
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isBanned: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isBanned) {
    return { authorized: false, error: "Forbidden: Account is not an active administrator." };
  }

  return { authorized: true, adminId: dbUser.id };
}

/**
 * Server Action: Approve a pending or inactive vendor.
 * Generates unique WK-XXXXX vendor ID if not already assigned.
 */
export async function approveVendorAction(vendorProfileId: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!vendorProfileId || typeof vendorProfileId !== "string") {
      return { success: false, error: "Invalid vendor ID provided." };
    }

    // Re-fetch vendor from database
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      select: { id: true, businessName: true, status: true, isApproved: true, vendorId: true },
    });

    if (!vendor) {
      return { success: false, error: "Vendor profile not found." };
    }

    if (vendor.isApproved && vendor.status === "APPROVED") {
      return { success: false, error: "Vendor is already approved and live." };
    }

    // Generate unique Vendor ID if not already present
    let assignedVendorId = vendor.vendorId;
    if (!assignedVendorId) {
      let uniqueFound = false;
      let attempts = 0;
      while (!uniqueFound && attempts < 10) {
        attempts++;
        const candidate = `WK-${Math.floor(10000 + Math.random() * 90000)}`;
        const existing = await prisma.vendorProfile.findUnique({ where: { vendorId: candidate } });
        if (!existing) {
          assignedVendorId = candidate;
          uniqueFound = true;
        }
      }
      if (!assignedVendorId) {
        assignedVendorId = `WK-${Date.now().toString().slice(-5)}`;
      }
    }

    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        isApproved: true,
        status: "APPROVED",
        rejectionReason: null,
        vendorId: assignedVendorId,
      },
    });

    revalidatePath("/admin/vendors");
    revalidatePath("/admin/vendors/pending");
    revalidatePath("/admin/vendors/live");
    revalidatePath("/wander-admin/vendors");
    revalidatePath("/wander-admin/vendors/pending");
    revalidatePath("/wander-admin/vendors/live");

    return { success: true, vendorId: assignedVendorId };
  } catch (error) {
    console.error("Error approving vendor:", error);
    return { success: false, error: "An unexpected error occurred while approving the vendor." };
  }
}

/**
 * Server Action: Reject a vendor application with required reason.
 */
export async function rejectVendorAction(vendorProfileId: string, reason: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!vendorProfileId || typeof vendorProfileId !== "string") {
      return { success: false, error: "Invalid vendor ID provided." };
    }

    const trimmedReason = (reason || "").trim();
    if (!trimmedReason || trimmedReason.length < 3) {
      return { success: false, error: "A detailed reason for rejection is required (minimum 3 characters)." };
    }

    // Re-fetch vendor from database
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      select: { id: true, status: true, isApproved: true },
    });

    if (!vendor) {
      return { success: false, error: "Vendor profile not found." };
    }

    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        isApproved: false,
        status: "REJECTED",
        rejectionReason: trimmedReason,
      },
    });

    revalidatePath("/admin/vendors");
    revalidatePath("/admin/vendors/pending");
    revalidatePath("/admin/vendors/rejected");
    revalidatePath("/wander-admin/vendors");
    revalidatePath("/wander-admin/vendors/pending");
    revalidatePath("/wander-admin/vendors/rejected");

    return { success: true };
  } catch (error) {
    console.error("Error rejecting vendor:", error);
    return { success: false, error: "An unexpected error occurred while rejecting the vendor." };
  }
}

/**
 * Server Action: Suspend an approved/live vendor with required reason.
 */
export async function suspendVendorAction(vendorProfileId: string, reason: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!vendorProfileId || typeof vendorProfileId !== "string") {
      return { success: false, error: "Invalid vendor ID provided." };
    }

    const trimmedReason = (reason || "").trim();
    if (!trimmedReason || trimmedReason.length < 3) {
      return { success: false, error: "A detailed reason for suspension is required (minimum 3 characters)." };
    }

    // Re-fetch vendor from database
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      select: { id: true, status: true, isApproved: true },
    });

    if (!vendor) {
      return { success: false, error: "Vendor profile not found." };
    }

    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        isApproved: false,
        status: "SUSPENDED",
        rejectionReason: trimmedReason,
      },
    });

    revalidatePath("/admin/vendors");
    revalidatePath("/admin/vendors/live");
    revalidatePath("/wander-admin/vendors");
    revalidatePath("/wander-admin/vendors/live");

    return { success: true };
  } catch (error) {
    console.error("Error suspending vendor:", error);
    return { success: false, error: "An unexpected error occurred while suspending the vendor." };
  }
}

/**
 * Server Action: Reactivate a rejected or suspended vendor.
 */
export async function reactivateVendorAction(vendorProfileId: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!vendorProfileId || typeof vendorProfileId !== "string") {
      return { success: false, error: "Invalid vendor ID provided." };
    }

    // Re-fetch vendor from database
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      select: { id: true, status: true, isApproved: true, vendorId: true },
    });

    if (!vendor) {
      return { success: false, error: "Vendor profile not found." };
    }

    // Generate unique Vendor ID if not already assigned
    let assignedVendorId = vendor.vendorId;
    if (!assignedVendorId) {
      assignedVendorId = `WK-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        isApproved: true,
        status: "APPROVED",
        rejectionReason: null,
        vendorId: assignedVendorId,
      },
    });

    revalidatePath("/admin/vendors");
    revalidatePath("/admin/vendors/live");
    revalidatePath("/admin/vendors/rejected");
    revalidatePath("/wander-admin/vendors");
    revalidatePath("/wander-admin/vendors/live");
    revalidatePath("/wander-admin/vendors/rejected");

    return { success: true, vendorId: assignedVendorId };
  } catch (error) {
    console.error("Error reactivating vendor:", error);
    return { success: false, error: "An unexpected error occurred while reactivating the vendor." };
  }
}
