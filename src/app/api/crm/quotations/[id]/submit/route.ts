import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";

// In a real app, this might come from a DB config table.
const MAX_FIXED_DISCOUNT = 5000;
const MAX_PERCENTAGE_DISCOUNT = 10;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: params.id },
    });

    if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    if (!isCrmAdminOrManager(user.role) && quotation.baId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (quotation.status !== "DRAFT" && quotation.status !== "REVISED") {
      return NextResponse.json({ error: "Quotation is not in a submittable state" }, { status: 400 });
    }

    let needsReview = false;
    if (quotation.discountType === "FIXED" && quotation.discount > MAX_FIXED_DISCOUNT) {
      needsReview = true;
    } else if (quotation.discountType === "PERCENTAGE" && quotation.discount > MAX_PERCENTAGE_DISCOUNT) {
      needsReview = true;
    }

    const nextStatus = needsReview ? "INTERNAL_REVIEW" : "APPROVED";

    const updated = await prisma.crmQuotation.update({
      where: { id: params.id },
      data: { status: nextStatus },
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "SUBMIT",
        entity: "CrmQuotation",
        entityId: updated.id,
        oldValue: { status: quotation.status } as any,
        newValue: { status: nextStatus } as any,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
