import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";
import { z } from "zod";

const createRequirementSchema = z.object({
  partnerId: z.string().min(1),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  travelDate: z.string().optional().nullable(),
  returnDate: z.string().optional().nullable(),
  adults: z.number().min(1),
  children: z.number().min(0),
  rooms: z.number().min(1),
  pickupLocation: z.string().optional().nullable(),
  dropLocation: z.string().optional().nullable(),
  destinations: z.array(z.string()).default([]),
  hotelCategory: z.string().optional().nullable(),
  mealPlan: z.string().optional().nullable(),
  cabRequired: z.boolean().default(true),
  sightseeingRequired: z.boolean().default(true),
  houseboatRequired: z.boolean().default(false),
  specialRequirements: z.string().optional().nullable(),
  customerBudget: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = createRequirementSchema.parse(body);

    const requirement = await prisma.crmRequirement.create({
      data: {
        ...data,
        status: "NEW",
        travelDate: data.travelDate ? new Date(data.travelDate) : null,
        returnDate: data.returnDate ? new Date(data.returnDate) : null,
      },
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "CREATE",
        entity: "CrmRequirement",
        entityId: requirement.id,
        newValue: requirement as any,
      }
    });

    return NextResponse.json(requirement, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const partnerId = searchParams.get("partnerId");

    let whereClause: any = {};
    if (status) whereClause.status = status;
    if (partnerId) whereClause.partnerId = partnerId;

    // BAs can only see requirements linked to their assigned partners
    if (!isCrmAdminOrManager(user.role)) {
      whereClause.partner = { assignedBaId: user.id };
    }

    const requirements = await prisma.crmRequirement.findMany({
      where: whereClause,
      include: {
        partner: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requirements);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
