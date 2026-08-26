import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const createLeadSchema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  contactPerson: z.string().min(1, "Contact Person is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  whatsappNumber: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createLeadSchema.parse(body);

    // Duplicate Check
    const duplicate = await prisma.crmLead.findFirst({
      where: {
        phone: data.phone,
        companyName: data.companyName,
      }
    });

    if (duplicate) {
      return NextResponse.json({ 
        error: "A lead with this phone number and company name already exists." 
      }, { status: 409 });
    }

    // Server-enforced fields
    const assignedBaId = session.userId;
    const createdBy = session.userId;
    const status = "NEW";

    const lead = await prisma.crmLead.create({
      data: {
        ...data,
        assignedBaId,
        createdBy,
        status,
        state: null, // Default
        agentType: null,
      }
    });

    // Create Audit Log
    await prisma.crmAuditLog.create({
      data: {
        userId: session.userId,
        userRole: session.role || 'USER',
        action: 'CREATED',
        entity: 'CrmLead',
        entityId: lead.id,
        newValue: data,
      }
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating lead:", error);
    if (error && error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
