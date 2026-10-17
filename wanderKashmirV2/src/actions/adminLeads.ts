"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

interface MutationResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface CreateAdminLeadInput {
  name: string;
  phone: string;
  email?: string;
  travelDates?: string;
  guestsCount?: string;
  destinations?: string[];
  hotelType?: string;
  cabType?: string;
  notes?: string;
  source?: string;
  createUser?: boolean;
}

async function verifyAdminAuth(): Promise<{ authorized: boolean; error?: string; adminId?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { authorized: false, error: "Unauthorized: Admin session required." };
  }

  if (session.role !== "ADMIN") {
    return { authorized: false, error: "Forbidden: Administrator role required." };
  }

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
 * Server action to quickly create a customer lead (e.g. from WhatsApp) from the Admin panel.
 */
export async function createAdminLeadAction(
  input: CreateAdminLeadInput
): Promise<MutationResult<{ id: string; referenceId: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const trimmedName = input.name?.trim();
    const trimmedPhone = input.phone?.trim();

    if (!trimmedName) {
      return { success: false, error: "Customer name is required." };
    }

    if (!trimmedPhone || trimmedPhone.length < 8) {
      return { success: false, error: "Valid contact phone/WhatsApp number is required." };
    }

    const destinations =
      Array.isArray(input.destinations) && input.destinations.length > 0
        ? input.destinations.map((d) => d.trim()).filter(Boolean)
        : ["Srinagar", "Gulmarg", "Pahalgam"];

    const specialRequests = [
      input.source ? `[Source: ${input.source}]` : "[Source: WhatsApp / Admin]",
      input.notes?.trim() || null,
    ]
      .filter(Boolean)
      .join(" | ");

    const newLead = await prisma.customTourRequest.create({
      data: {
        name: trimmedName,
        phone: trimmedPhone,
        email: input.email?.trim() || null,
        travelDates: input.travelDates?.trim() || "Upcoming",
        guestsCount: input.guestsCount?.trim() || "2 Adults",
        destinations,
        hotelType: input.hotelType?.trim() || "3 Star Standard",
        cabType: input.cabType?.trim() || "Sedan / SUV",
        specialRequests: specialRequests || null,
        adminNotes: `Added manually by admin via mobile/web at ${new Date().toLocaleString("en-IN")}`,
        status: "PENDING",
      },
    });

    // Optionally ensure User account exists for marketing campaigns
    if (input.createUser !== false) {
      try {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: trimmedPhone },
              ...(input.email?.trim() ? [{ email: input.email.trim().toLowerCase() }] : []),
            ],
          },
          select: { id: true },
        });

        if (!existingUser) {
          const cleanPhone = trimmedPhone.replace(/[^0-9]/g, "");
          const emailPlaceholder =
            input.email?.trim().toLowerCase() ||
            `${cleanPhone || Date.now()}@customer.wanderkashmir.com`;

          await prisma.user.create({
            data: {
              name: trimmedName,
              phone: trimmedPhone,
              email: emailPlaceholder,
              role: "CUSTOMER",
            },
          });
          revalidatePath("/admin/users");
        }
      } catch (userSyncErr) {
        console.warn("User marketing auto-sync notice:", userSyncErr);
      }
    }

    const referenceId = `WK-${newLead.id.slice(-6).toUpperCase()}`;

    revalidatePath("/admin/leads");
    revalidatePath("/wander-admin");

    return {
      success: true,
      data: {
        id: newLead.id,
        referenceId,
      },
    };
  } catch (err: unknown) {
    console.error("Error creating admin lead:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create lead in database.",
    };
  }
}

/**
 * Server Action: Update lead status and admin notes
 */
export async function updateAdminLeadStatusAction(
  leadId: string,
  status: string,
  adminNotes?: string
): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!leadId) {
      return { success: false, error: "Lead ID is required." };
    }

    await prisma.customTourRequest.update({
      where: { id: leadId },
      data: {
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    });

    revalidatePath("/admin/leads");
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error updating lead status:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update lead status.",
    };
  }
}

/**
 * Server Action: Delete lead (e.g. spam/test lead)
 */
export async function deleteAdminLeadAction(leadId: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!leadId) {
      return { success: false, error: "Lead ID is required." };
    }

    await prisma.customTourRequest.delete({
      where: { id: leadId },
    });

    revalidatePath("/admin/leads");
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (err: unknown) {
    console.error("Error deleting lead:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete lead.",
    };
  }
}


