import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function generateInvoicePDF(booking: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const primaryColor = rgb(0.011, 0.517, 0.776); // text-sky-600 approx
  const grayColor = rgb(0.3, 0.3, 0.3);

  // Header
  page.drawText("Indiahiles", { x: 50, y: height - 60, size: 24, font: boldFont, color: primaryColor });
  page.drawText("INVOICE & BOOKING CONFIRMATION", { x: 50, y: height - 90, size: 12, font, color: grayColor });

  // Booking Details
  page.drawText(`Booking ID: ${booking.id.slice(-8).toUpperCase()}`, { x: 50, y: height - 140, size: 12, font: boldFont });
  page.drawText(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, { x: 50, y: height - 160, size: 10, font });
  page.drawText(`Status: ${booking.status}`, { x: 50, y: height - 180, size: 10, font });

  // Customer Details
  page.drawText("Customer Details", { x: 350, y: height - 140, size: 12, font: boldFont });
  page.drawText(`Name: ${booking.user?.name || 'N/A'}`, { x: 350, y: height - 160, size: 10, font });
  page.drawText(`Email: ${booking.user?.email || 'N/A'}`, { x: 350, y: height - 180, size: 10, font });

  // Divider
  page.drawLine({
    start: { x: 50, y: height - 210 },
    end: { x: 550, y: height - 210 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Service Details
  let serviceName = "Custom Package";
  let vendorName = "Indiahiles";
  let vendorPhone = "+91 60058 88754"; // Default support
  let vendorAddress = "Srinagar, Kashmir";
  
  if (booking.property) {
    serviceName = booking.property.name;
    vendorName = booking.property.vendorProfile?.businessName || "Unknown Vendor";
    vendorPhone = booking.property.vendorProfile?.phone || vendorPhone;
    vendorAddress = booking.property.location || vendorAddress;
  } else if (booking.vehicle) {
    serviceName = `${booking.vehicle.make} ${booking.vehicle.model}`;
    vendorName = booking.vehicle.vendorProfile?.businessName || "Unknown Vendor";
    vendorPhone = booking.vehicle.vendorProfile?.phone || vendorPhone;
  } else if (booking.guideProfile) {
    serviceName = `Guide Service`;
    vendorName = booking.guideProfile.vendorProfile?.businessName || "Unknown Vendor";
    vendorPhone = booking.guideProfile.vendorProfile?.phone || vendorPhone;
  }

  page.drawText("Service Details", { x: 50, y: height - 240, size: 14, font: boldFont });
  page.drawText(`Service: ${serviceName}`, { x: 50, y: height - 270, size: 12, font });
  page.drawText(`Provider: ${vendorName}`, { x: 50, y: height - 290, size: 12, font });
  page.drawText(`Contact: ${vendorPhone}`, { x: 50, y: height - 310, size: 12, font });
  page.drawText(`Address: ${vendorAddress}`, { x: 50, y: height - 330, size: 12, font });
  page.drawText(`Map Location: This functionality will be implemented soon`, { x: 50, y: height - 350, size: 11, font, color: rgb(0.5, 0.5, 0.5) });

  if (booking.checkIn && booking.checkOut) {
    page.drawText(`Check-in: ${new Date(booking.checkIn).toLocaleDateString()}`, { x: 350, y: height - 270, size: 12, font });
    page.drawText(`Check-out: ${new Date(booking.checkOut).toLocaleDateString()}`, { x: 350, y: height - 290, size: 12, font });
  }

  // Pricing
  page.drawText("Payment Summary", { x: 50, y: height - 380, size: 14, font: boldFont });
  
  page.drawText("Total Amount Paid:", { x: 50, y: height - 410, size: 12, font });
  page.drawText(`Rs. ${booking.amount.toLocaleString('en-IN')}`, { x: 450, y: height - 410, size: 14, font: boldFont, color: primaryColor });

  // Footer
  page.drawLine({
    start: { x: 50, y: 100 },
    end: { x: 550, y: 100 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  page.drawText("Thank you for booking with Indiahiles!", { x: 50, y: 70, size: 10, font: boldFont, color: grayColor });
  page.drawText("For support, contact support@indiahiles.com or call +91 60058 88754", { x: 50, y: 50, size: 10, font, color: grayColor });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function processBookingEmailInBackground(bookingId: string) {
  try {
    // 1. Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        property: { include: { vendorProfile: true } },
        vehicle: { include: { vendorProfile: true } },
        guideProfile: { include: { vendorProfile: { include: { user: true } } } }
      }
    });

    if (!booking || !booking.user?.email) {
      console.error("Booking or User Email not found for ID:", bookingId);
      return;
    }

    // 2. Generate PDF
    const pdfBuffer = await generateInvoicePDF(booking);

    // 3. Send Email via Resend
    let serviceName = "your booking";
    if (booking.property) serviceName = booking.property.name;
    else if (booking.vehicle) serviceName = `${booking.vehicle.make} ${booking.vehicle.model}`;
    else if (booking.guideProfile) serviceName = "Guide Service";

    await resend.emails.send({
      from: 'Indiahiles <support@indiahiles.com>',
      to: booking.user.email,
      subject: `Booking Confirmed: ${serviceName} 🎉`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${booking.user.name},</h2>
          <p>Thank you for choosing Indiahiles!</p>
          <p>Your booking for <strong>${serviceName}</strong> has been successfully confirmed.</p>
          <p>We have attached your official booking invoice and ticket to this email as a PDF.</p>
          <br/>
          <p>If you have any questions or need to make changes, please reply to this email or contact our support team.</p>
          <p>📧 Email: support@indiahiles.com<br/>
          📞 WhatsApp: +91 60058 88754</p>
          <br/>
          <p>Best Regards,<br/><strong>The Indiahiles Team</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `Indiahiles_Invoice_${booking.id.slice(-8)}.pdf`,
          content: pdfBuffer,
        }
      ]
    });


  } catch (error) {
    console.error(`[Worker] Error processing booking email for ${bookingId}:`, error);
  }
}
