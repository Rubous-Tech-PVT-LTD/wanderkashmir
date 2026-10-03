"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AdminPromoCodeItem {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  status: string;
  showOnHomepage: boolean;
  createdAt: Date;
  updatedAt: Date;
  tourId: string | null;
  propertyId: string | null;
  vehicleId: string | null;
  guideProfileId: string | null;
  vendorProfileId: string | null;
  tour?: { id: string; title: string; slug: string } | null;
  property?: { id: string; name: string } | null;
  vehicle?: { id: string; model: string; type: string } | null;
  vendorProfile?: { id: string; businessName: string; type: string } | null;
}

export interface PromoCodeFormInput {
  code: string;
  discountPercent: number;
  targetType: "ALL" | "TOUR" | "PROPERTY" | "VEHICLE";
  targetId?: string | null;
  isActive?: boolean;
  status?: string;
  showOnHomepage?: boolean;
}

async function verifyAdminAuth() {
  const session = await getAdminSession();
  if (!session || !session.userId) {
    return { ok: false, error: "Unauthorized: Admin session required." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isBanned: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isBanned) {
    return { ok: false, error: "Forbidden: Administrator privileges required." };
  }

  return { ok: true, user: dbUser };
}

/**
 * Fetch all promo codes with search and status filtering.
 */
export async function getAdminPromoCodesAction(params?: {
  search?: string;
  status?: string;
}): Promise<ActionResult<{ promoCodes: AdminPromoCodeItem[]; total: number }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    const where: any = {};

    if (params?.status === "ACTIVE") {
      where.isActive = true;
    } else if (params?.status === "INACTIVE") {
      where.isActive = false;
    } else if (params?.status === "PENDING") {
      where.status = "PENDING";
    }

    if (params?.search && params.search.trim()) {
      const term = params.search.trim();
      where.OR = [
        { code: { contains: term, mode: "insensitive" } },
        { tour: { title: { contains: term, mode: "insensitive" } } },
        { property: { name: { contains: term, mode: "insensitive" } } },
      ];
    }

    const promoCodes = await prisma.promoCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tour: { select: { id: true, title: true, slug: true } },
        property: { select: { id: true, name: true } },
        vehicle: { select: { id: true, model: true, type: true } },
        vendorProfile: { select: { id: true, businessName: true, type: true } },
      },
    });

    return {
      success: true,
      data: {
        promoCodes: promoCodes as unknown as AdminPromoCodeItem[],
        total: promoCodes.length,
      },
    };
  } catch (error: any) {
    console.error("getAdminPromoCodesAction error:", error);
    return { success: false, error: error.message || "Failed to load promo codes." };
  }
}

/**
 * Fetch available tours, properties, and vehicles for target selector.
 */
export async function getPromoTargetsAction(): Promise<
  ActionResult<{
    tours: { id: string; title: string }[];
    properties: { id: string; name: string }[];
    vehicles: { id: string; model: string; type: string }[];
  }>
> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    const [tours, properties, vehicles] = await Promise.all([
      prisma.tour.findMany({
        where: { isLive: true },
        select: { id: true, title: true },
        orderBy: { title: "asc" },
      }),
      prisma.property.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.vehicle.findMany({
        select: { id: true, model: true, type: true },
        orderBy: { model: "asc" },
      }),
    ]);

    return {
      success: true,
      data: { tours, properties, vehicles },
    };
  } catch (error: any) {
    console.error("getPromoTargetsAction error:", error);
    return { success: false, error: error.message || "Failed to load targets." };
  }
}

/**
 * Create a new Promo Code.
 */
