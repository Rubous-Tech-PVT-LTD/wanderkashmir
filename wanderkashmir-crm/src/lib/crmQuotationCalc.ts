import { prisma } from "@/lib/prisma";

export async function recalculateQuotation(quotationId: string) {
  const quotation = await prisma.crmQuotation.findUnique({
    where: { id: quotationId },
    include: { items: true },
  });

  if (!quotation) throw new Error("Quotation not found");

  let totalCost = 0;
  let totalSellingPrice = 0;

  for (const item of quotation.items) {
    const itemTotalCost = item.quantity * item.unitCost;
    const itemTotalSellingPrice = item.quantity * item.unitSellingPrice;

    // We also update the item if we want to ensure it's correct in DB, but usually we do it on save
    totalCost += itemTotalCost;
    totalSellingPrice += itemTotalSellingPrice;
  }

  const grossMargin = totalSellingPrice - totalCost;

  let discountAmount = 0;
  if (quotation.discountType === "FIXED") {
    discountAmount = quotation.discount;
  } else if (quotation.discountType === "PERCENTAGE") {
    discountAmount = (totalSellingPrice * quotation.discount) / 100;
  }

  const finalSellingPrice = totalSellingPrice - discountAmount;
  const netMargin = finalSellingPrice - totalCost;

  // We map finalSellingPrice back to partnerPrice and customerPrice for legacy compatibility
  const updatedQuotation = await prisma.crmQuotation.update({
    where: { id: quotationId },
    data: {
      totalCost,
      totalSellingPrice,
      grossMargin,
      netMargin,
      // Legacy fields
      partnerPrice: finalSellingPrice,
      customerPrice: finalSellingPrice,
      wanderKashmirMargin: netMargin,
    },
  });

  return updatedQuotation;
}
