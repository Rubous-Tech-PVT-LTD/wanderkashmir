"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPromoCodes() {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      include: {
        tour: { select: { title: true } },
        property: { select: { name: true } },
        vehicle: { select: { make: true, model: true } },
        guideProfile: { select: { vendorProfile: { select: { user: { select: { name: true } } } } } },
        vendorProfile: { select: { businessName: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: promoCodes };
  } catch (error) {
    console.error("Failed to fetch promo codes", error);
    return { success: false, error: "Failed to fetch promo codes" };
  }
}

export async function getVendorPromoCodes(vendorProfileId: string) {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      where: { vendorProfileId },
      include: {
        tour: { select: { title: true } },
        property: { select: { name: true } },
        vehicle: { select: { make: true, model: true } },
        guideProfile: { select: { vendorProfile: { select: { user: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: promoCodes };
  } catch (error) {
    console.error("Failed to fetch vendor promo codes", error);
    return { success: false, error: "Failed to fetch promo codes" };
  }
}

export async function createPromoCode(
  code: string, 
  discountPercent: number, 
  targets: { tourId?: string | null, propertyId?: string | null, vehicleId?: string | null, guideProfileId?: string | null },
  vendorProfileId?: string | null,
  isAdmin: boolean = true
) {
  try {
    const codeExists = await prisma.promoCode.findUnique({
      where: { code }
    });
    
    if (codeExists) {
      return { success: false, error: "Promo code already exists" };
    }

    const promo = await prisma.promoCode.create({
      data: {
        code,
        discountPercent,
        tourId: targets.tourId || null,
        propertyId: targets.propertyId || null,
        vehicleId: targets.vehicleId || null,
        guideProfileId: targets.guideProfileId || null,
        vendorProfileId: vendorProfileId || null,
        isActive: true,
        status: isAdmin ? "APPROVED" : "PENDING",
      }
    });
    revalidatePath("/wander-admin");
    if (vendorProfileId) revalidatePath("/partner");
    return { success: true, data: promo };
  } catch (error) {
    console.error("Failed to create promo code", error);
    return { success: false, error: "Failed to create promo code" };
  }
}

export async function togglePromoCodeStatus(id: string, isActive: boolean) {
  try {
    await prisma.promoCode.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle promo code status", error);
    return { success: false, error: "Failed to toggle status" };
  }
}

export async function approvePromoCode(id: string, isApproved: boolean) {
  try {
    await prisma.promoCode.update({
      where: { id },
      data: { 
        status: isApproved ? "APPROVED" : "REJECTED",
        isActive: isApproved, // Deactivate if rejected
      }
    });
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve promo code", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deletePromoCode(id: string) {
  try {
    await prisma.promoCode.delete({
      where: { id }
    });
    revalidatePath("/wander-admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete promo code", error);
    return { success: false, error: "Failed to delete promo code" };
  }
}

export async function validatePromoCode(
  code: string, 
  targets?: { tourId?: string | null, propertyId?: string | null, vehicleId?: string | null, guideProfileId?: string | null }
) {
  try {
    const promo = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promo) {
      return { success: false, error: "Invalid promo code" };
    }

    if (!promo.isActive || promo.status !== "APPROVED") {
      return { success: false, error: "Promo code is inactive or pending approval" };
    }

    // Check if the promo code applies globally (no specific targets set on the promo code)
    const isGlobal = !promo.tourId && !promo.propertyId && !promo.vehicleId && !promo.guideProfileId;

    if (!isGlobal) {
      let isMatch = false;
      if (targets?.tourId && promo.tourId === targets.tourId) isMatch = true;
      if (targets?.propertyId && promo.propertyId === targets.propertyId) isMatch = true;
      if (targets?.vehicleId && promo.vehicleId === targets.vehicleId) isMatch = true;
      if (targets?.guideProfileId && promo.guideProfileId === targets.guideProfileId) isMatch = true;

      if (!isMatch) {
        return { success: false, error: "Promo code is not applicable for this service" };
      }
    }

    return { success: true, discountPercent: promo.discountPercent };
  } catch (error) {
    console.error("Failed to validate promo code", error);
    return { success: false, error: "Failed to validate promo code" };
  }
}

export async function getToursForPromo() {
  try {
    const tours = await prisma.tour.findMany({ select: { id: true, title: true } });
    const properties = await prisma.property.findMany({ select: { id: true, name: true } });
    const vehicles = await prisma.vehicle.findMany({ select: { id: true, make: true, model: true } });
    
    // Using a simplified query for guides to avoid deep relation errors if fields missing
    const rawGuides = await prisma.guideProfile.findMany({ 
      select: { id: true, vendorProfile: { select: { user: { select: { name: true } } } } } 
    });
    
    return { 
      success: true, 
      tours, 
      properties, 
      vehicles,
      guides: rawGuides.map(g => ({ id: g.id, name: g.vendorProfile?.user?.name || "Unknown Guide" }))
    };
  } catch (error) {
    console.error('Failed to fetch services for promo', error);
    return { success: false, error: 'Failed to fetch services' };
  }
}