export async function createAdminPromoCodeAction(
  input: PromoCodeFormInput
): Promise<ActionResult<AdminPromoCodeItem>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    const cleanCode = input.code.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, "");
    if (!cleanCode || cleanCode.length < 3) {
      return { success: false, error: "Promo code must be at least 3 alphanumeric characters." };
    }

    const discount = Number(input.discountPercent);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      return { success: false, error: "Discount must be between 1% and 100%." };
    }

    // Check duplicate code
    const existing = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      return { success: false, error: `Promo code "${cleanCode}" already exists.` };
    }

    const data: any = {
      code: cleanCode,
      discountPercent: discount,
      isActive: input.isActive ?? true,
      status: input.status || "APPROVED",
      showOnHomepage: input.showOnHomepage ?? false,
    };

    if (input.targetType === "TOUR" && input.targetId) {
      data.tourId = input.targetId;
    } else if (input.targetType === "PROPERTY" && input.targetId) {
      data.propertyId = input.targetId;
    } else if (input.targetType === "VEHICLE" && input.targetId) {
      data.vehicleId = input.targetId;
    }

    const created = await prisma.promoCode.create({
      data,
    });

    revalidatePath("/admin/promo-codes");
    return { success: true, data: created as unknown as AdminPromoCodeItem };
  } catch (error: any) {
    console.error("createAdminPromoCodeAction error:", error);
    return { success: false, error: error.message || "Failed to create promo code." };
  }
}

/**
 * Update an existing Promo Code.
 */
export async function updateAdminPromoCodeAction(
  id: string,
  input: PromoCodeFormInput
): Promise<ActionResult<AdminPromoCodeItem>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    const cleanCode = input.code.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, "");
    if (!cleanCode || cleanCode.length < 3) {
      return { success: false, error: "Promo code must be at least 3 alphanumeric characters." };
    }

    const discount = Number(input.discountPercent);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      return { success: false, error: "Discount must be between 1% and 100%." };
    }

    // Check duplicate code if changed
    const existing = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });
    if (existing && existing.id !== id) {
      return { success: false, error: `Another promo code with "${cleanCode}" already exists.` };
    }

    const data: any = {
      code: cleanCode,
      discountPercent: discount,
      isActive: input.isActive ?? true,
      status: input.status || "APPROVED",
      showOnHomepage: input.showOnHomepage ?? false,
      tourId: null,
      propertyId: null,
      vehicleId: null,
    };

    if (input.targetType === "TOUR" && input.targetId) {
      data.tourId = input.targetId;
    } else if (input.targetType === "PROPERTY" && input.targetId) {
      data.propertyId = input.targetId;
    } else if (input.targetType === "VEHICLE" && input.targetId) {
      data.vehicleId = input.targetId;
    }

    const updated = await prisma.promoCode.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/promo-codes");
    return { success: true, data: updated as unknown as AdminPromoCodeItem };
  } catch (error: any) {
    console.error("updateAdminPromoCodeAction error:", error);
    return { success: false, error: error.message || "Failed to update promo code." };
  }
}

/**
 * Toggle Active / Inactive status of a promo code.
 */
export async function togglePromoCodeStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    await prisma.promoCode.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/promo-codes");
    return { success: true };
  } catch (error: any) {
    console.error("togglePromoCodeStatusAction error:", error);
    return { success: false, error: error.message || "Failed to update status." };
  }
}

/**
 * Approve or reject a promo code.
 */
export async function approvePromoCodeAction(
  id: string,
  isApproved: boolean
): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    await prisma.promoCode.update({
      where: { id },
      data: { status: isApproved ? "APPROVED" : "REJECTED", isActive: isApproved },
    });

    revalidatePath("/admin/promo-codes");
    return { success: true };
  } catch (error: any) {
    console.error("approvePromoCodeAction error:", error);
    return { success: false, error: error.message || "Failed to update approval." };
  }
}

/**
 * Safely delete a promo code.
 */
export async function deleteAdminPromoCodeAction(id: string): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    revalidatePath("/admin/promo-codes");
    return { success: true };
  } catch (error: any) {
    console.error("deleteAdminPromoCodeAction error:", error);
    return { success: false, error: error.message || "Failed to delete promo code." };
  }
}
