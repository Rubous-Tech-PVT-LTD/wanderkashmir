import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";
import { z } from "zod";

const updateRequirementSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  travelDate: z.string().optional().nullable(),
  returnDate: z.string().optional().nullable(),
  adults: z.number().min(1).optional(),
  children: z.number().min(0).optional(),
  rooms: z.number().min(1).optional(),
  pickupLocation: z.string().optional().nullable(),
  dropLocation: z.string().optional().nullable(),
  destinations: z.array(z.string()).optional(),
  hotelCategory: z.string().optional().nullable(),
  mealPlan: z.string().optional().nullable(),
  cabRequired: z.boolean().optional(),
  sightseeingRequired: z.boolean().optional(),
  houseboatRequired: z.boolean().optional(),
  specialRequirements: z.string().optional().nullable(),
  customerBudget: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const requirement = await prisma.crmRequirement.findUnique({
      where: { id: params.id },
      include: {
        partner: true,
        quotations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!requirement) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!isCrmAdminOrManager(user.role) && requirement.partner.assignedBaId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Filter sensitive fields from quotations if the user is a BA
    if (!isCrmAdminOrManager(user.role)) {
      requirement.quotations = requirement.quotations.map(q => {
        const { totalCost, grossMargin, netMargin, partnerPrice, ...rest } = q as any;
        return rest;
      }) as any;
    }

    return NextResponse.json(requirement);
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
    const data = updateRequirementSchema.parse(body);

    const existing = await prisma.crmRequirement.findUnique({
      where: { id: params.id },
      include: { partner: true }
    });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!isCrmAdminOrManager(user.role) && existing.partner.assignedBaId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = { ...data };
    if (data.travelDate) updateData.travelDate = new Date(data.travelDate);
    if (data.returnDate) updateData.returnDate = new Date(data.returnDate);

    const updated = await prisma.crmRequirement.update({
      where: { id: params.id },
      data: updateData,
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "UPDATE",
        entity: "CrmRequirement",
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
