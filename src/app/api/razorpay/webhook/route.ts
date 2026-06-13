import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing Razorpay signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!webhookSecret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not defined in env");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    // Verify the webhook signature
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(rawBody);
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      console.error("Invalid webhook signature.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Handle the payment.captured or order.paid event
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      if (orderId) {
        // Update the booking status and fetch related data
        let booking;
        try {
          booking = await prisma.booking.update({
            where: { razorpayOrderId: orderId },
            data: {
              status: "CONFIRMED",
              razorpayPaymentId: paymentId,
            },
            include: { 
              user: true,
              property: true
            }
          });
        } catch (dbError) {
          console.error("Booking update failed. Order ID:", orderId, dbError);
          return NextResponse.json({ error: "Booking not found or update failed" }, { status: 404 });
        }


        // Send Email Notification
        if (booking && booking.user && booking.user.email) {
          const email = booking.user.email;
          // In clerk-sync, user email is stored as email. In schema, let's verify if user has email field.
          // Wait, Clerk sync might have it. Let's just use it safely.
          const checkInStr = booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : undefined;
          const checkOutStr = booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : undefined;
          
          try {
            await sendBookingConfirmation(
              email,
              booking.user.name || booking.guestName || "Guest",
              {
                bookingId: booking.id,
                propertyName: booking.property?.name,
                checkIn: checkInStr,
                checkOut: checkOutStr,
                amount: booking.amount
              }
            );
          } catch (emailError) {
            // Do not fail the webhook if the email fails to send
            console.error("Failed to send booking confirmation email:", emailError);
          }

        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
