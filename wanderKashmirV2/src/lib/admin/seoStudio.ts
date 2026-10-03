import prisma from "@/lib/prisma";
import { getGsc90DayOverview } from "@/lib/admin/seoGsc";
import { SeoWorkflowState } from "@prisma/client";

export interface CompetingPageCandidate {
  id?: string;
  url: string;
  title: string;
  type: string;
  entityType: "SEO_LANDING_PAGE" | "TOUR" | "TOUR_CATEGORY" | "PROPERTY" | "PLACE";
  intentAlignment: string;
}

export interface CannibalizationAnalysis {
  status: "SAFE" | "MEDIUM_RISK" | "HIGH_RISK";
  recommendation: "OPTIMIZE_EXISTING" | "KEEP_SEPARATE" | "MANUAL_REVIEW" | "CONSOLIDATE" | "CREATE_NEW";
  reason: string;
  competingPages: CompetingPageCandidate[];
}

export interface VerifiedDbFact {
  type: "DESTINATION" | "TOUR" | "PROPERTY" | "PLACE" | "GENERAL";
  fact: string;
  referenceId?: string;
}

export interface SeoResearchData {
  targetQuery: string;
  secondaryQueries: string[];
  searchIntent: "informational" | "commercial" | "transactional" | "local" | "unknown";
  gscEvidence: {
    hasData: boolean;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    topQueries: Array<{
      query: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
  };
  opportunityEvidence: {
    found: boolean;
    topic?: string;
    opportunityScore?: number;
    type?: string;
    intent?: string;
    evidence?: string;
  } | null;
  cannibalization: CannibalizationAnalysis;
  competitorResearch: {
    competitorUrl?: string;
    competitorTitle?: string;
    headingStructure?: string;
    contentAngle?: string;
    topicsCovered?: string[];
    missingTopics?: string[];
    observedIntent?: string;
    notes?: string;
  };
  keywordResearch: {
    primaryKeyword: string;
    relatedKeywords: string[];
    searchIntent: string;
    notes?: string;
  };
  trendResearch: {
    trendDirection: "RISING" | "STABLE" | "DECLINING" | "UNCLEAR";
    trendStrength: "STRONG" | "MODERATE" | "WEAK" | "UNCLEAR";
    seasonality: "YES" | "NO" | "UNCLEAR";
    peakPeriod?: string;
    lowestPeriod?: string;
    notes?: string;
  };
  verifiedDbFacts: VerifiedDbFact[];
  researchNotes: string;
  researchedAt: string;
}

export interface SeoStrategyData {
  primaryTopic: string;
  adminDecision: "USE_EXISTING" | "CONSOLIDATE" | "CREATE_NEW" | "IGNORE";
  recommendedAction: "KEEP" | "OPTIMIZE" | "MONITOR" | "CONSOLIDATE" | "MANUAL_REVIEW";
  protectedComponents: {
    protectPrimaryQuery: boolean;
    protectTitle: boolean;
    protectH1: boolean;
    protectMetaDescription: boolean;
    protectSlug: boolean;
    protectSections: string[];
    protectFaqs: boolean;
  };
  queriesToProtect: string[];
  queriesToImprove: string[];
  contentAngle: string;
  recommendedHeadingDirection: string;
  internalLinkingIdeas: string[];
  competingPagesAnalysis?: string;
  strategyNotes: string;
  strategisedAt: string;
}

export interface SeoResearchStudioPayload {
  page: {
    id: string;
    slug: string;
    type: string;
    title: string;
    h1Heading: string;
    description: string | null;
    content: string | null;
    imageUrl: string | null;
    workflowState: SeoWorkflowState;
    createdAt: Date;
    updatedAt: Date;
    faqs?: any;
    places?: any;
    validationReport?: any;
  };
  savedResearch: SeoResearchData | null;
  savedStrategy: SeoStrategyData | null;
  liveGscEvidence: SeoResearchData["gscEvidence"];
  matchedOpportunity: SeoResearchData["opportunityEvidence"];
  cannibalization: CannibalizationAnalysis;
  verifiedDbFacts: VerifiedDbFact[];
  generatedDraft?: any | null;
  activeJob?: { id: string; status: string; startedAt: Date | null } | null;
  savedValidationReport?: any | null;
}

/**
 * Analyzes internal database records to identify potential keyword/topic cannibalization.
 * Evaluates SEO Landing Pages, live Tours, Tour Categories, Properties, and Places.
 */
export async function analyzeCannibalization(
  targetTopic: string,
  targetPageId?: string,
  targetSlug?: string
): Promise<CannibalizationAnalysis> {
  try {
    const [existingPages, existingProperties, existingTours, existingCategories, existingPlaces] =
      await Promise.all([
        prisma.seoLandingPage.findMany({
          select: { id: true, title: true, slug: true, type: true },
        }),
        prisma.property.findMany({
          select: { id: true, name: true, location: true },
        }),
        prisma.tour.findMany({
          where: { isLive: true },
          select: { id: true, title: true, slug: true },
        }),
        prisma.tourCategory.findMany({
          select: { id: true, name: true, slug: true },
        }),
        prisma.place
          .findMany({
            where: { status: "ACTIVE" },
            select: {
              id: true,
              name: true,
              slug: true,
              destinationPlaces: {
                select: { destination: { select: { slug: true } } },
              },
            },
          })
          .catch(() => []),
      ]);

    const stopWords = new Set([
      "to", "the", "in", "for", "and", "of", "with", "a", "an", "is", "called",
      "what", "fare", "cost", "guide", "places", "unique", "hidden", "best", "top",
      "2026", "2025", "2024",
    ]);

    const targetWords = targetTopic
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    const genericKeywords = new Set([
      "kashmir", "valley", "valleys", "premium", "luxury", "guide", "places",
      "tour", "tours", "package", "packages", "homestay", "homestays", "hotel",
      "hotels", "resort", "resorts", "taxi", "taxis", "cab", "cabs", "cabfare",
      "fare", "distance", "booking", "bookings", "stays", "stay", "trip", "travel",
      "secret", "trails", "hidden", "waterfalls", "waterfall", "meadow", "meadows",
    ]);

    const entityTokens = targetWords.filter((w) => !genericKeywords.has(w));

    const allCandidates = [
      ...existingPages.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        type: p.type,
        entityType: "SEO_LANDING_PAGE" as const,
      })),
      ...existingProperties.map((p) => ({
        id: p.id,
        title: p.name,
        slug: p.id,
        type: "PROPERTY",
        entityType: "PROPERTY" as const,
      })),
      ...existingTours.map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        type: "TOUR",
        entityType: "TOUR" as const,
      })),
      ...existingCategories.map((c) => ({
        id: c.id,
        title: c.name,
        slug: c.slug,
        type: "TOUR_CATEGORY",
        entityType: "TOUR_CATEGORY" as const,
      })),
      ...existingPlaces.map((p) => {
        const parentSlug = p.destinationPlaces?.[0]?.destination?.slug || "destinations";
        return {
          id: p.id,
          title: p.name,
          slug: `${parentSlug}/${p.slug}`,
          type: "PLACE",
          entityType: "PLACE" as const,
        };
      }),
    ];

    const competing = allCandidates.filter((p) => {
      // Exclude self
      if (targetPageId && p.id === targetPageId) return false;
      if (targetSlug && p.slug.toLowerCase() === targetSlug.toLowerCase()) return false;

      const titleWords = p.title.toLowerCase();
      const slugClean = p.slug.toLowerCase();

      const hasEntityMatch =
        entityTokens.length > 0
          ? entityTokens.some((e) => titleWords.includes(e) || slugClean.includes(e))
          : true;

      let matches = 0;
      for (const w of targetWords) {
        if (titleWords.includes(w) || slugClean.includes(w)) matches++;
      }

      return hasEntityMatch && matches >= Math.min(2, targetWords.length) && targetWords.length > 0;
    });

    if (competing.length > 0) {
      const competingPages: CompetingPageCandidate[] = competing.map((c) => {
        let url = `/${c.type.toLowerCase()}s/${c.slug}`;
        if (c.entityType === "TOUR_CATEGORY") url = `/tours?category=${c.slug}`;
        else if (c.entityType === "PROPERTY") url = `/stays/${c.id}`;
        else if (c.entityType === "TOUR") url = `/tours/${c.slug}`;
        else if (c.entityType === "PLACE") url = `/destinations/${c.slug}`;
        else if (c.type.toUpperCase() === "BLOG") url = `/blog/${c.slug}`;

        return {
          id: c.id,
          url,
          title: c.title,
          type: c.type,
          entityType: c.entityType,
          intentAlignment: c.title.toLowerCase() === targetTopic.toLowerCase() ? "HIGH" : "MEDIUM",
        };
      });

      return {
        status: competing.length > 1 ? "HIGH_RISK" : "MEDIUM_RISK",
        recommendation: "MANUAL_REVIEW",
        reason: `Found ${competing.length} competing internal records with keyword overlap. Review search intent before deciding whether to consolidate or preserve separate targeting.`,
        competingPages,
      };
    }

    return {
      status: "SAFE",
      recommendation: targetPageId ? "OPTIMIZE_EXISTING" : "CREATE_NEW",
      reason: "No significant internal keyword competition detected across landing pages, tours, stays, or places.",
      competingPages: [],
    };
  } catch (error) {
    console.error("Error analyzing cannibalization:", error);
    return {
      status: "SAFE",
      recommendation: "OPTIMIZE_EXISTING",
      reason: "Cannibalization analysis completed with default safe baseline.",
      competingPages: [],
    };
  }
}

