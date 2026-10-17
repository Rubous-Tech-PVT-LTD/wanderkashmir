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

function revalidateUserPaths() {
  revalidatePath("/admin/users");
  revalidatePath("/wander-admin/users");
}

/**
 * Server Action: Ban User / Tourist Account.
 * CRITICAL SAFETY: Administrator accounts can NEVER be banned via customer user management.
 */
export async function banUserAction(targetUserId: string, reason: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!targetUserId || typeof targetUserId !== "string") {
      return { success: false, error: "Invalid User ID provided." };
    }

    if (!reason || !reason.trim()) {
      return { success: false, error: "A valid ban reason must be specified." };
    }

    // Re-fetch target user directly from the database immediately before mutation
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true, role: true, isBanned: true },
    });

    if (!targetUser) {
      return { success: false, error: "Target user not found." };
    }

    // Absolute protection: Administrator accounts cannot be banned
    if (targetUser.role === "ADMIN") {
      return {
        success: false,
        error: "Security restriction: Administrator accounts cannot be banned.",
      };
    }

    if (targetUser.isBanned) {
      return { success: false, error: "This user is already banned." };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isBanned: true,
        banReason: reason.trim(),
      },
    });

    revalidateUserPaths();
    return { success: true };
  } catch (error) {
    console.error("Error banning user:", error);
    return { success: false, error: "Failed to ban user." };
  }
}

/**
 * Server Action: Unban User / Tourist Account.
 */
export async function unbanUserAction(targetUserId: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!targetUserId || typeof targetUserId !== "string") {
      return { success: false, error: "Invalid User ID provided." };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true, role: true, isBanned: true },
    });

    if (!targetUser) {
      return { success: false, error: "Target user not found." };
    }

    if (targetUser.role === "ADMIN") {
      return {
        success: false,
        error: "Security restriction: Administrator accounts cannot be altered here.",
      };
    }

    if (!targetUser.isBanned) {
      return { success: false, error: "This user is not currently banned." };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isBanned: false,
        banReason: null,
      },
    });

    revalidateUserPaths();
    return { success: true };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return { success: false, error: "Failed to unban user." };
  }
}

export interface CreateAdminUserInput {
  name?: string;
  phone: string;
  email?: string;
  role?: "CUSTOMER" | "VENDOR";
}

/**
 * Server Action: Create User / Tourist Account directly for database & marketing purposes.
 */
export async function createAdminUserAction(
  input: CreateAdminUserInput
): Promise<MutationResult<{ id: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const trimmedPhone = input.phone?.trim();
    const trimmedEmail = input.email?.trim().toLowerCase();
    const trimmedName = input.name?.trim() || null;

    if (!trimmedPhone && !trimmedEmail) {
      return { success: false, error: "Either a phone number or email is required." };
    }

    // Check existing phone
    if (trimmedPhone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: trimmedPhone },
        select: { id: true, name: true, phone: true },
      });
      if (existingPhone) {
        return {
          success: false,
          error: `User with phone ${trimmedPhone} already exists (${existingPhone.name || "Customer"}).`,
        };
      }
    }

    // Check existing email or construct valid unique placeholder email
    let finalEmail = trimmedEmail;
    if (finalEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: finalEmail },
        select: { id: true },
      });
      if (existingEmail) {
        return { success: false, error: `User with email ${finalEmail} already exists.` };
      }
    } else {
      const cleanPhone = (trimmedPhone || "user").replace(/[^0-9]/g, "");
      finalEmail = `${cleanPhone || Date.now()}@customer.wanderkashmir.com`;
      const collision = await prisma.user.findUnique({ where: { email: finalEmail } });
      if (collision) {
        finalEmail = `${cleanPhone}_${Date.now()}@customer.wanderkashmir.com`;
      }
    }

    const newUser = await prisma.user.create({
      data: {
        name: trimmedName,
        phone: trimmedPhone || null,
        email: finalEmail,
        role: input.role === "VENDOR" ? "VENDOR" : "CUSTOMER",
      },
    });

    revalidateUserPaths();
    return { success: true, data: { id: newUser.id } };
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user in database.",
    };
  }
}

