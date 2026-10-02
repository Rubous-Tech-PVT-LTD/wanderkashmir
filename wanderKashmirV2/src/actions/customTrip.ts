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
  destinations?: string[];
  hotelType?: string;
  cabType?: string;
  budget?: string;
  specialRequests?: string;
}

export interface CustomTripResult {
  success: boolean;
  referenceId?: string;
  inquiryId?: string;
  inquiry?: {
    id: string;
    name: string;
    phone: string;
    travelDates: string | null;
    guestsCount: string;
    destinations: string[];
    hotelType: string;
    cabType: string;
    createdAt: string;
  };
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_REGEX = /^[\d\s+\-()]+$/;

export async function submitCustomTripRequest(
  input: CustomTripInput
): Promise<CustomTripResult> {
  try {
    const trimmedName = (input.name || "").trim();
    const trimmedPhone = (input.phone || "").trim();
    const trimmedEmail = (input.email || "").trim();
    const trimmedGuests = (input.guestsCount || "").trim();

    // 1. Name validation
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Please enter your full name (at least 2 characters)." };
    }
    if (trimmedName.length > 100) {
      return { success: false, error: "Name is too long (maximum 100 characters)." };
    }

    // 2. Phone validation
    if (!trimmedPhone) {
      return { success: false, error: "Please enter your phone or WhatsApp number." };
    }
    if (!PHONE_CHARS_REGEX.test(trimmedPhone)) {
      return { success: false, error: "Phone number contains invalid characters." };
    }
    const digitsOnly = trimmedPhone.replace(/\D/g, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return { success: false, error: "Please enter a valid phone number with 8 to 15 digits." };
    }

    // 3. Email validation
    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // 4. Guests count validation
    const guestsCount = trimmedGuests || "2 Adults";
    if (guestsCount.length > 50) {
      return { success: false, error: "Traveller count description is too long." };
    }

    // 5. Server-side duplicate protection (30-second window)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentDuplicate = await prisma.customTourRequest.findFirst({
      where: {
        phone: trimmedPhone,
        name: trimmedName,
        createdAt: { gte: thirtySecondsAgo },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        travelDates: true,
        guestsCount: true,
        destinations: true,
        hotelType: true,
        cabType: true,
        createdAt: true,
      },
    });

    if (recentDuplicate) {
      const referenceId = `WK-${recentDuplicate.id.slice(-6).toUpperCase()}`;
      return {
        success: true,
        referenceId,
        inquiryId: recentDuplicate.id,
        inquiry: {
          id: recentDuplicate.id,
          name: recentDuplicate.name,
          phone: recentDuplicate.phone,
          travelDates: recentDuplicate.travelDates,
          guestsCount: recentDuplicate.guestsCount,
          destinations: recentDuplicate.destinations,
          hotelType: recentDuplicate.hotelType,
          cabType: recentDuplicate.cabType,
          createdAt: recentDuplicate.createdAt.toISOString(),
        },
      };
    }

    // 6. Format fields
    const travelDates = input.travelDates || (input.durationDays ? `${input.durationDays} Days` : "Upcoming");
    const specialRequestsCombined = [
      input.durationDays ? `Duration: ${input.durationDays} Days` : null,
      input.budget ? `Budget: ${input.budget}` : null,
      input.specialRequests ? `Notes: ${input.specialRequests.trim()}` : null,
    ].filter(Boolean).join(" | ");

    const destinations =
      Array.isArray(input.destinations) && input.destinations.length > 0
        ? input.destinations.map((d) => d.trim()).filter(Boolean)
        : ["Srinagar", "Gulmarg", "Pahalgam"];

    // 7. Safe production database write
    const inquiry = await prisma.customTourRequest.create({
      data: {
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail || null,
        travelDates: travelDates,
        guestsCount: guestsCount,
        destinations: destinations,
        hotelType: input.hotelType?.trim() || "3 Star Standard",
        cabType: input.cabType?.trim() || "Sedan / SUV",
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
