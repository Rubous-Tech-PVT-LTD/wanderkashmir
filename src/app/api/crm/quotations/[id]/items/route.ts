import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";
import { z } from "zod";
import { recalculateQuotation } from "@/lib/crmQuotationCalc";

const createItemSchema = z.object({
  category: z.enum([
    "HOTEL",
    "CAB",
    "SIGHTSEEING",
    "HOUSEBOAT",
    "ACTIVITY",
    "TRANSFER",
    "OTHER",
  ]),
  description: z.string().min(1),
  quantity: z.number().min(1),
  unit: z.string().min(1),
  unitCost: z.number().min(0),
  unitSellingPrice: z.number().min(0),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: params.id },
    });

    if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    if (!isCrmAdminOrManager(user.role) && quotation.baId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (quotation.status === "ACCEPTED") {
      return NextResponse.json({ error: "Cannot modify an accepted quotation" }, { status: 400 });
    }

    const body = await req.json();
    const data = createItemSchema.parse(body);

    const totalCost = data.quantity * data.unitCost;
    const totalSellingPrice = data.quantity * data.unitSellingPrice;

    const item = await prisma.crmQuotationItem.create({
      data: {
        quotationId: params.id,
        category: data.category,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        unitCost: data.unitCost,
        unitSellingPrice: data.unitSellingPrice,
        totalCost,
        totalSellingPrice,
      },
    });

    const updatedQuotation = await recalculateQuotation(params.id);

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "ADD_ITEM",
        entity: "CrmQuotation",
        entityId: params.id,
        newValue: item as any,
      }
    });

    return NextResponse.json(updatedQuotation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
