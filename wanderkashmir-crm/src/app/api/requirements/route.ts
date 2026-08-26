import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const createRequirementSchema = z.object({
  partnerId: z.string().min(1, "Partner is required"),
  customerName: z.string().min(1, "Customer Name is required"),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.union([z.literal(""), z.string().email("Invalid email format")]).optional().nullable(),
  travelDate: z.string().min(1, "Travel Start Date is required"),
  returnDate: z.string().min(1, "Travel End Date is required"),
  adults: z.number().min(1, "At least 1 adult is required"),
  children: z.number().min(0).default(0),
  rooms: z.number().min(1, "At least 1 room is required"),
  pickupLocation: z.string().optional().nullable(),
  dropLocation: z.string().optional().nullable(),
  destinations: z.array(z.string()).default([]),
  hotelCategory: z.string().optional().nullable(),
  preferredHotel: z.string().optional().nullable(),
  mealPlan: z.string().optional().nullable(),
  cabRequired: z.boolean().default(true),
  cabType: z.string().optional().nullable(),
  sightseeingRequired: z.boolean().default(true),
  houseboatRequired: z.boolean().default(false),
  houseboatCategory: z.string().optional().nullable(),
  houseboatNights: z.number().min(0, "Cannot be negative").optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  customerBudget: z.number().optional().nullable(),
  currency: z.string().default("INR"),
  notes: z.string().optional().nullable(),
}).refine((data) => {
  if (data.travelDate && data.returnDate) {
    return new Date(data.travelDate) <= new Date(data.returnDate);
  }
  return true;
}, {
  message: "End Date cannot be before Start Date",
  path: ["returnDate"]
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = createRequirementSchema.parse(body);

    // Server-side security: BA can only create requirements for their assigned partners
    if (user.role === "BUSINESS_ASSOCIATE") {
      const partner = await prisma.crmPartner.findUnique({
        where: { id: data.partnerId },
        select: { assignedBaId: true }
      });
      
      if (!partner || partner.assignedBaId !== user.id) {
        return NextResponse.json({ error: "Forbidden: You are not authorized to create requirements for this partner." }, { status: 403 });
      }
    }

    const requirement = await prisma.crmRequirement.create({
      data: {
        ...data,
        customerPhone: data.customerPhone || "",
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
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const partnerId = searchParams.get("partnerId");

    let whereClause: any = {};
    if (status) whereClause.status = status;
    if (partnerId) whereClause.partnerId = partnerId;

    // BAs can only see requirements linked to their assigned partners
    const isAdminOrManager = ["CRM_ADMIN", "SALES_MANAGER"].includes(user.role);
    if (!isAdminOrManager) {
      whereClause.partner = { assignedBaId: user.id };
    }

    const requirements = await prisma.crmRequirement.findMany({
      where: whereClause,
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        travelDate: true,
        returnDate: true,
        adults: true,
        children: true,
        rooms: true,
        destinations: true,
        status: true,
        createdAt: true,
        cabRequired: true,
        cabType: true,
        hotelCategory: true,
        sightseeingRequired: true,
        houseboatRequired: true,
        houseboatNights: true,
        specialRequirements: true,
        notes: true,
        customerBudget: true,
        currency: true,
        partnerId: true,
        partner: {
          select: {
            companyName: true,
            assignedBaId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requirements);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
