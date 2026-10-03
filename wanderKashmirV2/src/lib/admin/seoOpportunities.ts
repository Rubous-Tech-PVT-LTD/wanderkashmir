import prisma from "@/lib/prisma";

export interface AdminSeoOpportunityListItem {
  id: string;
  topic: string;
  canonicalTopic: string | null;
  cluster: string[];
  intent: string | null;
  businessRelevance: string | null;
  cannibalizationRisk: string | null;
  googleTrends: string | null;
  keywordPlanner: string | null;
  type: string;
  opportunityScore: number;
  reason: string | null;
  evidence: string | null;
  existingPageUrl: string | null;
  existingPageType: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  gscSignals: {
    impressions?: number;
    clicks?: number;
    ctr?: number;
    position?: number;
    feedbackSignal?: string;
    baseline?: {
      impressions?: number;
      clicks?: number;
      ctr?: number;
      position?: number;
    };
    delta?: {
      impressions?: number;
      clicks?: number;
      position?: number;
    };
  } | null;
  manualReviewDecision: {
    primaryPageId?: string;
    primaryPageTitle?: string;
    primaryPageUrl?: string;
    primaryEntityType?: string;
    primaryPageType?: string;
    type?: string;
  } | null;
  matchedLandingPage?: {
    id: string;
    slug: string;
    title: string;
  } | null;
}

export interface GetAdminSeoOpportunitiesParams {
  search?: string;
  status?: string;
  type?: string;
  sort?: "score_desc" | "score_asc" | "newest" | "oldest";
  sortBy?: "score_desc" | "score_asc" | "newest" | "oldest";
  page?: number;
  limit?: number;
}

export interface GetAdminSeoOpportunitiesResult {
  opportunities: AdminSeoOpportunityListItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminSeoOpportunityStats {
  total: number;
  discovered: number;
  resolved: number;
  byType: {
    CREATE: number;
    OPTIMIZE: number;
    MONITOR: number;
    MANUAL_REVIEW: number;
    IGNORE: number;
  };
}

/**
 * Server-side SEO Opportunities listing with database-backed search,
 * filtering (status, action/type), sorting, and batch SEO landing page linking.
 */
export async function getAdminSeoOpportunitiesList(
  params: GetAdminSeoOpportunitiesParams
): Promise<GetAdminSeoOpportunitiesResult> {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // 1. Status Filter
    if (params.status && params.status !== "ALL") {
      where.status = params.status;
    }

    // 2. Action / Type Filter
    if (params.type && params.type !== "ALL") {
      where.type = params.type;
    }

    // 3. Search query across topic, reason, evidence, existingPageUrl
    if (params.search && params.search.trim() !== "") {
      const term = params.search.trim();
      where.OR = [
        { topic: { contains: term, mode: "insensitive" } },
        { reason: { contains: term, mode: "insensitive" } },
        { evidence: { contains: term, mode: "insensitive" } },
        { existingPageUrl: { contains: term, mode: "insensitive" } },
        { canonicalTopic: { contains: term, mode: "insensitive" } },
      ];
    }

    // 4. Sorting
    const sortKey = params.sort || params.sortBy || "score_desc";
    let orderBy: Record<string, "asc" | "desc"> = { opportunityScore: "desc" };
    if (sortKey === "score_asc") {
      orderBy = { opportunityScore: "asc" };
    } else if (sortKey === "newest") {
      orderBy = { updatedAt: "desc" };
    } else if (sortKey === "oldest") {
      orderBy = { updatedAt: "asc" };
    }

    const [oppsRaw, totalCount] = await Promise.all([
      prisma.seoOpportunity.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.seoOpportunity.count({ where }),
    ]);

    // Batch resolve matching SeoLandingPages from existingPageUrl
    const potentialSlugs = oppsRaw
      .map((o) => {
        if (!o.existingPageUrl) return null;
        return o.existingPageUrl.split("/").filter(Boolean).pop() || null;
      })
      .filter((s): s is string => Boolean(s));

    const matchedPages = potentialSlugs.length > 0
      ? await prisma.seoLandingPage.findMany({
          where: { slug: { in: potentialSlugs } },
          select: { id: true, slug: true, title: true },
        })
      : [];

    const pageBySlug = new Map(matchedPages.map((p) => [p.slug, p]));

    const opportunities: AdminSeoOpportunityListItem[] = oppsRaw.map((o) => {
      const slug = o.existingPageUrl
        ? o.existingPageUrl.split("/").filter(Boolean).pop() || null
        : null;

      const matchedLandingPage = slug ? pageBySlug.get(slug) || null : null;

      return {
        id: o.id,
        topic: o.topic,
        canonicalTopic: o.canonicalTopic,
        cluster: Array.isArray(o.cluster) ? (o.cluster as string[]) : [],
        intent: o.intent,
        businessRelevance: o.businessRelevance,
        cannibalizationRisk: o.cannibalizationRisk,
        googleTrends: o.googleTrends,
        keywordPlanner: o.keywordPlanner,
        type: o.type,
        opportunityScore: o.opportunityScore,
        reason: o.reason,
        evidence: o.evidence,
        existingPageUrl: o.existingPageUrl,
        existingPageType: o.existingPageType,
        status: o.status,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        gscSignals: (o.gscSignals as any) || null,
        manualReviewDecision: (o.manualReviewDecision as any) || null,
        matchedLandingPage,
      };
    });

    return {
      opportunities,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  } catch (error) {
    console.error("Error in getAdminSeoOpportunitiesList:", error);
    return {
      opportunities: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}

/**
 * Calculates real database-backed aggregate counts for SEO Opportunities.
 * Zero fabricated metrics.
 */
export async function getAdminSeoOpportunityStats(): Promise<AdminSeoOpportunityStats> {
  try {
    const [total, discovered, resolved, typeGroups] = await Promise.all([
      prisma.seoOpportunity.count(),
      prisma.seoOpportunity.count({ where: { status: "DISCOVERED" } }),
      prisma.seoOpportunity.count({ where: { status: "RESOLVED" } }),
      prisma.seoOpportunity.groupBy({
        by: ["type"],
        _count: { id: true },
      }),
    ]);

    const byType = {
      CREATE: 0,
      OPTIMIZE: 0,
      MONITOR: 0,
      MANUAL_REVIEW: 0,
      IGNORE: 0,
    };

    for (const g of typeGroups) {
      if (g.type in byType) {
        byType[g.type as keyof typeof byType] = g._count.id;
      }
    }

    return {
      total,
      discovered,
      resolved,
      byType,
    };
  } catch (error) {
    console.error("Error in getAdminSeoOpportunityStats:", error);
    return {
      total: 0,
      discovered: 0,
      resolved: 0,
      byType: {
        CREATE: 0,
        OPTIMIZE: 0,
        MONITOR: 0,
        MANUAL_REVIEW: 0,
        IGNORE: 0,
      },
    };
  }
}
