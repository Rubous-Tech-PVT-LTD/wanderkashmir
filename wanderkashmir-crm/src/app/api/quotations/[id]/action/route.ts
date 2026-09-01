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

    const body = await req.json();
    const { action, reason } = body; 

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const isAdminOrManager = ["CRM_ADMIN", "SALES_MANAGER"].includes(user.role);

    let newStatus = quotation.status;

    if (action === "SUBMIT") {
      if (isAdminOrManager) {
        return NextResponse.json({ error: "Admins do not need to submit quotations for approval" }, { status: 400 });
      }
      if (quotation.baId !== user.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!["DRAFT", "REVISED"].includes(quotation.status)) {
        return NextResponse.json({ error: "Can only submit DRAFT or REVISED quotations" }, { status: 400 });
      }
      const itemsCount = await prisma.crmQuotationItem.count({ where: { quotationId: id } });
      if (itemsCount === 0) {
        return NextResponse.json({ error: "Cannot submit empty quotation" }, { status: 400 });
      }
      
      newStatus = "INTERNAL_REVIEW";
    } 
    else if (["APPROVE", "REJECT", "REQUEST_REVISION"].includes(action)) {
      if (!isAdminOrManager) {
        return NextResponse.json({ error: "Forbidden. Admin only action." }, { status: 403 });
      }
      if (quotation.status !== "INTERNAL_REVIEW") {
        return NextResponse.json({ error: "Quotation must be in INTERNAL_REVIEW status" }, { status: 400 });
      }

      if (action === "APPROVE") newStatus = "APPROVED";
      if (action === "REJECT") newStatus = "REJECTED";
      if (action === "REQUEST_REVISION") newStatus = "REVISED";
    }
    else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.crmQuotation.update({
      where: { id },
      data: { status: newStatus as any },
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: user.userId,
        userRole: user.role,
        action: `QUOTATION_${action}`,
        entity: "CrmQuotation",
        entityId: id,
        newValue: { status: newStatus, reason } as any,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Action error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
