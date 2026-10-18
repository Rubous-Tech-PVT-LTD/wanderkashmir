import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment verification tokens" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is not configured on the server");
      return NextResponse.json({ error: "Payment verification configuration error" }, { status: 500 });
    }

    // Verify HMAC SHA-256 signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn("Invalid Razorpay payment signature mismatch detected!");
      return NextResponse.json({ error: "Payment verification signature mismatch. Transaction not authorized." }, { status: 400 });
    }

    // Find the associated pending booking
    const booking = await prisma.booking.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: {
        property: {
          select: { name: true, location: true },
        },
        roomType: {
          select: { name: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Associated booking record not found" }, { status: 404 });
    }

    // Update booking status from PENDING to CONFIRMED
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CONFIRMED",
        razorpayPaymentId: razorpay_payment_id,
      },
      select: {
        id: true,
        propertyId: true,
        checkIn: true,
        checkOut: true,
        amount: true,
        guestName: true,
        numberOfRooms: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and booking confirmed",
      booking: {
        id: updatedBooking.id,
        propertyId: updatedBooking.propertyId,
        propertyName: booking.property?.name,
        roomName: booking.roomType?.name || "Standard",
        checkIn: updatedBooking.checkIn,
        checkOut: updatedBooking.checkOut,
        amount: updatedBooking.amount,
        guestName: updatedBooking.guestName,
        numberOfRooms: updatedBooking.numberOfRooms,
        status: updatedBooking.status,
      },
    });
  } catch (error: any) {
    console.error("Hotel Booking Payment Verification Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify hotel payment" },
      { status: 500 }
    );
  }
}
