import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      propertyId,
      roomTypeId,
      checkIn,
      checkOut,
      rooms = 1,
      adults = 1,
      childrenCount = 0,
      guestName,
      guestPhone,
      guestEmail,
      specialRequests,
      otherGuests,
      promoCode,
    } = body;

    // 1. Mandatory Parameter Validation
    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json({ error: "Missing property identifier" }, { status: 400 });
    }

    if (!checkIn || !checkOut) {
      return NextResponse.json({ error: "Missing check-in or check-out dates" }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkInDate >= checkOutDate) {
      return NextResponse.json({ error: "Invalid reservation dates" }, { status: 400 });
    }

    const cleanGuestName = (guestName || "").trim();
    const cleanGuestPhone = (guestPhone || "").trim();
    const cleanGuestEmail = (guestEmail || "").trim().toLowerCase();

    if (!cleanGuestName || cleanGuestName.length < 2) {
      return NextResponse.json({ error: "Please provide a valid lead guest name" }, { status: 400 });
    }

    const digitsOnly = cleanGuestPhone.replace(/\D/g, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return NextResponse.json({ error: "Please provide a valid phone number (8-15 digits)" }, { status: 400 });
    }

    const roomsCount = Math.max(1, Math.min(20, parseInt(String(rooms), 10) || 1));
    const adultsCount = Math.max(1, parseInt(String(adults), 10) || 1);
    const childrenNum = Math.max(0, parseInt(String(childrenCount), 10) || 0);

    // 2. Verified Property & Room Retrieval
    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id: propertyId }, { name: { equals: propertyId.replace(/-/g, " "), mode: "insensitive" } }],
        isApproved: true,
        status: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        pricePerNight: true,
        totalRooms: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found or is currently not active" }, { status: 404 });
    }

    let verifiedRoom: { id: string; name: string; basePrice: number; totalUnits: number } | null = null;

    if (roomTypeId && roomTypeId !== "default") {
      const room = await prisma.roomType.findFirst({
        where: {
          id: roomTypeId,
          propertyId: property.id,
        },
        select: {
          id: true,
          name: true,
          basePrice: true,
          totalUnits: true,
        },
      });

      if (!room) {
        return NextResponse.json({ error: "Selected room type is invalid for this property" }, { status: 400 });
      }
      verifiedRoom = room;
    }

    // 3. Final Live Availability Check (Overlap calculation)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const overlappingBookingsCount = await prisma.booking.count({
      where: {
        propertyId: property.id,
        ...(verifiedRoom ? { roomTypeId: verifiedRoom.id } : {}),
        OR: [
          { status: "CONFIRMED" },
          { status: "PENDING", createdAt: { gt: fifteenMinutesAgo } },
        ],
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
    });

    const maxUnits = verifiedRoom ? verifiedRoom.totalUnits : property.totalRooms || 1;
    if (maxUnits - overlappingBookingsCount < roomsCount) {
      return NextResponse.json(
        { error: "Selected room or dates are no longer available. Please select different dates." },
        { status: 409 }
      );
    }

    // 4. Server-Side Price Calculation (Zero trust of client-submitted prices)
    const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    const unitPrice = verifiedRoom ? verifiedRoom.basePrice : property.pricePerNight;
    const baseAmount = Math.round(unitPrice * nights * roomsCount);

    // 5. Promo Code Verification
    let discountAmount = 0;
    let verifiedPromoCode: string | null = null;

    if (promoCode && typeof promoCode === "string" && promoCode.trim()) {
      const cleanCode = promoCode.trim().toUpperCase();
      const promo = await prisma.promoCode.findUnique({
        where: { code: cleanCode },
      });

      if (promo && promo.isActive && promo.status === "APPROVED") {
        const isGlobal = !promo.tourId && !promo.propertyId && !promo.vehicleId && !promo.guideProfileId;
        if (isGlobal || promo.propertyId === property.id) {
          const discountPercent = Math.min(100, Math.max(0, promo.discountPercent));
          discountAmount = Math.round((baseAmount * discountPercent) / 100);
          verifiedPromoCode = cleanCode;
        }
      }
    }

    const discountedSubtotal = Math.max(0, baseAmount - discountAmount);
    // V1 proven formula: 15% Convenience & Platform Fee
    const platformFee = Math.round(discountedSubtotal * 0.15);
    const totalAmount = discountedSubtotal + platformFee;
    const amountInPaise = Math.round(totalAmount * 100);

    // 6. Customer User Resolution
    const userEmail = cleanGuestEmail || `guest_${digitsOnly}@wanderkashmir.com`;
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: userEmail }, { phone: cleanGuestPhone }],
      },
      select: { id: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: cleanGuestName,
          email: userEmail,
          phone: cleanGuestPhone,
          role: "CUSTOMER",
        },
        select: { id: true },
      });
    }

    // 7. Razorpay Order Generation
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment gateway is currently not configured on this server." },
        { status: 500 }
      );
    }

    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const receiptId = `stay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          propertyId: property.id,
          propertyName: property.name,
          roomTypeId: verifiedRoom?.id || "",
          roomName: verifiedRoom?.name || "Standard",
          checkIn: checkInDate.toISOString().split("T")[0],
          checkOut: checkOutDate.toISOString().split("T")[0],
          rooms: roomsCount.toString(),
          guestName: cleanGuestName,
          guestPhone: cleanGuestPhone,
        },
      }),
    });

    if (!razorpayRes.ok) {
      const rzpErr = await razorpayRes.json();
      console.error("Razorpay order creation failed:", rzpErr);
      return NextResponse.json(
        { error: rzpErr.error?.description || "Failed to initialize payment gateway order" },
        { status: 502 }
      );
    }

    const orderData = await razorpayRes.json();

    // 8. Create PENDING Booking Record
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        propertyId: property.id,
        roomTypeId: verifiedRoom ? verifiedRoom.id : null,
        amount: totalAmount,
        baseAmount: baseAmount,
        status: "PENDING",
        razorpayOrderId: orderData.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        numberOfRooms: roomsCount,
        adults: adultsCount,
        childrenCount: childrenNum,
        guestName: cleanGuestName,
        guestPhone: cleanGuestPhone,
        specialRequests: specialRequests ? String(specialRequests).slice(0, 500) : null,
        otherGuests: Array.isArray(otherGuests) && otherGuests.length > 0 ? (otherGuests as any) : undefined,
        promoCode: verifiedPromoCode,
        discountAmount: discountAmount,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: keyId,
      bookingId: booking.id,
      propertyId: property.id,
      propertyName: property.name,
      totalAmount: totalAmount,
      baseAmount: baseAmount,
      platformFee: platformFee,
      discountAmount: discountAmount,
    });
  } catch (error: any) {
    console.error("Hotel Booking Order Creation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate hotel reservation" },
      { status: 500 }
    );
  }
}
