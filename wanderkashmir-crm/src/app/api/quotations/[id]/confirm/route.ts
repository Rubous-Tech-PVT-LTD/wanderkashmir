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

    const { id: quotationId } = await params;
    const body = await req.json();
    const { confirmationProofUrl } = body;

    if (!confirmationProofUrl) {
      return NextResponse.json({ error: "Confirmation proof is required" }, { status: 400 });
    }

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: quotationId },
      include: { requirement: { include: { partner: true } } }
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const isAdminOrManager = ["CRM_ADMIN", "SALES_MANAGER"].includes(user.role);
    if (!isAdminOrManager && quotation.baId !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this quotation" }, { status: 403 });
    }

    if (quotation.status === "CONFIRMED") {
      return NextResponse.json({ error: "Quotation is already confirmed" }, { status: 400 });
    }

    // Update status and save proof
    const updatedQuotation = await prisma.crmQuotation.update({
      where: { id: quotationId },
      data: {
        status: "CONFIRMED",
        confirmationProofUrl,
        confirmedAt: new Date(),
        confirmedById: user.id,
      }
    });

    // Audit log
    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "CONFIRM_QUOTATION",
        entity: "CrmQuotation",
        entityId: quotationId,
        newValue: { status: "CONFIRMED", confirmationProofUrl },
      }
    });

    return NextResponse.json(updatedQuotation, { status: 200 });
  } catch (error: any) {
    console.error("Failed to confirm quotation:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
