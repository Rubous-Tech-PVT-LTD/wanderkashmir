import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";
import { z } from "zod";

const assignSchema = z.object({
  opsId: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user || !isCrmAdminOrManager(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { opsId } = assignSchema.parse(body);

    const existing = await prisma.crmRequirement.findUnique({
      where: { id: params.id }
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.crmRequirement.update({
      where: { id: params.id },
      data: { assignedOpsId: opsId },
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "ASSIGN",
        entity: "CrmRequirement",
        entityId: updated.id,
        oldValue: { assignedOpsId: existing.assignedOpsId } as any,
        newValue: { assignedOpsId: updated.assignedOpsId } as any,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
