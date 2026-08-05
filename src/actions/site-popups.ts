"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSitePopups() {
  try {
    const popups = await prisma.sitePopup.findMany({
      orderBy: { createdAt: "desc" }
    });
    return { success: true, popups };
  } catch (error) {
    console.error("Failed to fetch site popups:", error);
    return { success: false, error: "Failed to fetch site popups" };
  }
}

export async function getActivePopup(pathname?: string) {
  try {
    const activePopups = await prisma.sitePopup.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!activePopups || activePopups.length === 0) {
      return { success: true, popup: null };
    }

    // Filter by targetPages
    let matchedPopup = null;
    
    for (const popup of activePopups) {
      if (popup.targetPages === "ALL") {
        matchedPopup = popup;
        break;
      }
      
      if (pathname) {
        if (popup.targetPages === "HOMEPAGE" && pathname === "/") {
          matchedPopup = popup;
          break;
        }
        if (popup.targetPages === "TOURS" && pathname.startsWith("/tours")) {
          matchedPopup = popup;
          break;
        }
        if (popup.targetPages === "HOTELS" && pathname.startsWith("/stays")) {
          matchedPopup = popup;
          break;
        }
        if (popup.targetPages === "TAXIS" && pathname.startsWith("/taxis")) {
          matchedPopup = popup;
          break;
        }
      }
    }

    if (!matchedPopup && activePopups.length > 0 && !pathname) {
      // Fallback if pathname wasn't provided but there is an active popup
      matchedPopup = activePopups[0];
    }

    return { success: true, popup: matchedPopup };
  } catch (error) {
    console.error("Failed to fetch active popup:", error);
    return { success: false, error: "Failed to fetch active popup" };
  }
}

export async function createSitePopup(data: {
  type: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  displayStyle: string;
  triggerRule: string;
  targetPages: string;
  isActive: boolean;
}) {
  try {
    if (data.isActive) {
      // If setting this one to active, deactivate others
      await prisma.sitePopup.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const popup = await prisma.sitePopup.create({
      data
    });
    
    revalidatePath("/");
    revalidatePath("/wander-admin");
    return { success: true, popup };
  } catch (error) {
    console.error("Failed to create site popup:", error);
    return { success: false, error: "Failed to create popup" };
  }
}

export async function updateSitePopup(id: string, data: any) {
  try {
    if (data.isActive) {
      // If setting this one to active, deactivate others
      await prisma.sitePopup.updateMany({
        where: { id: { not: id }, isActive: true },
        data: { isActive: false }
      });
    }

    const popup = await prisma.sitePopup.update({
      where: { id },
      data
    });
    
    revalidatePath("/");
    revalidatePath("/wander-admin");
    return { success: true, popup };
  } catch (error) {
    console.error("Failed to update site popup:", error);
    return { success: false, error: "Failed to update popup" };
  }
}

export async function deleteSitePopup(id: string) {
  try {
    await prisma.sitePopup.delete({
      where: { id }
    });
    revalidatePath("/");
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete site popup:", error);
    return { success: false, error: "Failed to delete popup" };
  }
}

export async function togglePopupActive(id: string, isActive: boolean) {
  try {
    if (isActive) {
      // Deactivate all others first to ensure only 1 is active
      await prisma.sitePopup.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }
    
    const popup = await prisma.sitePopup.update({
      where: { id },
      data: { isActive }
    });
    
    revalidatePath("/");
    revalidatePath("/wander-admin");
    return { success: true, popup };
  } catch (error) {
    console.error("Failed to toggle site popup:", error);
    return { success: false, error: "Failed to toggle popup" };
  }
}
