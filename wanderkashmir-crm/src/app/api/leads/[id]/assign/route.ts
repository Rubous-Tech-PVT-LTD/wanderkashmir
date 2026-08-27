import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CRM_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { baId } = await req.json();
    const resolvedParams = await params;

    const lead = await prisma.crmLead.findUnique({
      where: { id: resolvedParams.id },
      include: { assignedBa: true }
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Update lead
    const updatedLead = await prisma.crmLead.update({
      where: { id: resolvedParams.id },
      data: {
        assignedBaId: baId || null,
        status: baId && lead.status === 'NEW' ? 'ASSIGNED' : undefined
      }
    });

    // Create Audit Log
    await prisma.crmAuditLog.create({
      data: {
        userId: session.userId,
        userRole: session.role,
        action: 'ASSIGN',
        entity: 'CrmLead',
        entityId: lead.id,
        oldValue: lead.assignedBaId ? { assignedBaId: lead.assignedBaId } : Prisma.JsonNull,
        newValue: { assignedBaId: baId || null },
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
      }
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error("Lead assignment error:", error);
    return NextResponse.json({ error: "Failed to assign lead" }, { status: 500 });
  }
}
