import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";
import { z } from "zod";
import { recalculateQuotation } from "@/lib/crmQuotationCalc";

const updateQuotationSchema = z.object({
  validUntil: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  cancellationPolicy: z.string().optional().nullable(),
  discount: z.number().min(0).optional(),
  discountType: z.enum(["FIXED", "PERCENTAGE"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: params.id },
      include: { items: true, requirement: true },
    });

    if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!isCrmAdminOrManager(user.role) && quotation.baId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isCrmAdminOrManager(user.role)) {
      const { totalCost, grossMargin, netMargin, partnerPrice, ...rest } = quotation as any;
      
      const sanitizedItems = rest.items.map((item: any) => {
        const { unitCost, totalCost, ...itemRest } = item;
        return itemRest;
      });

      rest.items = sanitizedItems;
      return NextResponse.json(rest);
    }

    return NextResponse.json(quotation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = updateQuotationSchema.parse(body);

    const existing = await prisma.crmQuotation.findUnique({
      where: { id: params.id },
    });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!isCrmAdminOrManager(user.role) && existing.baId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Do not allow edits if it is already accepted
    if (existing.status === "ACCEPTED") {
      return NextResponse.json({ error: "Cannot edit an accepted quotation" }, { status: 400 });
    }

    const updateData: any = { ...data };
    if (data.validUntil) updateData.validUntil = new Date(data.validUntil);

    await prisma.crmQuotation.update({
      where: { id: params.id },
      data: updateData,
    });

    // Recalculate if discount changed
    const updated = await recalculateQuotation(params.id);

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "UPDATE",
        entity: "CrmQuotation",
        entityId: updated.id,
        oldValue: existing as any,
        newValue: updated as any,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
