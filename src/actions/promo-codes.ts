"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPromoCodes() {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      include: {
        tour: {
          select: {
            title: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return { success: true, data: promoCodes };
  } catch (error) {
    console.error("Failed to fetch promo codes", error);
    return { success: false, error: "Failed to fetch promo codes" };
  }
}

export async function createPromoCode(code: string, discountPercent: number, tourId: string | null) {
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
        tourId: tourId || null,
        isActive: true,
      }
    });
    revalidatePath("/wander-admin");
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

export async function validatePromoCode(code: string, tourId?: string) {
  try {
    const promo = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promo) {
      return { success: false, error: "Invalid promo code" };
    }

    if (!promo.isActive) {
      return { success: false, error: "Promo code is inactive" };
    }

    if (promo.tourId && promo.tourId !== tourId) {
      return { success: false, error: "Promo code is not applicable for this tour" };
    }

    return { success: true, discountPercent: promo.discountPercent };
  } catch (error) {
    console.error("Failed to validate promo code", error);
    return { success: false, error: "Failed to validate promo code" };
  }
}

export async function getToursForPromo() {
  try {
    const tours = await prisma.tour.findMany({
      select: { id: true, title: true }
    });
    return { success: true, data: tours };
  } catch (error) {
    console.error('Failed to fetch tours', error);
    return { success: false, error: 'Failed to fetch tours' };
  }
}
