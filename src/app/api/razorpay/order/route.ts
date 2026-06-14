import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";
import { ensureDbUser } from "@/lib/clerk-sync";
import prisma from "@/lib/prisma";

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      propertyId, vehicleId, guideProfileId, tourId,
      checkIn, checkOut, guests, amount,
      baseAmount, taxiAmount, guideAmount
    } = body;

    if (!propertyId && !vehicleId && !guideProfileId && !tourId) {
      return NextResponse.json({ error: "Missing required booking entity" }, { status: 400 });
    }
    
    if (!amount) {
      return NextResponse.json({ error: "Missing required amount" }, { status: 400 });
    }

    // Ensure Clerk user exists in Prisma DB before booking
    await ensureDbUser(userId);

    const amountInPaise = Math.round(amount * 100);

    // Final Availability Check for Properties
    if (propertyId && checkIn && checkOut) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { totalRooms: true }
      });
      
      if (!property) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }

      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const overlappingBookings = await prisma.booking.count({
        where: {
          propertyId,
          OR: [
            { status: "CONFIRMED" },
            { status: "PENDING", createdAt: { gt: fifteenMinutesAgo } }
          ],
          AND: [
            { checkIn: { lt: new Date(checkOut) } },
            { checkOut: { gt: new Date(checkIn) } }
          ]
        }
      });
      
      if (property.totalRooms - overlappingBookings <= 0) {
        return NextResponse.json({ error: "Dates are no longer available. Please try different dates." }, { status: 400 });
      }
    }

    // 2. Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        propertyId: propertyId || "",
        vehicleId: vehicleId || "",
        guideProfileId: guideProfileId || "",
        tourId: tourId || "",
        userId: userId,
        checkIn: checkIn || "",
        checkOut: checkOut || "",
        guests: guests ? guests.toString() : "0",
      },
    });

    // 3. Create a PENDING Booking in our database
    await prisma.booking.create({
      data: {
        userId: userId,
        propertyId: propertyId || null,
        vehicleId: vehicleId || null,
        guideProfileId: guideProfileId || null,
        tourId: tourId || null,
        amount: amount,
        baseAmount: baseAmount || amount,
        taxiAmount: taxiAmount || 0,
        guideAmount: guideAmount || 0,
        status: "PENDING",
        razorpayOrderId: order.id,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        guests: guests ? parseInt(guests.toString()) : null,
        guestName: body.guestName || null,
        guestPhone: body.guestPhone || null,
        specialRequests: body.specialRequests || null,
        otherGuests: body.otherGuests || null,
      } as any,
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
