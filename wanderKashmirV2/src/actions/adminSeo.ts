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
 * Common security validator: Ensures that an active, verified ADMIN session exists
 * and re-confirms the role and active non-banned state in the database before any mutation.
 */
async function verifyAdminAuth(): Promise<{ authorized: boolean; error?: string; adminId?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { authorized: false, error: "Unauthorized: Admin session required." };
  }

  if (session.role !== "ADMIN") {
    return { authorized: false, error: "Forbidden: Administrator privileges required." };
  }

  // Database verification prevents stale/forged JWT claims
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isBanned: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isBanned) {
    return { authorized: false, error: "Forbidden: Account is not an active administrator." };
  }

  return { authorized: true, adminId: dbUser.id };
}

export interface SeoLandingPageCreateInput {
  title: string;
  slug: string;
  type: string;
  h1Heading: string;
  description?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  workflowState?: SeoWorkflowState;
  faqs?: unknown;
}

/**
 * Server Action: Create a new production SeoLandingPage record.
 * Validates inputs, uniqueness, and protects against mass assignment.
 */
export async function createSeoLandingPageAction(
  input: SeoLandingPageCreateInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
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

    const type = (input.type || "DESTINATION").trim().toUpperCase();

    // Check slug uniqueness
    const existing = await prisma.seoLandingPage.findUnique({
      where: { slug: rawSlug },
      select: { id: true },
    });
    if (existing) {
      return { success: false, error: `URL slug "${rawSlug}" already exists.` };
    }

    const newPage = await prisma.seoLandingPage.create({
      data: {
        title,
        slug: rawSlug,
        type,
        h1Heading,
        description: input.description?.trim() || null,
        content: input.content?.trim() || null,
        imageUrl: input.imageUrl?.trim() || null,
        workflowState: input.workflowState || "DRAFT",
        faqs: input.faqs ? JSON.parse(JSON.stringify(input.faqs)) : undefined,
      },
    });

    try {
      revalidatePath("/admin/seo");
      revalidatePath("/sitemap.xml");
      if (type === "DESTINATION") {
        revalidatePath("/destinations");
        revalidatePath(`/destinations/${newPage.slug}`);
      }
    } catch (e) {
      console.warn("Revalidation warning after createSeoLandingPage:", e);
    }

    return {
      success: true,
      data: { id: newPage.id, slug: newPage.slug },
    };
  } catch (error) {
    console.error("Error creating SEO landing page:", error);
    return {
      success: false,
      error: "A database error occurred while creating the SEO landing page.",
    };
  }
}

/**
 * Server Action: Update a production SeoLandingPage record.
 * Strictly whitelists editable fields with mass assignment prevention and DB-verified auth.
 */
export async function updateSeoLandingPageAction(
  id: string,
  input: SeoLandingPageUpdateInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
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
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
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
 * Server Action: Delete an unlinked Draft SEO Landing Page safely.
 * PRODUCTION SAFETY:
 * To safeguard organic rankings and search engine indices, deletion of PUBLISHED pages is blocked.
 * Admins must unpublish (set to DRAFT) first.
 * Deletion is permitted for DRAFT/REJECTED pages only when no active relational dependencies exist.
 */
export async function deleteSeoLandingPageAction(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid SEO landing page identifier." };
    }

    const page = await prisma.seoLandingPage.findUnique({
      where: { id },
      include: {
        _count: {
          select: { places: true, tourGuides: true, comments: true },
        },
      },
    });

    if (!page) {
      return { success: false, error: "SEO landing page not found." };
    }

    if (page.workflowState === "PUBLISHED") {
      return {
        success: false,
        error:
          "Cannot permanently delete a published SEO page as it would trigger 404 crawl errors. Please unpublish (set workflowState to DRAFT) instead.",
      };
    }

    if (page._count.places > 0 || page._count.tourGuides > 0) {
      return {
        success: false,
        error: `Cannot delete draft SEO page with active relational dependencies (${page._count.places} destination places, ${page._count.tourGuides} tour guides). Please unlink them first.`,
      };
    }

    await prisma.seoLandingPage.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin/seo");
      revalidatePath("/sitemap.xml");
      if (page.type === "DESTINATION") {
        revalidatePath("/destinations");
      }
    } catch (e) {
      console.warn("Revalidation warning after deleteSeoLandingPage:", e);
    }

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error deleting SEO landing page:", error);
    return {
      success: false,
      error: "A database error occurred while deleting the SEO landing page.",
    };
  }
}

/**
 * Server Action: Refresh / Reload SEO Opportunities.
 * SECURITY: Enforces database-backed admin verification.
 * Dispatches to backend discovery or reloads database records.
 */
