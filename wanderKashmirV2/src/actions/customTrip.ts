"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CustomTripInput {
  name: string;
  phone: string;
  email?: string;
  travelDates?: string;
  durationDays?: string;
  guestsCount: string;
  destinations: string[];
  hotelType?: string;
  cabType?: string;
  budget?: string;
  specialRequests?: string;
}

export async function submitCustomTripRequest(input: CustomTripInput) {
  try {
    const trimmedName = (input.name || "").trim();
    const trimmedPhone = (input.phone || "").trim();

    if (!trimmedName) {
      return { success: false, error: "Please enter your full name." };
    }
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, "").length < 8) {
      return { success: false, error: "Please enter a valid phone number (at least 8-10 digits)." };
    }

    const travelDates = input.travelDates || (input.durationDays ? `${input.durationDays} Days` : "Upcoming");
    const specialRequestsCombined = [
      input.durationDays ? `Duration: ${input.durationDays} Days` : null,
      input.budget ? `Budget: ${input.budget}` : null,
      input.specialRequests ? `Notes: ${input.specialRequests}` : null,
    ].filter(Boolean).join(" | ");

    const inquiry = await prisma.customTourRequest.create({
      data: {
        name: trimmedName,
        phone: trimmedPhone,
        email: input.email ? input.email.trim() : null,
        travelDates: travelDates,
        guestsCount: input.guestsCount || "2 Adults",
        destinations: input.destinations && input.destinations.length > 0 ? input.destinations : ["Srinagar", "Gulmarg", "Pahalgam"],
        hotelType: input.hotelType || "3 Star Standard",
        cabType: input.cabType || "Sedan / SUV",
        specialRequests: specialRequestsCombined || null,
        status: "PENDING",
      },
    });

    const referenceId = `WK-${inquiry.id.slice(-6).toUpperCase()}`;

    try {
      revalidatePath("/wander-admin");
    } catch (_) {}

    return {
      success: true,
      referenceId,
      inquiryId: inquiry.id,
      inquiry: {
        id: inquiry.id,
        name: inquiry.name,
        phone: inquiry.phone,
        travelDates: inquiry.travelDates,
        guestsCount: inquiry.guestsCount,
        destinations: inquiry.destinations,
        hotelType: inquiry.hotelType,
        cabType: inquiry.cabType,
        createdAt: inquiry.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error submitting custom trip request:", error);
    return {
      success: false,
      error: "Unable to save your request right now. Please try again or reach out on WhatsApp.",
    };
  }
}
