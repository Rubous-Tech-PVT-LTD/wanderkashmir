import prisma from "@/lib/prisma";
import { getGscSiteUrl, getGscAnalytics } from "@/lib/gsc-client";
import { toCanonicalTopic, getEntities, inferIntent } from "./opportunity-engine";
import { PagePerformanceFeedback, FeedbackSignalType } from "./types";

/**
 * Maps entity type and slug to public canonical URL path.
 * Adheres to Phase 4 verified routing conventions.
 */
export function getPagePublicUrl(type: string, slug: string): string {
  const t = (type || "").toUpperCase();
  switch (t) {
    case "BLOG":
      return `/blog/${slug}`;
    case "DESTINATION":
      return `/destinations/${slug}`;
    case "HOMESTAY":
      return `/homestays/${slug}`;
    case "TAXI":
      return `/taxis/${slug}`;
    case "TOUR":
      return `/tours/${slug}`;
    default:
      return `/${type.toLowerCase()}s/${slug}`;
  }
}

/**
 * Standard conservative expected CTR benchmark by ranking position.
 * Exact match with opportunity-engine.ts benchmarks.
 */
export function getExpectedCtrBenchmark(position: number): number {
  if (position <= 1.5) return 0.15; // 15%
  if (position <= 3.5) return 0.08; // 8%
  if (position <= 10.5) return 0.03; // 3%
  return 0.01; // 1%
}

function getBusinessRelevance(ints: string[], locs: string[]): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (ints.some(i => ['hotel', 'resort', 'homestay', 'taxi', 'cab', 'tour', 'package'].includes(i))) return 'HIGH';
  if (ints.includes('cafe') || locs.length > 0) return 'MEDIUM';
  return 'LOW';
}

/**
 * Evaluates performance of a single published page against its immutable baseline.
 * Enforces strict, non-overlapping deterministic signal precedence.
 */
