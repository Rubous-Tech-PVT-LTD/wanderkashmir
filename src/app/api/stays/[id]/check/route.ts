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
      include: {
        roomTypes: true
      }
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Get all dates in range
    const dates: Date[] = [];
    let currentDate = new Date(checkIn);
    while (currentDate < checkOut) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 1. Get all overlapping bookings for this property
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const overlappingBookings = await prisma.booking.findMany({
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
      },
      select: { roomTypeId: true, checkIn: true, checkOut: true }
    });

    // 2. Get all custom inventory rules
    const inventoryOverrides = await prisma.roomInventory.findMany({
      where: {
        roomTypeId: { in: property.roomTypes.map(rt => rt.id) },
        date: { gte: checkIn, lt: checkOut }
      }
    });

    // 3. Evaluate each Room Type
    const availableRoomTypes = [];
    
    for (const roomType of property.roomTypes) {
      let isAvailableForFullStay = true;
      let totalPrice = 0;
      
      for (const d of dates) {
        // Find override for this specific date
        const override = inventoryOverrides.find(
          inv => inv.roomTypeId === roomType.id && new Date(inv.date).getTime() === d.getTime()
        );
        
        // Base units available (either custom overridden limit or the total physical units)
        const baseUnits = override ? override.available : roomType.totalUnits;
        
        // Count bookings that overlap with this specific date
        const bookingsOnDate = overlappingBookings.filter(b => 
          b.roomTypeId === roomType.id &&
          b.checkIn && new Date(b.checkIn) <= d &&
          b.checkOut && new Date(b.checkOut) > d
        ).length;
        
        const unitsLeft = baseUnits - bookingsOnDate;
        
        if (unitsLeft <= 0) {
          isAvailableForFullStay = false;
          break; // Stop checking dates if it's unavailable on even one day
        }
        
        // Accumulate price
        totalPrice += override?.priceOverride ?? roomType.basePrice;
      }
      
      if (isAvailableForFullStay) {
        availableRoomTypes.push({
          id: roomType.id,
          name: roomType.name,
          capacity: roomType.capacity,
          totalPrice,
          pricePerNight: Math.round(totalPrice / dates.length)
        });
      }
    }

    // Fallback: If no RoomTypes exist (legacy properties), fallback to property availability
    if (property.roomTypes.length === 0) {
      const bookingsCount = overlappingBookings.length;
      const roomsLeft = property.totalRooms - bookingsCount;
      if (roomsLeft > 0) {
        return NextResponse.json({
          available: true,
          roomsLeft: Math.max(0, roomsLeft),
          availableRoomTypes: [] // legacy format
        });
      } else {
        return NextResponse.json({ available: false, availableRoomTypes: [] });
      }
    }

    return NextResponse.json({
      available: availableRoomTypes.length > 0,
      availableRoomTypes
    });
    
  } catch (error) {
    console.error("Availability Check Error:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
