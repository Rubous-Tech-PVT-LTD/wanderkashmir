"use server";

import prisma from "@/lib/prisma";

export interface PromoValidationResult {
  success: boolean;
  discountPercent?: number;
  error?: string;
}

/**
 * Validates a promo code strictly against active database rules for a specific stay/hotel.
 */
export async function validateStayPromoCodeAction(
  code: string,
  propertyId: string
): Promise<PromoValidationResult> {
  try {
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: "Please enter a valid promo code." };
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (!promo) {
      return { success: false, error: "Invalid promo code." };
    }

    if (!promo.isActive || promo.status !== "APPROVED") {
      return { success: false, error: "This promo code is inactive or no longer valid." };
    }

    // Check target applicability
    const isGlobal =
      !promo.tourId && !promo.propertyId && !promo.vehicleId && !promo.guideProfileId;

    if (!isGlobal && promo.propertyId !== propertyId) {
      return { success: false, error: "This promo code is not applicable for this stay." };
    }

    const discountPercent = Math.min(100, Math.max(0, promo.discountPercent));

    return {
      success: true,
      discountPercent,
    };
  } catch (error) {
    console.error("Error validating stay promo code:", error);
    return { success: false, error: "Unable to validate promo code at this moment." };
  }
}
