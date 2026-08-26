import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCrmUser, isCrmAdminOrManager } from "@/lib/crmAuth";
import { PDFDocument, rgb } from "pdf-lib";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCrmUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const quotation = await prisma.crmQuotation.findUnique({
      where: { id: params.id },
      include: { items: true, requirement: { include: { partner: true } } },
    });

    if (!quotation) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    if (!isCrmAdminOrManager(user.role) && quotation.baId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    page.drawText(`Quotation: WK-Q-${quotation.id.slice(0, 8).toUpperCase()}`, {
      x: 50,
      y: height - 50,
      size: 24,
      color: rgb(0, 0.53, 0.71),
    });

    page.drawText(`Version: ${quotation.version}`, { x: 50, y: height - 80, size: 12 });
    page.drawText(`Customer: ${quotation.requirement.customerName}`, { x: 50, y: height - 100, size: 12 });
    page.drawText(`Valid Until: ${quotation.validUntil ? quotation.validUntil.toDateString() : 'N/A'}`, { x: 50, y: height - 120, size: 12 });
    
    // Selling Price
    page.drawText(`Final Selling Price: Rs. ${quotation.partnerPrice}`, { x: 50, y: height - 150, size: 16 });

    let yOffset = height - 200;
    page.drawText(`Services Included:`, { x: 50, y: yOffset, size: 14 });
    yOffset -= 20;

    quotation.items.forEach(item => {
      page.drawText(`- ${item.category}: ${item.description} (Qty: ${item.quantity})`, { x: 60, y: yOffset, size: 12 });
      yOffset -= 20;
    });

    // We do NOT include internal costs or margins in the generated PDF for the customer!

    if (quotation.terms) {
      yOffset -= 20;
      page.drawText(`Terms & Conditions:`, { x: 50, y: yOffset, size: 14 });
      yOffset -= 20;
      page.drawText(quotation.terms.substring(0, 200) + (quotation.terms.length > 200 ? "..." : ""), { x: 50, y: yOffset, size: 10 });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Quotation-WK-Q-${quotation.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
