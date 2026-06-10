"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// VENDOR MANAGEMENT
export async function suspendVendor(vendorId: string, reason: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.role !== "ADMIN") return { success: false, error: "Forbidden" };

    await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { status: "SUSPENDED", rejectionReason: reason, isApproved: false }
    });

    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Error suspending vendor:", error);
    return { success: false, error: "Failed to suspend vendor." };
  }
}

export async function activateVendor(vendorId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.role !== "ADMIN") return { success: false, error: "Forbidden" };

    await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { status: "APPROVED", rejectionReason: null, isApproved: true }
    });

    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Error activating vendor:", error);
    return { success: false, error: "Failed to activate vendor." };
  }
}

// LISTING MANAGEMENT
export async function suspendListing(listingId: string, type: 'PROPERTY' | 'VEHICLE', reason: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.role !== "ADMIN") return { success: false, error: "Forbidden" };

    if (type === 'PROPERTY') {
      await prisma.property.update({
        where: { id: listingId },
        data: { status: "SUSPENDED", rejectionReason: reason, isApproved: false }
      });
    } else {
      await prisma.vehicle.update({
        where: { id: listingId },
        data: { status: "SUSPENDED", rejectionReason: reason, isApproved: false }
      });
    }

    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Error suspending listing:", error);
    return { success: false, error: "Failed to suspend listing." };
  }
}

export async function activateListing(listingId: string, type: 'PROPERTY' | 'VEHICLE') {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.role !== "ADMIN") return { success: false, error: "Forbidden" };

    if (type === 'PROPERTY') {
      await prisma.property.update({
        where: { id: listingId },
        data: { status: "APPROVED", rejectionReason: null, isApproved: true }
      });
    } else {
      await prisma.vehicle.update({
        where: { id: listingId },
        data: { status: "APPROVED", rejectionReason: null, isApproved: true }
      });
    }

    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Error activating listing:", error);
    return { success: false, error: "Failed to activate listing." };
  }
}

// USER MANAGEMENT
export async function banUser(targetUserId: string, reason: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.role !== "ADMIN") return { success: false, error: "Forbidden" };

    await prisma.user.update({
      where: { id: targetUserId },
      data: { isBanned: true, banReason: reason }
    });

    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Error banning user:", error);
    return { success: false, error: "Failed to ban user." };
  }
}

export async function unbanUser(targetUserId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || dbUser.role !== "ADMIN") return { success: false, error: "Forbidden" };

    await prisma.user.update({
      where: { id: targetUserId },
      data: { isBanned: false, banReason: null }
    });

    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return { success: false, error: "Failed to unban user." };
  }
}