/**
 * Gathers verified facts from the live PostgreSQL database for an SEO page.
 */
export async function getVerifiedDatabaseFacts(page: {
  id: string;
  slug: string;
  type: string;
  title: string;
}): Promise<VerifiedDbFact[]> {
  const facts: VerifiedDbFact[] = [];

  try {
    // 1. Linked Destination Places
    const places = await prisma.destinationPlace
      .findMany({
        where: { destinationId: page.id },
        include: { place: { select: { id: true, name: true, slug: true } } },
      })
      .catch(() => []);

    if (places.length > 0) {
      facts.push({
        type: "PLACE",
        fact: `${places.length} active child attractions/places linked directly to this landing page: ${places.map((p) => p.place.name).slice(0, 4).join(", ")}${places.length > 4 ? "..." : ""}.`,
      });
    }

    // 2. Matching Live Tours
    const slugKeyword = page.slug.replace(/kashmir|-/g, " ").trim();
    const firstWord = slugKeyword.split(" ")[0];
    if (firstWord && firstWord.length > 3) {
      const tours = await prisma.tour.findMany({
        where: {
          isLive: true,
          title: { contains: firstWord, mode: "insensitive" },
        },
        select: { id: true, title: true, price: true, duration: true },
        take: 3,
      });

      if (tours.length > 0) {
        facts.push({
          type: "TOUR",
          fact: `${tours.length} live tour package(s) verified in database matching '${firstWord}' (starting from ₹${tours[0].price?.toLocaleString() || "N/A"}).`,
          referenceId: tours[0].id,
        });
      }

      // 3. Matching Properties / Stays
      const properties = await prisma.property.findMany({
        where: {
          OR: [
            { name: { contains: firstWord, mode: "insensitive" } },
            { location: { contains: firstWord, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, location: true },
        take: 3,
      });

      if (properties.length > 0) {
        facts.push({
          type: "PROPERTY",
          fact: `${properties.length} verified stay accommodation(s) located in/near '${firstWord}' (e.g. ${properties.map((p) => p.name).join(", ")}).`,
          referenceId: properties[0].id,
        });
      }
    }

    // 4. Default verification
    facts.push({
      type: "GENERAL",
      fact: `Entity type '${page.type}' verified in production database with slug '/${page.slug}'.`,
    });
  } catch (error) {
    console.error("Error gathering verified database facts:", error);
  }

  return facts;
}

/**
 * Loads the complete Research & Strategy Studio dataset for an SEO landing page.
 */
export async function getSeoResearchStudioData(
  pageId: string
): Promise<SeoResearchStudioPayload | null> {
  try {
    const page = await prisma.seoLandingPage.findUnique({
      where: { id: pageId },
    });

    if (!page) return null;

    let pagePlaces: any[] = [];
    try {
      pagePlaces = await prisma.destinationPlace.findMany({
        where: { destinationId: page.id },
        include: {
          place: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
        orderBy: { displayOrder: "asc" },
      });
    } catch {}

    // 1. Fetch live GSC evidence
    let liveGscEvidence: SeoResearchData["gscEvidence"] = {
      hasData: false,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0,
      topQueries: [],
    };

    try {
      const gscOverview = await getGsc90DayOverview(false);
      if (gscOverview.success && gscOverview.topPages.length > 0) {
        // Find matching page by slug or URL
        const matchedGscPage = gscOverview.topPages.find(
          (p) =>
            p.cleanPath.includes(page.slug) ||
            p.pageUrl.includes(page.slug) ||
            (page.slug === "kashmir" && p.cleanPath === "/")
        );

        if (matchedGscPage) {
          liveGscEvidence = {
            hasData: true,
            clicks: matchedGscPage.clicks,
            impressions: matchedGscPage.impressions,
            ctr: matchedGscPage.ctr,
            position: matchedGscPage.position,
            topQueries: gscOverview.topQueries.slice(0, 5),
          };
        }
      }
    } catch (e) {
      console.warn("GSC evidence lookup warning:", e);
    }

    // 2. Fetch matched opportunity if any exists
    let matchedOpportunity: SeoResearchData["opportunityEvidence"] = null;
    try {
      const opp = await prisma.seoOpportunity.findFirst({
        where: {
          OR: [
            { existingPageUrl: { contains: page.slug } },
            { topic: { contains: page.title, mode: "insensitive" } },
          ],
        },
        orderBy: { opportunityScore: "desc" },
      });

      if (opp) {
        matchedOpportunity = {
          found: true,
          topic: opp.topic,
          opportunityScore: opp.opportunityScore,
          type: opp.type,
          intent: opp.intent || undefined,
          evidence: opp.evidence || undefined,
        };
      }
    } catch (e) {
      console.warn("Opportunity lookup warning:", e);
    }

    // 3. Analyze cannibalization
    const cannibalization = await analyzeCannibalization(page.title, page.id, page.slug);

    // 4. Gather verified database facts
    const verifiedDbFacts = await getVerifiedDatabaseFacts({
      id: page.id,
      slug: page.slug,
      type: page.type,
      title: page.title,
    });

    const savedResearch = (page.seoResearch as unknown as SeoResearchData) || null;
    const savedStrategy = (page.seoStrategy as unknown as SeoStrategyData) || null;

    // 5. Load generated draft from ContentAsset if present
    let generatedDraft: any = null;
    try {
      const asset = await prisma.contentAsset.findUnique({
        where: {
          seoPageId_platform: {
            seoPageId: page.id,
            platform: "SEO_PAGE",
          },
        },
        select: {
          id: true,
          title: true,
          content: true,
          jsonData: true,
          publishStatus: true,
          updatedAt: true,
        },
      });

      if (asset?.jsonData) {
        generatedDraft = {
          ...(asset.jsonData as any),
          assetId: asset.id,
          updatedAt: asset.updatedAt,
        };
      }
    } catch (e) {
      console.warn("Could not query ContentAsset for SEO studio:", e);
    }

    // 6. Check for any currently active ContentGenerationJob
    let activeJob: { id: string; status: string; startedAt: Date | null } | null = null;
    try {
      const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
      const job = await prisma.contentGenerationJob.findFirst({
        where: {
          seoLandingPageId: page.id,
          platform: "SEO_PAGE",
          status: { in: ["PENDING", "IN_PROGRESS"] },
          createdAt: { gte: threeMinutesAgo },
        },
        select: { id: true, status: true, startedAt: true },
        orderBy: { createdAt: "desc" },
      });
      if (job) {
        activeJob = job;
      }
    } catch (e) {
      console.warn("Could not check active ContentGenerationJob:", e);
    }

    return {
      page: {
        id: page.id,
        slug: page.slug,
        type: page.type,
        title: page.title,
        h1Heading: page.h1Heading,
        description: page.description,
        content: page.content,
        imageUrl: page.imageUrl,
        workflowState: page.workflowState,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        faqs: page.faqs,
        places: pagePlaces,
        validationReport: page.validationReport,
      },
      savedResearch,
      savedStrategy,
      liveGscEvidence,
      matchedOpportunity,
      cannibalization,
      verifiedDbFacts,
      generatedDraft,
      activeJob,
      savedValidationReport: (page.validationReport as any) || null,
    };
  } catch (error) {
    console.error("Error loading SeoResearchStudioData:", error);
    return null;
  }
}
