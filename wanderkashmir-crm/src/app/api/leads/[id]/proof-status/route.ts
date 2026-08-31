import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCrmAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireCrmAdmin();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const lead = await prisma.crmLead.update({
      where: { id },
      data: { interestProofStatus: status }
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: session.userId,
        userRole: session.role || 'CRM_ADMIN',
        action: 'PROOF_STATUS_UPDATED',
        entity: 'CrmLead',
        entityId: id,
        newValue: { interestProofStatus: status },
      }
    });

    return NextResponse.json(lead);
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