export function analyzePageFeedback(
  page: {
    id: string;
    slug: string;
    type: string;
    title: string;
    gscInitialMetrics?: any;
  },
  queryRows: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>
): PagePerformanceFeedback | null {
  const pageUrl = getPagePublicUrl(page.type, page.slug);

  // Extract immutable baseline (or fallback to empty baseline if newly published)
  const rawBaseline = page.gscInitialMetrics || {};
  const baseline = {
    clicks: typeof rawBaseline.clicks === "number" ? rawBaseline.clicks : 0,
    impressions: typeof rawBaseline.impressions === "number" ? rawBaseline.impressions : 0,
    ctr: typeof rawBaseline.ctr === "number" ? rawBaseline.ctr : 0,
    position: typeof rawBaseline.position === "number" ? rawBaseline.position : 0,
  };

  // Aggregate current metrics from real GSC rows for this page
  let currentClicks = 0;
  let currentImpressions = 0;
  let weightedPositionSum = 0;

  for (const row of queryRows) {
    currentClicks += row.clicks;
    currentImpressions += row.impressions;
    weightedPositionSum += row.position * row.impressions;
  }

  const current = {
    clicks: currentClicks,
    impressions: currentImpressions,
    ctr: currentImpressions > 0 ? currentClicks / currentImpressions : 0,
    position: currentImpressions > 0 ? weightedPositionSum / currentImpressions : 0,
  };

  // Deltas (positive position delta means improvement, e.g. baseline 10 -> current 4 = +6)
  const delta = {
    clicks: current.clicks - baseline.clicks,
    impressions: current.impressions - baseline.impressions,
    ctr: current.ctr - baseline.ctr,
    position: baseline.position > 0 ? baseline.position - current.position : 0,
  };

  // Sort queries by impressions descending
  const sortedQueries = [...queryRows].sort((a, b) => b.impressions - a.impressions);
  const primaryQuery = sortedQueries[0]?.query || page.title;
  const canonicalTopic = toCanonicalTopic(primaryQuery);

  const ents = getEntities(primaryQuery);
  const intent = inferIntent(primaryQuery, ents.ints);
  const bizRelevance = getBusinessRelevance(ents.ints, ents.locs);
  const expectedCtr = getExpectedCtrBenchmark(current.position);
  const hasCtrDeficiency = current.impressions >= 50 && current.ctr < (expectedCtr * 0.5);

  let signal: FeedbackSignalType = 'STABLE';
  let recommendedAction: PagePerformanceFeedback['recommendedAction'] = 'MONITOR';
  let reason = '';

  // -------------------------------------------------------------
  // DETERMINISTIC SIGNAL PRECEDENCE WATERFALL
  // -------------------------------------------------------------

  // Precedence 1: Insufficient search volume
  if (current.impressions < 15 && (baseline.impressions < 15 || baseline.impressions === 0)) {
    signal = 'INSUFFICIENT_DATA';
    recommendedAction = 'MONITOR';
    reason = `Insufficient search impressions (${current.impressions}) to deduce statistical trend. Allowing indexing maturity.`;
  }
  // Precedence 2: Urgent Snippet Deficiency (High impressions with deficient CTR)
  else if (hasCtrDeficiency) {
    signal = 'HIGH_IMPRESSIONS_LOW_CTR';
    recommendedAction = 'OPTIMIZE';
    reason = `Page attracts strong search impressions (${current.impressions}) at rank ${current.position.toFixed(1)}, but CTR (${(current.ctr * 100).toFixed(1)}%) is severely below benchmark (${(expectedCtr * 100).toFixed(1)}%). Optimize Meta Title and Description snippet.`;
  }
  // Precedence 3: True Visibility Drop (Significant rank drop AND traffic contraction)
  // Must satisfy BOTH: position fell by >= 3 ranks AND impressions fell by >= 25%
  else if (
    baseline.impressions >= 25 &&
    (current.position - baseline.position) >= 3.0 &&
    current.impressions < (baseline.impressions * 0.75)
  ) {
    signal = 'PERFORMANCE_DECLINE';
    recommendedAction = 'OPTIMIZE';
    reason = `Meaningful visibility loss: average position dropped by ${(current.position - baseline.position).toFixed(1)} ranks and impressions contracted by ${Math.abs(delta.impressions)} (-${Math.round(((baseline.impressions - current.impressions) / baseline.impressions) * 100)}%) vs historical baseline. Investigate content freshness and competitor coverage.`;
  }
  // Precedence 4: Striking Distance (Page 1/2 rankings, 4.0 - 15.0)
  // Reuses existing opportunity-engine decision tree strictly
  else if (current.position >= 4.0 && current.position <= 15.0 && current.impressions >= 15) {
    signal = 'STRIKING_DISTANCE';
    if (current.position <= 10.0) {
      if (current.impressions >= 15 && (bizRelevance === 'HIGH' || bizRelevance === 'MEDIUM')) {
        recommendedAction = 'OPTIMIZE';
        reason = `Striking distance (Pos ${current.position.toFixed(1)}) with meaningful volume (${current.impressions} impr) and ${bizRelevance} relevance. Page-1 top-3 push recommended.`;
      } else {
        recommendedAction = 'MONITOR';
        reason = `Striking distance (Pos ${current.position.toFixed(1)}), but search volume (${current.impressions} impr) or relevance (${bizRelevance}) does not warrant immediate optimization priority.`;
      }
    } else {
      // Position 10.1 - 15.0
      if (current.impressions >= 30 && bizRelevance === 'HIGH') {
        recommendedAction = 'OPTIMIZE';
        reason = `Page 2 ranking (Pos ${current.position.toFixed(1)}) with solid volume (${current.impressions} impr) and HIGH relevance. On-page expansion recommended.`;
      } else {
        recommendedAction = 'MONITOR';
        reason = `Page 2 ranking (Pos ${current.position.toFixed(1)}), but evidence is not strong enough to prioritize over top-impact targets.`;
      }
    }
  }
  // Precedence 5: Healthy Growth & Strong Momentum (Expanding footprint / top rankings)
  else if (
    (delta.clicks > 0 && delta.position >= 0) ||
    (current.position <= 3.5 && current.ctr >= expectedCtr * 0.75) ||
    (baseline.impressions > 0 && current.impressions >= baseline.impressions * 1.25 && (current.position - baseline.position) <= 1.5)
  ) {
    signal = current.position <= 3.5 ? 'HEALTHY_GROWTH' : 'STRONG_MOMENTUM';
    recommendedAction = 'MONITOR';
    reason = `Page is thriving in search (Rank ${current.position.toFixed(1)}, ${current.clicks} clicks, ${current.impressions} impressions). Keyword visibility is expanding healthily. Protect current content and monitor.`;
  }
  // Precedence 6: Stable
  else {
    signal = 'STABLE';
    recommendedAction = 'MONITOR';
    reason = `Performance is stable and tracking near historical baseline (Rank ${current.position.toFixed(1)}, ${current.impressions} impressions).`;
  }

  // -------------------------------------------------------------
  // REUSE EXACT CONTINUOUS 0-100 SCORING MODEL
  // -------------------------------------------------------------
  const volumeSignal = Math.min(Math.log10(current.impressions + 1) * 12, 40);

  let bizScore = 0;
  if (bizRelevance === 'HIGH') bizScore = 30;
  else if (bizRelevance === 'MEDIUM') bizScore = 15;
  else if (bizRelevance === 'LOW') bizScore = 5;

  let intentScore = 0;
  if (intent === 'TRANSACTIONAL' || intent === 'COMMERCIAL') intentScore = 15;
  else if (intent === 'LOCAL') intentScore = 10;
  else if (intent === 'INFORMATIONAL') intentScore = 5;

  let posScore = 0;
  if (current.position <= 3.5) {
    posScore = 5;
    if (recommendedAction === 'MONITOR') posScore = -10;
  } else if (current.position >= 4 && current.position <= 10) {
    posScore = 15;
  } else if (current.position > 10 && current.position <= 20) {
    posScore = 10;
  }

  let finalScore = Math.round(volumeSignal + bizScore + intentScore + posScore);
  if (hasCtrDeficiency) finalScore += 15;
  if (signal === 'PERFORMANCE_DECLINE') finalScore += 10;

  finalScore = Math.max(0, Math.min(finalScore, 100));
  if (recommendedAction === 'IGNORE') finalScore = 0;

  // Format honest evidence string
  const evidence = `[FEEDBACK: ${signal}] Baseline: ${baseline.position > 0 ? baseline.position.toFixed(1) : 'N/A'} pos / ${baseline.impressions} impr | Current: ${current.position.toFixed(1)} pos / ${current.impressions} impr | Delta: ${delta.position >= 0 ? '+' : ''}${delta.position.toFixed(1)} pos, ${delta.impressions >= 0 ? '+' : ''}${delta.impressions} impr, ${(delta.ctr * 100).toFixed(1)}% CTR | Primary Query: "${primaryQuery}"`;

  return {
    pageId: page.id,
    slug: page.slug,
    pageType: page.type,
    pageUrl,
    title: page.title,
    canonicalTopic,
    primaryQuery,
    baseline,
    current,
    delta,
    signal,
    recommendedAction,
    opportunityScore: finalScore,
    reason,
    evidence,
    topQueries: sortedQueries.slice(0, 10)
  };
}

