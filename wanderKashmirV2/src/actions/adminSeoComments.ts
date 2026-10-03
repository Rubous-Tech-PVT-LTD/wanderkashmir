"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AdminSeoCommentItem {
  id: string;
  seoPageId: string;
  name: string;
  email: string | null;
  rating: number | null;
  comment: string;
  isApproved: boolean;
  adminReply: string | null;
  createdAt: Date;
  updatedAt: Date;
  seoPage: {
    id: string;
    title: string;
    slug: string;
    type: string;
  };
}

export interface GetSeoCommentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ALL" | "APPROVED" | "PENDING";
  seoPageId?: string;
}

async function verifyAdminAuth() {
  const session = await getAdminSession();
  if (!session || !session.userId) {
    return { ok: false, error: "Unauthorized: Admin session required." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isBanned: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isBanned) {
    return { ok: false, error: "Forbidden: Administrator privileges required." };
  }

  return { ok: true, user: dbUser };
}

/**
 * Fetch paginated SEO comments with search and moderation filter.
 */
export async function getAdminSeoCommentsAction(
  params: GetSeoCommentsParams = {}
): Promise<ActionResult<{ comments: AdminSeoCommentItem[]; total: number; totalPages: number }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.status === "APPROVED") {
      where.isApproved = true;
    } else if (params.status === "PENDING") {
      where.isApproved = false;
    }

    if (params.seoPageId) {
      where.seoPageId = params.seoPageId;
    }

    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { comment: { contains: term, mode: "insensitive" } },
        { seoPage: { title: { contains: term, mode: "insensitive" } } },
        { seoPage: { slug: { contains: term, mode: "insensitive" } } },
      ];
    }

    const [comments, total] = await Promise.all([
      prisma.seoPageComment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          seoPage: {
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
            },
          },
        },
      }),
      prisma.seoPageComment.count({ where }),
    ]);

    return {
      success: true,
      data: {
        comments: comments as unknown as AdminSeoCommentItem[],
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error("getAdminSeoCommentsAction error:", error);
    return { success: false, error: error.message || "Failed to load SEO comments." };
  }
}

/**
 * Approve or reject an SEO comment.
 */
export async function toggleSeoCommentApprovalAction(
  commentId: string,
  isApproved: boolean
): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    if (!commentId) {
      return { success: false, error: "Comment ID is required." };
    }

    await prisma.seoPageComment.update({
      where: { id: commentId },
      data: { isApproved },
    });

    revalidatePath("/admin/seo-comments");
    return { success: true };
  } catch (error: any) {
    console.error("toggleSeoCommentApprovalAction error:", error);
    return { success: false, error: error.message || "Failed to update comment approval status." };
  }
}

/**
 * Add or update an official admin reply to an SEO comment.
 */
export async function replyToSeoCommentAction(
  commentId: string,
  adminReply: string
): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    if (!commentId) {
      return { success: false, error: "Comment ID is required." };
    }

    await prisma.seoPageComment.update({
      where: { id: commentId },
      data: { adminReply: adminReply.trim() || null },
    });

    revalidatePath("/admin/seo-comments");
    return { success: true };
  } catch (error: any) {
    console.error("replyToSeoCommentAction error:", error);
    return { success: false, error: error.message || "Failed to save admin reply." };
  }
}

/**
 * Permanently delete an SEO comment.
 */
export async function deleteSeoCommentAction(commentId: string): Promise<ActionResult> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }

    if (!commentId) {
      return { success: false, error: "Comment ID is required." };
    }

    await prisma.seoPageComment.delete({
      where: { id: commentId },
    });

    revalidatePath("/admin/seo-comments");
    return { success: true };
  } catch (error: any) {
    console.error("deleteSeoCommentAction error:", error);
    return { success: false, error: error.message || "Failed to delete SEO comment." };
  }
}
