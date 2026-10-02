"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface PropertyEnquiryInput {
  propertyId: string;
  name: string;
  phone: string;
  email?: string;
  dates?: string;
  guests?: string;
  message?: string;
}

export interface PropertyEnquiryResult {
  success: boolean;
  referenceId?: string;
  inquiryId?: string;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_REGEX = /^[\d\s+\-()]+$/;

export async function submitPropertyEnquiry(
  input: PropertyEnquiryInput
): Promise<PropertyEnquiryResult> {
  try {
    const rawPropertyId = (input.propertyId || "").trim();
    const rawName = (input.name || "").trim();
    const rawPhone = (input.phone || "").trim();
    const rawEmail = (input.email || "").trim();
    const rawDates = (input.dates || "").trim();
    const rawGuests = (input.guests || "").trim();
    const rawMessage = (input.message || "").trim();

    // 1. Property ID & server-side existence/approval guard
    if (!rawPropertyId) {
      return {
        success: false,
        error: "Missing canonical Property ID for enquiry.",
      };
    }

    const property = await prisma.property.findUnique({
      where: { id: rawPropertyId },
      select: {
        id: true,
        name: true,
        location: true,
        isApproved: true,
        status: true,
        propertyType: true,
      },
    });

    if (!property) {
      return {
        success: false,
        error: "The requested property was not found or is no longer listed.",
      };
    }

    if (!property.isApproved || property.status !== "APPROVED") {
      return {
        success: false,
        error: "Enquiries are currently not accepted for this unapproved property.",
      };
    }

    // 2. Customer Name Validation
    if (!rawName || rawName.length < 2) {
      return {
        success: false,
        error: "Please enter your full name (at least 2 characters).",
      };
    }
    if (rawName.length > 100) {
      return {
        success: false,
        error: "Name is too long (maximum 100 characters).",
      };
    }

    // 3. Customer Phone Validation
    if (!rawPhone) {
      return {
        success: false,
        error: "Please enter your phone or WhatsApp number.",
      };
    }
    if (!PHONE_CHARS_REGEX.test(rawPhone)) {
      return {
        success: false,
        error: "Phone number contains invalid characters.",
      };
    }
    const digitsOnly = rawPhone.replace(/\D/g, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return {
        success: false,
        error: "Please enter a valid phone number with 8 to 15 digits.",
      };
    }

    // 4. Optional Email Validation
    if (rawEmail && !EMAIL_REGEX.test(rawEmail)) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    // 5. Guests & Dates Sanitization
    const guestsCount = rawGuests || "2 Guests";
    const travelDates = rawDates || null;

    // 6. Duplicate Submission Protection (Server-Side)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentDuplicate = await prisma.customTourRequest.findFirst({
      where: {
        phone: rawPhone,
        adminNotes: { contains: property.id },
        createdAt: { gte: thirtySecondsAgo },
      },
      select: { id: true },
    });

    if (recentDuplicate) {
      return {
        success: true,
        referenceId: `WK-PROP-${recentDuplicate.id.slice(-6).toUpperCase()}`,
        inquiryId: recentDuplicate.id,
      };
    }

    // 7. Structured Special Requests Note
    const noteParts = [
      `[Property Enquiry]`,
      `Property ID: ${property.id}`,
      `Property Name: ${property.name}`,
      `Location: ${property.location}`,
      `Type: ${property.propertyType || "HOTEL"}`,
      rawMessage ? `Guest Note: ${rawMessage}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    // 8. Safe Production Database Write
    const enquiry = await prisma.customTourRequest.create({
      data: {
        name: rawName,
        phone: rawPhone,
        email: rawEmail || null,
        travelDates: travelDates,
        guestsCount: guestsCount,
        destinations: [property.location],
        hotelType: `${property.name} (${property.propertyType || "HOTEL"})`,
        cabType: "N/A - Stay Enquiry",
        specialRequests: noteParts,
        adminNotes: `Property ID: ${property.id}`,
        status: "PENDING",
      },
    });

    const referenceId = `WK-PROP-${enquiry.id.slice(-6).toUpperCase()}`;

    try {
      revalidatePath("/wander-admin");
    } catch (_) {}

    return {
      success: true,
      referenceId,
      inquiryId: enquiry.id,
    };
  } catch (error: any) {
    console.error("Error creating property enquiry:", error);
    return {
      success: false,
      error:
        "Unable to submit your enquiry at this time. Please try again or contact us directly on WhatsApp.",
    };
  }
}
