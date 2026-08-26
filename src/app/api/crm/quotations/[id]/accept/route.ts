import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: params.id },
      include: { requirement: true },
    });

    if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    if (!isCrmAdminOrManager(user.role) && quotation.baId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (quotation.status !== "SENT" && quotation.status !== "VIEWED" && quotation.status !== "NEGOTIATION" && quotation.status !== "APPROVED") {
      return NextResponse.json({ error: "Quotation is not in a state to be accepted" }, { status: 400 });
    }

    // 1. Mark Quotation as ACCEPTED
    const updatedQuotation = await prisma.crmQuotation.update({
      where: { id: params.id },
      data: { status: "ACCEPTED" },
    });

    // 2. Mark Requirement as CONVERTED_TO_BOOKING
    await prisma.crmRequirement.update({
      where: { id: quotation.requirementId },
      data: { status: "CONVERTED_TO_BOOKING" },
    });

    // 3. Create CRM Booking
    const crmBooking = await prisma.crmBooking.create({
      data: {
        quotationId: quotation.id,
        requirementId: quotation.requirementId,
        partnerId: quotation.partnerId,
        baId: quotation.baId,
        travelDate: quotation.requirement.travelDate,
        returnDate: quotation.requirement.returnDate,
        
        customerPrice: quotation.customerPrice,
        partnerPrice: quotation.partnerPrice,
        wanderKashmirGrossMargin: quotation.grossMargin, // Retained field mapped
        expectedMargin: quotation.netMargin,
        totalCost: quotation.totalCost,
        realizedNetMargin: 0,
        
        status: "PENDING",
      }
    });

    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "ACCEPT",
        entity: "CrmQuotation",
        entityId: quotation.id,
        newValue: crmBooking as any,
      }
    });

    return NextResponse.json({ quotation: updatedQuotation, booking: crmBooking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
