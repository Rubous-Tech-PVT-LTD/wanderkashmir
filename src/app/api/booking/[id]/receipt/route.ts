import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/worker";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bookingId = params.id;

    // Fetch booking details and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        property: { include: { vendorProfile: true } },
        vehicle: { include: { vendorProfile: true } },
        guideProfile: { include: { vendorProfile: { include: { user: true } } } }
      }
    });

    if (!booking) {
      return new NextResponse("Booking not found", { status: 404 });
    }

    if (booking.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(booking);

    // Return as downloadable file
    const filename = `WanderKashmir_Invoice_${booking.id.slice(-8)}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[RECEIPT_DOWNLOAD_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
