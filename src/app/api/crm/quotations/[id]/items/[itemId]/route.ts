import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";
import { z } from "zod";
import { recalculateQuotation } from "@/lib/crmQuotationCalc";

const updateItemSchema = z.object({
  category: z.enum([
    "HOTEL",
    "CAB",
    "SIGHTSEEING",
    "HOUSEBOAT",
    "ACTIVITY",
    "TRANSFER",
    "OTHER",
  ]).optional(),
  description: z.string().optional(),
  quantity: z.number().min(1).optional(),
  unit: z.string().optional(),
  unitCost: z.number().min(0).optional(),
  unitSellingPrice: z.number().min(0).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    if (!isCrmAdminOrManager(user.role) && quotation.baId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (quotation.status === "ACCEPTED") {
      return NextResponse.json({ error: "Cannot modify an accepted quotation" }, { status: 400 });
    }

    const itemExists = quotation.items.find(i => i.id === params.itemId);
    if (!itemExists) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const body = await req.json();
    const data = updateItemSchema.parse(body);

    const quantity = data.quantity !== undefined ? data.quantity : itemExists.quantity;
    const unitCost = data.unitCost !== undefined ? data.unitCost : itemExists.unitCost;
    const unitSellingPrice = data.unitSellingPrice !== undefined ? data.unitSellingPrice : itemExists.unitSellingPrice;

    const totalCost = quantity * unitCost;
    const totalSellingPrice = quantity * unitSellingPrice;

    const updatedItem = await prisma.crmQuotationItem.update({
      where: { id: params.itemId },
      data: {
        ...data,
        totalCost,
        totalSellingPrice,
      },
    });

    const updatedQuotation = await recalculateQuotation(params.id);

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "UPDATE_ITEM",
        entity: "CrmQuotation",
        entityId: params.id,
        oldValue: itemExists as any,
        newValue: updatedItem as any,
      }
    });

    return NextResponse.json(updatedQuotation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    if (!isCrmAdminOrManager(user.role) && quotation.baId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (quotation.status === "ACCEPTED") {
      return NextResponse.json({ error: "Cannot modify an accepted quotation" }, { status: 400 });
    }

    const itemExists = quotation.items.find(i => i.id === params.itemId);
    if (!itemExists) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    await prisma.crmQuotationItem.delete({
      where: { id: params.itemId },
    });

    const updatedQuotation = await recalculateQuotation(params.id);

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "DELETE_ITEM",
        entity: "CrmQuotation",
        entityId: params.id,
        oldValue: itemExists as any,
      }
    });

    return NextResponse.json(updatedQuotation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
