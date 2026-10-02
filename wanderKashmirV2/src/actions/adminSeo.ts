"use server";

import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";
import { SeoWorkflowState } from "@prisma/client";

export interface SeoLandingPageUpdateInput {
  title: string;
  slug: string;
  h1Heading: string;
  description?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  workflowState: SeoWorkflowState;
  faqs?: unknown;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Server Action: Update a production SeoLandingPage record.
 * Strictly whitelists editable fields with mass assignment prevention and Phase 5 auth.
 */
export async function updateSeoLandingPageAction(
  id: string,
  input: SeoLandingPageUpdateInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid SEO landing page identifier." };
    }

    const currentPage = await prisma.seoLandingPage.findUnique({
      where: { id },
      select: { id: true, slug: true, type: true },
    });

    if (!currentPage) {
      return { success: false, error: "SEO landing page not found." };
    }

    const title = (input.title || "").trim();
    if (title.length < 2) {
      return { success: false, error: "Title must be at least 2 characters." };
    }

    const h1Heading = (input.h1Heading || "").trim();
    if (h1Heading.length < 2) {
      return { success: false, error: "H1 Heading must be at least 2 characters." };
    }

    const rawSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(title);
    if (!rawSlug || rawSlug.length < 2) {
      return { success: false, error: "Invalid URL slug format." };
    }

    // Check slug uniqueness
    if (rawSlug !== currentPage.slug) {
      const existingSlug = await prisma.seoLandingPage.findUnique({
        where: { slug: rawSlug },
        select: { id: true },
      });
      if (existingSlug && existingSlug.id !== id) {
        return {
          success: false,
          error: `URL slug "${rawSlug}" is already registered to another SEO page.`,
        };
      }
    }

    // Whitelist update payload
    const updated = await prisma.seoLandingPage.update({
      where: { id },
      data: {
        title,
        slug: rawSlug,
        h1Heading,
        description: input.description?.trim() || null,
        content: input.content?.trim() || null,
        imageUrl: input.imageUrl?.trim() || null,
        workflowState: input.workflowState,
        faqs: input.faqs ? JSON.parse(JSON.stringify(input.faqs)) : undefined,
      },
      select: { id: true, slug: true },
    });

    // Targeted public revalidation
    try {
      revalidatePath("/admin/seo");
      revalidatePath(`/admin/seo/${id}`);
      revalidatePath("/sitemap.xml");

      if (currentPage.type === "DESTINATION") {
        revalidatePath("/destinations");
        revalidatePath(`/destinations/${currentPage.slug}`);
        if (currentPage.slug !== rawSlug) {
          revalidatePath(`/destinations/${rawSlug}`);
        }
      }
    } catch (e) {
      console.warn("Revalidation warning after updateSeoLandingPage:", e);
    }

    return {
      success: true,
      data: {
        id: updated.id,
        slug: updated.slug,
      },
    };
  } catch (error) {
    console.error("Error updating SEO landing page:", error);
    return {
      success: false,
      error: "A database error occurred while updating the SEO landing page.",
    };
  }
}

/**
 * Server Action: Quick Toggle Publishing status for an SEO Landing Page.
 * Changes workflowState between PUBLISHED and DRAFT.
 */
export async function toggleSeoPublishStatusAction(
  id: string,
  newWorkflowState: SeoWorkflowState
): Promise<ActionResult<{ id: string; workflowState: SeoWorkflowState }>> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    const page = await prisma.seoLandingPage.findUnique({
      where: { id },
      select: { id: true, slug: true, type: true },
    });

    if (!page) {
      return { success: false, error: "SEO landing page not found." };
    }

    const updated = await prisma.seoLandingPage.update({
      where: { id },
      data: { workflowState: newWorkflowState },
      select: { id: true, workflowState: true },
    });

    try {
      revalidatePath("/admin/seo");
      revalidatePath(`/admin/seo/${id}`);
      revalidatePath("/sitemap.xml");

      if (page.type === "DESTINATION") {
        revalidatePath("/destinations");
        revalidatePath(`/destinations/${page.slug}`);
      }
    } catch (e) {
      console.warn("Revalidation warning after toggleSeoPublishStatus:", e);
    }

    return {
      success: true,
      data: {
        id: updated.id,
        workflowState: updated.workflowState,
      },
    };
  } catch (error) {
    console.error("Error toggling SEO landing page workflowState:", error);
    return {
      success: false,
      error: "Failed to update SEO page publishing status.",
    };
  }
}

/**
 * Destructive deletion protection:
 * To safeguard organic rankings and search engine indices, destructive deletion is disabled.
 * Pages can be archived or reverted to DRAFT status instead.
 */
export async function deleteSeoLandingPageAction(
  _id: string
): Promise<ActionResult<{ success: boolean }>> {
  return {
    success: false,
    error:
      "Destructive deletion is disabled in production to protect indexed URLs and prevent 404 crawl errors. Please set workflowState to DRAFT instead.",
  };
}
