"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

interface MutationResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Common security validator: Ensures that an active, verified ADMIN session exists
 * and re-confirms the role in the database before any mutation can execute.
 */
async function verifyAdminAuth(): Promise<{ authorized: boolean; error?: string; adminId?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { authorized: false, error: "Unauthorized: Admin session required." };
  }

  if (session.role !== "ADMIN") {
    return { authorized: false, error: "Forbidden: Administrator role required." };
  }

  // Re-verify in database to prevent stale or forged token payload
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isBanned: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isBanned) {
    return { authorized: false, error: "Forbidden: Account is not an active administrator." };
  }

  return { authorized: true, adminId: dbUser.id };
}

function revalidateListingPaths(propertyId?: string) {
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listings/pending");
  revalidatePath("/admin/listings/live");
  revalidatePath("/admin/properties");
  if (propertyId) {
    revalidatePath(`/admin/properties/${propertyId}`);
    revalidatePath(`/stays/${propertyId}`);
  }
  revalidatePath("/stays");
  revalidatePath("/sitemap.xml");
}

/**
 * Server Action: Approve a Property Listing (Module 08).
 * Transitions property to isApproved: true, status: "APPROVED", clears rejectionReason.
 */
export async function approveListingAction(propertyId: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!propertyId || typeof propertyId !== "string") {
      return { success: false, error: "Invalid Property ID provided." };
    }

    // Re-fetch property from database
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, name: true, status: true, isApproved: true },
    });

    if (!property) {
      return { success: false, error: "Property not found." };
    }

    if (property.isApproved && property.status === "APPROVED") {
      return { success: false, error: "This listing is already approved and live." };
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        isApproved: true,
        status: "APPROVED",
        rejectionReason: null,
      },
    });

    revalidateListingPaths(propertyId);
    return { success: true };
  } catch (error) {
    console.error("Error approving listing:", error);
    return { success: false, error: "Failed to approve listing." };
  }
}

/**
 * Server Action: Reject a Property Listing.
 * Transitions property to isApproved: false, status: "REJECTED", records mandatory audit reason.
 */
export async function rejectListingAction(
  propertyId: string,
  reason: string
): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!propertyId || typeof propertyId !== "string") {
      return { success: false, error: "Invalid Property ID provided." };
    }

    const cleanReason = (reason || "").trim();
    if (!cleanReason) {
      return { success: false, error: "Please provide a valid rejection reason." };
    }

    // Re-fetch property from database
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, name: true, status: true, isApproved: true },
    });

    if (!property) {
      return { success: false, error: "Property not found." };
    }

    if (property.status === "REJECTED") {
      return { success: false, error: "This listing is already marked as rejected." };
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        isApproved: false,
        status: "REJECTED",
        rejectionReason: cleanReason,
      },
    });

    revalidateListingPaths(propertyId);
    return { success: true };
  } catch (error) {
    console.error("Error rejecting listing:", error);
    return { success: false, error: "Failed to reject listing." };
  }
}

/**
 * Server Action: Suspend a Live Property Listing.
 * Transitions property to isApproved: false, status: "SUSPENDED", records mandatory suspension reason.
 */
export async function suspendListingAction(
  propertyId: string,
  reason: string
): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!propertyId || typeof propertyId !== "string") {
      return { success: false, error: "Invalid Property ID provided." };
    }

    const cleanReason = (reason || "").trim();
    if (!cleanReason) {
      return { success: false, error: "Please provide a valid suspension reason." };
    }

    // Re-fetch property from database
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, name: true, status: true, isApproved: true },
    });

    if (!property) {
      return { success: false, error: "Property not found." };
    }

    if (property.status === "SUSPENDED") {
      return { success: false, error: "This listing is already suspended." };
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        isApproved: false,
        status: "SUSPENDED",
        rejectionReason: cleanReason,
      },
    });

    revalidateListingPaths(propertyId);
    return { success: true };
  } catch (error) {
    console.error("Error suspending listing:", error);
    return { success: false, error: "Failed to suspend listing." };
  }
}

/**
 * Server Action: Reactivate a Suspended or Rejected Listing.
 */
export async function reactivateListingAction(propertyId: string): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!propertyId || typeof propertyId !== "string") {
      return { success: false, error: "Invalid Property ID provided." };
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, name: true, status: true, isApproved: true },
    });

    if (!property) {
      return { success: false, error: "Property not found." };
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        isApproved: true,
        status: "APPROVED",
        rejectionReason: null,
      },
    });

    revalidateListingPaths(propertyId);
    return { success: true };
  } catch (error) {
    console.error("Error reactivating listing:", error);
    return { success: false, error: "Failed to reactivate listing." };
  }
}

/**
 * Server Action: Update Property SEO Description and FAQs.
 */
export async function updateListingSeoFaqAction(
  propertyId: string,
  description: string,
  faqs: Array<{ question: string; answer: string }>
): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!propertyId || typeof propertyId !== "string") {
      return { success: false, error: "Invalid Property ID provided." };
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });

    if (!property) {
      return { success: false, error: "Property not found." };
    }

    // Clean and validate FAQs
    const sanitizedFaqs = (Array.isArray(faqs) ? faqs : [])
      .filter((f) => f && typeof f === "object" && f.question?.trim() && f.answer?.trim())
      .map((f) => ({
        question: f.question.trim(),
        answer: f.answer.trim(),
      }));

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        description: description?.trim() || null,
        faqs: sanitizedFaqs.length > 0 ? (sanitizedFaqs as any) : null,
      },
    });

    revalidateListingPaths(propertyId);
    return { success: true };
  } catch (error) {
    console.error("Error updating listing SEO/FAQs:", error);
    return { success: false, error: "Failed to update SEO description and FAQs." };
  }
}

/**
 * Server Action: Update Property Google Place ID.
 */
export async function updateListingGooglePlaceIdAction(
  propertyId: string,
  googlePlaceId: string
): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!propertyId || typeof propertyId !== "string") {
      return { success: false, error: "Invalid Property ID provided." };
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });

    if (!property) {
      return { success: false, error: "Property not found." };
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        googlePlaceId: googlePlaceId?.trim() || null,
      },
    });

    revalidateListingPaths(propertyId);
    return { success: true };
  } catch (error) {
    console.error("Error updating listing Google Place ID:", error);
    return { success: false, error: "Failed to update Google Place ID." };
  }
}

/**
 * Server Action: Update Property Image Media URLs.
 */
export async function updateListingImagesAction(
  propertyId: string,
  images: string[]
): Promise<MutationResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!propertyId || typeof propertyId !== "string") {
      return { success: false, error: "Invalid Property ID provided." };
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });

    if (!property) {
      return { success: false, error: "Property not found." };
    }

    const sanitizedImages = (Array.isArray(images) ? images : [])
      .map((img) => (typeof img === "string" ? img.trim() : ""))
      .filter((img) => img.startsWith("http://") || img.startsWith("https://"));

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        images: sanitizedImages,
      },
    });

    revalidateListingPaths(propertyId);
    return { success: true };
  } catch (error) {
    console.error("Error updating listing images:", error);
    return { success: false, error: "Failed to update property images." };
  }
}
