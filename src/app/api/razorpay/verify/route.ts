import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { processBookingEmailInBackground } from "@/lib/worker";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    // Generate expected signature
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return NextResponse.json({ error: "Transaction is not legit!" }, { status: 400 });
    }

    // Payment is valid, update Booking status
    const booking = await prisma.booking.update({
      where: { razorpayOrderId: razorpay_order_id } as any,
      data: {
        status: "CONFIRMED",
        razorpayPaymentId: razorpay_payment_id,
      } as any,
    });

    // Fire and forget background worker to process email & PDF
    processBookingEmailInBackground(booking.id).catch(console.error);

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
