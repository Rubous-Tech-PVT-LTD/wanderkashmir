import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'CRM_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const resolvedParams = await params;

    const partner = await prisma.crmPartner.update({
      where: { id: resolvedParams.id },
      data: { status: 'ACTIVE' }
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: session.userId,
        userRole: session.role,
        action: 'APPROVE',
        entity: 'CrmPartner',
        entityId: partner.id,
        newValue: { status: 'ACTIVE' },
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
      }
    });

    return NextResponse.redirect(new URL('/dashboard/partners', req.url));
  } catch (error) {
    console.error("Partner approve error:", error);
    return NextResponse.json({ error: "Failed to approve partner" }, { status: 500 });
  }
}
