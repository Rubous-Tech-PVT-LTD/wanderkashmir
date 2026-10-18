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
    const requestedRooms = Math.max(1, parseInt(searchParams.get("rooms") || "1", 10));

    if (!checkInStr || !checkOutStr) {
      return NextResponse.json({ error: "Missing required check-in and check-out dates" }, { status: 400 });
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkIn >= checkOut) {
      return NextResponse.json({ error: "Invalid check-in or check-out date range" }, { status: 400 });
    }

    // Explicit scalar selection protects against database schema discrepancies
    const property = await prisma.property.findFirst({
      where: {
        OR: [
          { id },
          { name: { equals: id.replace(/-/g, " "), mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        totalRooms: true,
        pricePerNight: true,
        isApproved: true,
        status: true,
        roomTypes: {
          select: {
            id: true,
            propertyId: true,
            name: true,
            description: true,
            basePrice: true,
            capacity: true,
            totalUnits: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Generate every calendar day of the stay
    const dates: Date[] = [];
    const currentDate = new Date(checkIn);
    while (currentDate < checkOut) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (dates.length === 0) {
      return NextResponse.json({ error: "Stay duration must be at least 1 night" }, { status: 400 });
    }

    // 1. Find overlapping bookings for this property (Confirmed or Pending created within last 15 mins)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        propertyId: property.id,
        OR: [
          { status: "CONFIRMED" },
          {
            status: "PENDING",
            createdAt: { gt: fifteenMinutesAgo },
          },
        ],
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } },
        ],
      },
      select: {
        roomTypeId: true,
        checkIn: true,
        checkOut: true,
        numberOfRooms: true,
      },
    });

    // 2. Fetch inventory overrides for rooms in this property over date range
    const roomTypeIds = property.roomTypes.map((rt) => rt.id);
    const inventoryOverrides =
      roomTypeIds.length > 0
        ? await prisma.roomInventory.findMany({
            where: {
              roomTypeId: { in: roomTypeIds },
              date: { gte: checkIn, lt: checkOut },
            },
          })
        : [];

    const overrideMap = new Map<string, typeof inventoryOverrides[0]>();
    inventoryOverrides.forEach((inv) => {
      overrideMap.set(`${inv.roomTypeId}_${new Date(inv.date).getTime()}`, inv);
    });

    // 3. Evaluate availability for each Room Type
    const availableRoomTypes: Array<{
      id: string;
      name: string;
      capacity: number;
      totalPrice: number;
      pricePerNight: number;
      basePrice: number;
    }> = [];

    for (const roomType of property.roomTypes) {
      let isAvailableForFullStay = true;
      let totalAccumulatedPrice = 0;

      for (const d of dates) {
        const dTime = d.getTime();
        const override = overrideMap.get(`${roomType.id}_${dTime}`);
        const baseUnits = override ? override.available : roomType.totalUnits;

        // Sum overlapping bookings for this room on this specific date
        let bookingsCount = 0;
        for (const b of overlappingBookings) {
          if (
            b.roomTypeId === roomType.id &&
            b.checkIn &&
            new Date(b.checkIn) <= d &&
            b.checkOut &&
            new Date(b.checkOut) > d
          ) {
            bookingsCount += b.numberOfRooms || 1;
          }
        }

        const unitsLeft = baseUnits - bookingsCount;
        if (unitsLeft < requestedRooms) {
          isAvailableForFullStay = false;
          break;
        }

        totalAccumulatedPrice += override?.priceOverride ?? roomType.basePrice;
      }

      if (isAvailableForFullStay) {
        availableRoomTypes.push({
          id: roomType.id,
          name: roomType.name,
          capacity: roomType.capacity,
          basePrice: roomType.basePrice,
          totalPrice: totalAccumulatedPrice * requestedRooms,
          pricePerNight: Math.round(totalAccumulatedPrice / dates.length) * requestedRooms,
        });
      }
    }

    // 4. Legacy fallback if property has no defined RoomTypes
    if (property.roomTypes.length === 0) {
      const bookingsCount = overlappingBookings.reduce(
        (sum, b) => sum + (b.numberOfRooms || 1),
        0
      );
      const roomsLeft = (property.totalRooms || 1) - bookingsCount;
      const isAvailable = roomsLeft >= requestedRooms;

      return NextResponse.json({
        available: isAvailable,
        roomsLeft: Math.max(0, roomsLeft),
        availableRoomTypes: isAvailable
          ? [
              {
                id: "default",
                name: "Standard Accommodation",
                capacity: 2,
                basePrice: property.pricePerNight,
                totalPrice: property.pricePerNight * dates.length * requestedRooms,
                pricePerNight: property.pricePerNight * requestedRooms,
              },
            ]
          : [],
      });
    }

    return NextResponse.json({
      available: availableRoomTypes.length > 0,
      availableRoomTypes,
    });
  } catch (error) {
    console.error("Availability Check Error in V2:", error);
    return NextResponse.json(
      { error: "Failed to check hotel availability" },
      { status: 500 }
    );
  }
}
