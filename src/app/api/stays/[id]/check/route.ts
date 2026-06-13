import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const checkInStr = searchParams.get("in");
    const checkOutStr = searchParams.get("out");

    if (!checkInStr || !checkOutStr) {
      return NextResponse.json({ error: "Missing dates" }, { status: 400 });
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    const property = await prisma.property.findUnique({
      where: { id },
      select: { totalRooms: true, availableRooms: true }
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Find overlapping bookings for this property
    // An overlapping booking is one where the checkIn is before the requested checkOut
    // AND the checkOut is after the requested checkIn
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const overlappingBookings = await prisma.booking.count({
      where: {
        propertyId: id,
        OR: [
          { status: "CONFIRMED" },
          { 
            status: "PENDING",
            createdAt: { gt: fifteenMinutesAgo } 
          }
        ],
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } }
        ]
      }
    });

    const roomsLeft = property.totalRooms - overlappingBookings;
    const isAvailable = roomsLeft > 0;

    return NextResponse.json({
      available: isAvailable,
      roomsLeft: Math.max(0, roomsLeft),
    });
  } catch (error) {
    console.error("Availability Check Error:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
