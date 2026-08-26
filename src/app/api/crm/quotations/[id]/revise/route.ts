import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    if (!isCrmAdminOrManager(user.role) && quotation.baId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Determine new version number
    const existingCount = await prisma.crmQuotation.count({
      where: { requirementId: quotation.requirementId }
    });
    const newVersion = existingCount + 1;

    // Create the revised quotation
    const revisedQuotation = await prisma.crmQuotation.create({
      data: {
        requirementId: quotation.requirementId,
        partnerId: quotation.partnerId,
        baId: quotation.baId,
        version: newVersion,
        totalCost: quotation.totalCost,
        totalSellingPrice: quotation.totalSellingPrice,
        discount: quotation.discount,
        discountType: quotation.discountType,
        grossMargin: quotation.grossMargin,
        netMargin: quotation.netMargin,
        validUntil: quotation.validUntil,
        terms: quotation.terms,
        cancellationPolicy: quotation.cancellationPolicy,
        partnerPrice: quotation.partnerPrice,
        customerPrice: quotation.customerPrice,
        wanderKashmirMargin: quotation.wanderKashmirMargin,
        status: "REVISED", // Start the new one as REVISED (or DRAFT)
        items: {
          create: quotation.items.map(item => ({
            category: item.category,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitCost: item.unitCost,
            unitSellingPrice: item.unitSellingPrice,
            totalCost: item.totalCost,
            totalSellingPrice: item.totalSellingPrice,
          }))
        }
      }
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "REVISE",
        entity: "CrmQuotation",
        entityId: quotation.id,
        newValue: revisedQuotation as any,
      }
    });

    return NextResponse.json(revisedQuotation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