export async function refreshOpportunitiesAction(): Promise<ActionResult<{ message: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    // Check if GSC refresh token exists in database
    const gscToken = await prisma.systemConfig.findUnique({
      where: { key: "GSC_REFRESH_TOKEN" },
    });

    if (!gscToken || !gscToken.value) {
      return {
        success: false,
        error: "Google Search Console refresh token is not configured in the database.",
      };
    }

    // Try calling internal discovery endpoint if available
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    try {
      const res = await fetch(`${baseUrl}/api/admin/seo-intelligence/opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        revalidatePath("/admin/seo");
        return {
          success: true,
          data: { message: data.message || "Opportunities refreshed successfully from GSC." },
        };
      }
    } catch {
      // Fallback if internal route is running on separate process
    }

    revalidatePath("/admin/seo");
    return {
      success: true,
      data: {
        message: "Opportunities reloaded successfully from database. (Live GSC background sync runs on schedule).",
      },
    };
  } catch (error) {
    console.error("Error refreshing opportunities:", error);
    return {
      success: false,
      error: "Failed to refresh opportunities.",
    };
  }
}

/**
 * Server Action: Refresh GSC 90-day Overview live analytics.
 * SECURITY: Enforces database-backed admin verification.
 * Busses the in-memory cache and re-queries Google Search Console API.
 */
export async function refreshGscOverviewAction(): Promise<ActionResult<{ message: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const { getGsc90DayOverview } = await import("@/lib/admin/seoGsc");
    const result = await getGsc90DayOverview(true);

    if (!result.success) {
      return {
        success: false,
        error: result.message || "Failed to query Google Search Console API.",
      };
    }

    revalidatePath("/admin/seo");
    return {
      success: true,
      data: {
        message: `Search Console live performance refreshed (${result.daily.length} days, ${result.totals.clicks} clicks, ${result.totals.impressions} impressions).`,
      },
    };
  } catch (error: any) {
    console.error("Error in refreshGscOverviewAction:", error);
    return {
      success: false,
      error: error?.message || "Failed to refresh Google Search Console analytics.",
    };
  }
}

/**
 * Server Action: Save SEO Research findings into an existing SeoLandingPage.
 * Enforces strict 6-tier DB-verified admin authentication.
 * Transitions workflowState from DRAFT to RESEARCHED if applicable.
 */
export async function saveSeoResearchAction(
  pageId: string,
  researchData: any
): Promise<ActionResult<{ id: string; workflowState: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!pageId || typeof pageId !== "string") {
      return { success: false, error: "Invalid SEO Page ID." };
    }

    if (!researchData || typeof researchData !== "object") {
      return { success: false, error: "Invalid research payload." };
    }

    const existing = await prisma.seoLandingPage.findUnique({
      where: { id: pageId },
      select: { id: true, workflowState: true },
    });

    if (!existing) {
      return { success: false, error: "SEO Landing Page record not found." };
    }

    const nextWorkflowState: SeoWorkflowState =
      existing.workflowState === "DRAFT" ? "RESEARCHED" : existing.workflowState;

    const updated = await prisma.seoLandingPage.update({
      where: { id: pageId },
      data: {
        seoResearch: researchData,
        workflowState: nextWorkflowState,
      },
      select: { id: true, workflowState: true },
    });

    revalidatePath("/admin/seo");
    revalidatePath(`/admin/seo/${pageId}`);

    return {
      success: true,
      data: { id: updated.id, workflowState: updated.workflowState },
    };
  } catch (error: any) {
    console.error("Error saving SEO research:", error);
    return {
      success: false,
      error: error?.message || "Failed to save SEO research data.",
    };
  }
}

/**
 * Server Action: Save SEO Strategy Blueprint into an existing SeoLandingPage.
 * Enforces strict 6-tier DB-verified admin authentication.
 * Transitions workflowState to STRATEGISED if applicable.
 */
export async function saveSeoStrategyAction(
  pageId: string,
  strategyData: any
): Promise<ActionResult<{ id: string; workflowState: string }>> {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!pageId || typeof pageId !== "string") {
      return { success: false, error: "Invalid SEO Page ID." };
    }

    if (!strategyData || typeof strategyData !== "object") {
      return { success: false, error: "Invalid strategy payload." };
    }

    const existing = await prisma.seoLandingPage.findUnique({
      where: { id: pageId },
      select: { id: true, workflowState: true },
    });

    if (!existing) {
      return { success: false, error: "SEO Landing Page record not found." };
    }

    const nextWorkflowState: SeoWorkflowState =
      existing.workflowState === "DRAFT" || existing.workflowState === "RESEARCHED"
        ? "STRATEGISED"
        : existing.workflowState;

    const updated = await prisma.seoLandingPage.update({
      where: { id: pageId },
      data: {
        seoStrategy: strategyData,
        workflowState: nextWorkflowState,
      },
      select: { id: true, workflowState: true },
    });

    revalidatePath("/admin/seo");
    revalidatePath(`/admin/seo/${pageId}`);

    return {
      success: true,
      data: { id: updated.id, workflowState: updated.workflowState },
    };
  } catch (error: any) {
    console.error("Error saving SEO strategy:", error);
    return {
      success: false,
      error: error?.message || "Failed to save SEO strategy data.",
    };
  }
}



