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

    // Payment is valid, check for addons and update Booking status
    const booking = await prisma.booking.findUnique({
      where: { razorpayOrderId: razorpay_order_id }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    let updatedData: any = {
      status: "CONFIRMED",
      razorpayPaymentId: razorpay_payment_id,
    };

    // Automatic Assignment for Tour Addons
    if (booking.tourId) {
      if (booking.guideAmount > 0 && !booking.guideProfileId) {
        const availableGuide = await prisma.guideProfile.findFirst({
          where: { isApproved: true, status: "APPROVED" }
        });
        if (availableGuide) updatedData.guideProfileId = availableGuide.id;
      }
      if (booking.taxiAmount > 0 && !booking.vehicleId) {
        const availableTaxi = await prisma.vehicle.findFirst({
          where: { isApproved: true, status: "APPROVED" }
        });
        if (availableTaxi) updatedData.vehicleId = availableTaxi.id;
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: updatedData,
    });

    // Run the email process, but wait for it so Serverless environments don't kill it prematurely
    try {
      await processBookingEmailInBackground(booking.id);
    } catch (emailError) {
      console.error("Failed to process booking email in background:", emailError);
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
