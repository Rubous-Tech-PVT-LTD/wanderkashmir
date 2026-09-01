import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: quotationId } = await params;

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: quotationId },
      include: { requirement: { include: { partner: true } } }
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const isAdminOrManager = ["CRM_ADMIN", "SALES_MANAGER"].includes(user.role);
    if (!isAdminOrManager && quotation.baId !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this quotation" }, { status: 403 });
    }

    if (quotation.status !== "CONFIRMED" || !quotation.confirmationProofUrl) {
      return NextResponse.json({ error: "Quotation must be CONFIRMED with proof before booking" }, { status: 400 });
    }

    // Check if booking already exists for this quotation
    const existingBooking = await prisma.crmBooking.findFirst({
      where: { quotationId }
    });

    if (existingBooking) {
      return NextResponse.json(existingBooking, { status: 200 });
    }

    // Create the booking
    const booking = await prisma.crmBooking.create({
      data: {
        quotationId,
        requirementId: quotation.requirementId,
        partnerId: quotation.partnerId,
        baId: quotation.baId,
        status: "CONFIRMED",
        partnerPrice: quotation.partnerPrice,
        totalCost: quotation.totalCost,
        expectedMargin: quotation.grossMargin,
        wanderKashmirGrossMargin: quotation.wanderKashmirMargin,
      }
    });

    // Audit log
    await prisma.crmAuditLog.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "CREATE_BOOKING",
        entity: "CrmBooking",
        entityId: booking.id,
        newValue: booking as any,
      }
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create booking:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
