import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user || !isCrmAdminOrManager(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: params.id },
    });

    if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    if (quotation.status !== "INTERNAL_REVIEW") {
      return NextResponse.json({ error: "Quotation is not under internal review" }, { status: 400 });
    }

    const updated = await prisma.crmQuotation.update({
      where: { id: params.id },
      data: { status: "REJECTED" },
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "REJECT",
        entity: "CrmQuotation",
        entityId: updated.id,
        oldValue: { status: quotation.status } as any,
        newValue: { status: "REJECTED" } as any,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
