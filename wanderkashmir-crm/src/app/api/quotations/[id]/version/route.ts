import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const existing = await prisma.crmQuotation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const isAdminOrManager = ["CRM_ADMIN", "SALES_MANAGER"].includes(user.role);

    if (!isAdminOrManager && existing.baId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow revisions if the quotation is in an actionable state or approved/rejected.
    // DRAFTs don't need new versions usually, but we won't strictly block it. 
    // However, if the user really wants to version a draft, they can.

    // Find current max version for this requirement
    const latestVersion = await prisma.crmQuotation.findFirst({
      where: { requirementId: existing.requirementId },
      orderBy: { version: 'desc' }
    });

    const newVersionNum = (latestVersion?.version || existing.version) + 1;

    // Create a deep copy of the quotation
    const newQuotation = await prisma.crmQuotation.create({
      data: {
        requirementId: existing.requirementId,
        partnerId: existing.partnerId,
        baId: existing.baId,
        totalCost: existing.totalCost,
        totalSellingPrice: existing.totalSellingPrice,
        discount: existing.discount,
        discountType: existing.discountType,
        grossMargin: existing.grossMargin,
        netMargin: existing.netMargin,
        wanderKashmirMargin: existing.wanderKashmirMargin,
        validUntil: existing.validUntil,
        terms: existing.terms,
        cancellationPolicy: existing.cancellationPolicy,
        partnerPrice: existing.partnerPrice,
        version: newVersionNum,
        status: "DRAFT", // New version always starts as draft
        items: {
          create: existing.items.map(item => ({
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
        userId: user.userId,
        userRole: user.role,
        action: "QUOTATION_REVISION_CREATED",
        entity: "CrmQuotation",
        entityId: newQuotation.id,
        newValue: { version: newVersionNum, previousId: existing.id } as any,
      }
    });

    return NextResponse.json(newQuotation);
  } catch (error: any) {
    console.error("Quotation version error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