/**
 * Post-Publication SEO Optimization Feedback Loop
 * Ingests real GSC data, evaluates all published pages against their immutable baselines,
 * and updates or creates deduplicated SeoOpportunity records in-place.
 */
export async function runFeedbackLoop(saveToDb = false): Promise<PagePerformanceFeedback[]> {
  const feedbacks: PagePerformanceFeedback[] = [];

  try {
    const siteUrl = await getGscSiteUrl();
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // 1. Fetch real GSC page-level queries
    const analytics = await getGscAnalytics(siteUrl, startDate, endDate, ["page", "query"]);

    // 2. Fetch all published pages
    const publishedPages = await prisma.seoLandingPage.findMany({
      where: { workflowState: "PUBLISHED" },
      select: {
        id: true,
        slug: true,
        type: true,
        title: true,
        gscInitialMetrics: true
      }
    });

    if (publishedPages.length === 0) {
      return [];
    }

    // Group GSC rows by normalized URL path
    const rowsByPath = new Map<string, Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>>();

    for (const row of analytics) {
      const rawPage = (row.keys[0] || "").replace(/^https?:\/\/[^\/]+/, "");
      const query = row.keys[1] || "";
      if (!rawPage || !query) continue;

      if (!rowsByPath.has(rawPage)) {
        rowsByPath.set(rawPage, []);
      }
      rowsByPath.get(rawPage)!.push({
        query,
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      });
    }

    // 3. Evaluate each published page
    for (const page of publishedPages) {
      const pageRoute = getPagePublicUrl(page.type, page.slug);
      
      // Match rows for this page (handling exact route, trailing slash, or slug match)
      let pageRows = rowsByPath.get(pageRoute) || [];
      if (pageRows.length === 0) {
        // Fallback check: find by endsWith or slug match
        for (const [pathKey, rows] of rowsByPath.entries()) {
          if (pathKey.endsWith(`/${page.slug}`) || pathKey.includes(`/${page.slug}/`)) {
            pageRows = rows;
            break;
          }
        }
      }

      const feedback = analyzePageFeedback(page, pageRows);
      if (feedback) {
        feedbacks.push(feedback);
      }
    }

    // 4. Non-Destructive Deduplicated Database Persistence
    if (saveToDb && feedbacks.length > 0) {
      const allExisting = await prisma.seoOpportunity.findMany();

      for (const fb of feedbacks) {
        // COMPOUND DEDUPLICATION KEY: canonicalTopic + existingPageUrl
        // A single page can have distinct query clusters, but repeated syncs of the same cluster update in-place.
        const matchingRecord = allExisting.find(rec => {
          const recCanonical = rec.canonicalTopic || toCanonicalTopic(rec.topic);
          const sameCanonical = recCanonical === fb.canonicalTopic;
          const sameUrl = rec.existingPageUrl === fb.pageUrl;
          return sameCanonical && (sameUrl || !rec.existingPageUrl);
        });

        const gscSignalsData = {
          clicks: fb.current.clicks,
          impressions: fb.current.impressions,
          ctr: fb.current.ctr,
          position: fb.current.position,
          baseline: fb.baseline,
          delta: fb.delta,
          feedbackSignal: fb.signal,
          primaryQuery: fb.primaryQuery
        };

        if (matchingRecord) {
          // Update in-place (preserves id, createdAt, original topic, manual decisions)
          await prisma.seoOpportunity.update({
            where: { id: matchingRecord.id },
            data: {
              canonicalTopic: fb.canonicalTopic,
              cluster: fb.topQueries.map(q => q.query),
              gscSignals: gscSignalsData as any,
              type: fb.recommendedAction,
              opportunityScore: fb.opportunityScore,
              reason: fb.reason,
              evidence: fb.evidence,
              existingPageUrl: fb.pageUrl,
              existingPageType: fb.pageType,
              // If previously resolved and now has an active optimization signal, surface it back
              status: matchingRecord.status === 'RESOLVED' && fb.recommendedAction === 'OPTIMIZE' ? 'DISCOVERED' : matchingRecord.status,
              updatedAt: new Date()
            }
          });
        } else {
          // Only create new opportunity if meaningful score and action is OPTIMIZE or MONITOR
          if (fb.opportunityScore >= 15) {
            // Check if human topic string collision exists (topic is @unique)
            let uniqueTopic = fb.primaryQuery.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const topicCollision = allExisting.some(r => r.topic.toLowerCase() === uniqueTopic.toLowerCase());
            if (topicCollision) {
              uniqueTopic = `${uniqueTopic} (${fb.pageType})`;
            }

            await prisma.seoOpportunity.create({
              data: {
                topic: uniqueTopic,
                canonicalTopic: fb.canonicalTopic,
                cluster: fb.topQueries.map(q => q.query),
                gscSignals: gscSignalsData as any,
                intent: inferIntent(fb.primaryQuery, getEntities(fb.primaryQuery).ints),
                businessRelevance: getBusinessRelevance(getEntities(fb.primaryQuery).ints, getEntities(fb.primaryQuery).locs),
                cannibalizationRisk: 'LOW',
                type: fb.recommendedAction,
                opportunityScore: fb.opportunityScore,
                reason: fb.reason,
                evidence: fb.evidence,
                existingPageUrl: fb.pageUrl,
                existingPageType: fb.pageType,
                status: 'DISCOVERED'
              }
            });
          }
        }
      }
    }

    return feedbacks;
  } catch (error) {
    console.error("Feedback loop execution error:", error);
    return [];
  }
}
