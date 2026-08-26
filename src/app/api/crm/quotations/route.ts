import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";
import { z } from "zod";

const createQuotationSchema = z.object({
  requirementId: z.string().min(1),
  validUntil: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  cancellationPolicy: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = createQuotationSchema.parse(body);

    const requirement = await prisma.crmRequirement.findUnique({
      where: { id: data.requirementId },
      include: { partner: true },
    });

    if (!requirement) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    if (!isCrmAdminOrManager(user.role) && requirement.partner.assignedBaId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check existing quotation count to assign version
    const existingCount = await prisma.crmQuotation.count({
      where: { requirementId: data.requirementId }
    });

    const quotation = await prisma.crmQuotation.create({
      data: {
        requirementId: data.requirementId,
        partnerId: requirement.partnerId,
        baId: requirement.partner.assignedBaId || user.id, // Usually the BA assigned to partner
        status: "DRAFT",
        version: existingCount + 1,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        terms: data.terms,
        cancellationPolicy: data.cancellationPolicy,
        partnerPrice: 0,
        wanderKashmirMargin: 0,
      }
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "CREATE",
        entity: "CrmQuotation",
        entityId: quotation.id,
        newValue: quotation as any,
      }
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requirementId = searchParams.get("requirementId");

    let whereClause: any = {};
    if (requirementId) whereClause.requirementId = requirementId;

    if (!isCrmAdminOrManager(user.role)) {
      whereClause.baId = user.id;
    }

    const quotations = await prisma.crmQuotation.findMany({
      where: whereClause,
      include: {
        partner: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove internal financial fields for BAs
    if (!isCrmAdminOrManager(user.role)) {
      const sanitized = quotations.map(q => {
        const { totalCost, grossMargin, netMargin, partnerPrice, ...rest } = q as any;
        return rest;
      });
      return NextResponse.json(sanitized);
    }

    return NextResponse.json(quotations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
