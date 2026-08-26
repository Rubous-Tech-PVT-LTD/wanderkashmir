import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum([
    "NEW",
    "PROCESSING",
    "UNDER_REVIEW",
    "QUOTE_IN_PROGRESS",
    "QUOTE_SENT",
    "NEGOTIATION",
    "ACCEPTED",
    "REJECTED",
    "CONFIRMED",
    "CANCELLED",
    "CONVERTED_TO_BOOKING",
  ]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { status } = statusSchema.parse(body);

    const existing = await prisma.crmRequirement.findUnique({
      where: { id: params.id },
      include: { partner: true }
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!isCrmAdminOrManager(user.role) && existing.partner.assignedBaId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.crmRequirement.update({
      where: { id: params.id },
      data: { status },
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "STATUS_CHANGE",
        entity: "CrmRequirement",
        entityId: updated.id,
        oldValue: { status: existing.status } as any,
        newValue: { status: updated.status } as any,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
