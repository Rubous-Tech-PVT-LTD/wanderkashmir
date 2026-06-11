"use server";

import prisma from "@/lib/prisma";
import { ensureDbUser } from "@/lib/clerk-sync";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

export async function addReview({
  rating,
  comment,
  propertyId,
  vehicleId,
  guideProfileId,
  bookingId,
}: {
  rating: number;
  comment?: string;
  propertyId?: string;
  vehicleId?: string;
  guideProfileId?: string;
  bookingId?: string;
}) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUserId = await ensureDbUser(userId);

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: "Invalid rating" };
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: dbUserId,
        propertyId,
        vehicleId,
        guideProfileId,
        bookingId,
      },
    });

    if (propertyId) revalidatePath(`/stays/${propertyId}`);
    if (vehicleId) revalidatePath(`/taxis/${vehicleId}`);
    if (guideProfileId) revalidatePath(`/guides/${guideProfileId}`);

    return { success: true, review };
  } catch (error: any) {
    console.error("Error adding review:", error);
    return { success: false, error: error.message || "Failed to submit review" };
  }
}

export async function getReviews(entityType: "PROPERTY" | "VEHICLE" | "GUIDE", entityId: string) {
  try {
    const whereClause: any = {};
    if (entityType === "PROPERTY") whereClause.propertyId = entityId;
    if (entityType === "VEHICLE") whereClause.vehicleId = entityId;
    if (entityType === "GUIDE") whereClause.guideProfileId = entityId;

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, reviews };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getReviewStats(entityType: "PROPERTY" | "VEHICLE" | "GUIDE", entityId: string) {
  try {
    const whereClause: any = {};
    if (entityType === "PROPERTY") whereClause.propertyId = entityId;
    if (entityType === "VEHICLE") whereClause.vehicleId = entityId;
    if (entityType === "GUIDE") whereClause.guideProfileId = entityId;

    const aggregate = await prisma.review.aggregate({
      where: whereClause,
      _avg: { rating: true },
      _count: { id: true },
    });

    return {
      success: true,
      averageRating: aggregate._avg.rating || 0,
      totalCount: aggregate._count.id || 0,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
