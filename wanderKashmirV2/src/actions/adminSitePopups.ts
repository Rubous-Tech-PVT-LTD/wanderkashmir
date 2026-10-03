"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AdminSitePopupItem {
  id: string;
  type: string;
  title: string;
  description: string;
  buttonText: string | null;
  buttonLink: string | null;
  displayStyle: string;
  triggerRule: string;
  targetPages: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SitePopupFormInput {
  type: string;
  title: string;
  description: string;
  buttonText?: string | null;
  buttonLink?: string | null;
  displayStyle: string;
  triggerRule: string;
  targetPages: string;
  isActive: boolean;
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
 * Fetch all site popups from the production database.
 */
export async function getAdminSitePopupsAction(): Promise<
  ActionResult<{ popups: AdminSitePopupItem[]; total: number }>
> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    const popups = await prisma.sitePopup.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: {
        popups: popups as unknown as AdminSitePopupItem[],
        total: popups.length,
      },
    };
  } catch (error: any) {
    console.error("getAdminSitePopupsAction error:", error);
    return { success: false, error: error.message || "Failed to load site popups." };
  }
}

/**
 * Create a new Site Popup.
 */
export async function createAdminSitePopupAction(
  data: SitePopupFormInput
): Promise<ActionResult<AdminSitePopupItem>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    if (!data.title.trim()) {
      return { success: false, error: "Popup title is required." };
    }
    if (!data.description.trim()) {
      return { success: false, error: "Popup description content is required." };
    }

    // If activating this popup, deactivate other popups with overlapping target to avoid collisions
    if (data.isActive) {
      await prisma.sitePopup.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const created = await prisma.sitePopup.create({
      data: {
        type: data.type || "MARKETING",
        title: data.title.trim(),
        description: data.description.trim(),
        buttonText: data.buttonText?.trim() || null,
        buttonLink: data.buttonLink?.trim() || null,
        displayStyle: data.displayStyle || "MODAL",
        triggerRule: data.triggerRule || "DELAY_5S",
        targetPages: data.targetPages || "ALL",
        isActive: data.isActive,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/popups");
    return { success: true, data: created as unknown as AdminSitePopupItem };
  } catch (error: any) {
    console.error("createAdminSitePopupAction error:", error);
    return { success: false, error: error.message || "Failed to create site popup." };
  }
}

/**
 * Update an existing Site Popup.
 */
export async function updateAdminSitePopupAction(
  id: string,
  data: SitePopupFormInput
): Promise<ActionResult<AdminSitePopupItem>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    if (!data.title.trim()) {
      return { success: false, error: "Popup title is required." };
    }

    if (data.isActive) {
      await prisma.sitePopup.updateMany({
        where: { id: { not: id }, isActive: true },
        data: { isActive: false },
      });
    }

    const updated = await prisma.sitePopup.update({
      where: { id },
      data: {
        type: data.type || "MARKETING",
        title: data.title.trim(),
        description: data.description.trim(),
        buttonText: data.buttonText?.trim() || null,
        buttonLink: data.buttonLink?.trim() || null,
        displayStyle: data.displayStyle || "MODAL",
        triggerRule: data.triggerRule || "DELAY_5S",
        targetPages: data.targetPages || "ALL",
        isActive: data.isActive,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/popups");
    return { success: true, data: updated as unknown as AdminSitePopupItem };
  } catch (error: any) {
    console.error("updateAdminSitePopupAction error:", error);
    return { success: false, error: error.message || "Failed to update site popup." };
  }
}

/**
 * Toggle Active state of a Site Popup.
 */
export async function toggleAdminSitePopupAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    if (isActive) {
      // Deactivate others
      await prisma.sitePopup.updateMany({
        where: { id: { not: id }, isActive: true },
        data: { isActive: false },
      });
    }

    await prisma.sitePopup.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/");
    revalidatePath("/admin/popups");
    return { success: true };
  } catch (error: any) {
    console.error("toggleAdminSitePopupAction error:", error);
    return { success: false, error: error.message || "Failed to update popup status." };
  }
}

/**
 * Delete a Site Popup.
 */
export async function deleteAdminSitePopupAction(id: string): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    await prisma.sitePopup.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/popups");
    return { success: true };
  } catch (error: any) {
    console.error("deleteAdminSitePopupAction error:", error);
    return { success: false, error: error.message || "Failed to delete site popup." };
  }
}
