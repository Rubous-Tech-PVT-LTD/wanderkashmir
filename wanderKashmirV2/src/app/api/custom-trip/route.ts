import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      travelDates,
      durationDays,
      guestsCount,
      destinations,
      hotelType,
      cabType,
      budget,
      specialRequests,
    } = body;

    const trimmedName = (name || "").trim();
    const trimmedPhone = (phone || "").trim();

    if (!trimmedName) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, "").length < 8) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid phone number (at least 8-10 digits)." },
        { status: 400 }
      );
    }

    const formattedDates = travelDates || (durationDays ? `${durationDays} Days` : "Upcoming");
    const specialRequestsCombined = [
      durationDays ? `Duration: ${durationDays} Days` : null,
      budget ? `Budget: ${budget}` : null,
      specialRequests ? `Notes: ${specialRequests}` : null,
    ].filter(Boolean).join(" | ");

    const inquiry = await prisma.customTourRequest.create({
      data: {
        name: trimmedName,
        phone: trimmedPhone,
        email: email ? String(email).trim() : null,
        travelDates: formattedDates,
        guestsCount: guestsCount || "2 Adults",
        destinations: Array.isArray(destinations) && destinations.length > 0 ? destinations : ["Srinagar", "Gulmarg", "Pahalgam"],
        hotelType: hotelType || "3 Star Standard",
        cabType: cabType || "Sedan / SUV",
        specialRequests: specialRequestsCombined || null,
        status: "PENDING",
      },
    });

    const referenceId = `WK-${inquiry.id.slice(-6).toUpperCase()}`;

    try {
      revalidatePath("/wander-admin");
    } catch (_) {}

    return NextResponse.json({
      success: true,
      referenceId,
      inquiryId: inquiry.id,
      inquiry,
    });
  } catch (error: any) {
    console.error("Error creating custom trip request API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
