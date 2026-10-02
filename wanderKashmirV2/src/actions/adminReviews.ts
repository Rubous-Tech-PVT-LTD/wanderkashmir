"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export interface ReviewUpdateInput {
  rating: number;
  comment?: string | null;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: Update a production Review.
 * Protected with strict Phase 5 Admin authorization and mass assignment prevention.
 * Explicitly whitelists editable fields (rating, comment).
 * Related Property, Tour, and User records are NEVER modified.
 */
export async function updateReviewAction(
  id: string,
  input: ReviewUpdateInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid review identifier." };
    }

    // 1. Verify existing review and fetch relations for targeted revalidation
    const existing = await prisma.review.findUnique({
      where: { id },
      include: {
        property: {
          select: { id: true },
        },
        tour: {
          select: { id: true, slug: true },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Review not found." };
    }

    // 2. Validate rating (1 - 5)
    const ratingInt = Math.floor(Number(input.rating));
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      return { success: false, error: "Rating must be an integer between 1 and 5." };
    }

    // 3. Clean comment
    const cleanComment =
      typeof input.comment === "string" ? input.comment.trim() || null : null;

    // 4. Update ONLY whitelisted fields
    const updated = await prisma.review.update({
      where: { id },
      data: {
        rating: ratingInt,
        comment: cleanComment,
      },
      select: { id: true },
    });

    // 5. Targeted public revalidation
    try {
      revalidatePath("/admin/reviews");
      revalidatePath(`/admin/reviews/${id}`);

      if (existing.property?.id) {
        revalidatePath(`/stays/${existing.property.id}`);
        revalidatePath("/stays");
      }

      if (existing.tour?.slug) {
        revalidatePath(`/tours/${existing.tour.slug}`);
      }
    } catch (e) {
      console.warn("Revalidation warning after updateReview:", e);
    }

    return {
      success: true,
      data: { id: updated.id },
    };
  } catch (error) {
    console.error("Error updating review:", error);
    return {
      success: false,
      error: "A database error occurred while updating the review. Please verify inputs.",
    };
  }
}

/**
 * Destructive deletion protection:
 * In accordance with Phase 6F requirements, destructive review deletion is NOT implemented
 * to preserve booking history, verified customer data, and rating calculations.
 */
export async function deleteReviewAction(
  _id: string
): Promise<ActionResult<{ success: boolean }>> {
  return {
    success: false,
    error:
      "Destructive review deletion is not implemented in production to preserve database integrity and historical customer records.",
  };
}
