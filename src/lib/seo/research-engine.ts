import prisma from "@/lib/prisma";
import { getGscAnalytics, getGscSiteUrl } from "@/lib/gsc-client";
import { SeoResearch } from "./types";
import { keywordProvider, serpProvider, googleTrendsProvider, keywordPlannerProvider } from "./research/providers";

export async function runSeoResearch(target: string, type: string, targetUrl?: string, historicalBaseline?: any): Promise<SeoResearch> {
  const isExistingPage = !!targetUrl;
  
  let pageMetrics;
  let topQueries: any[] = [];
  let relatedQueries: any[] = [];
  let opportunities: any[] = [];
  let performanceDelta = { status: 'INSUFFICIENT_DATA' as const, reason: 'No historical baseline provided.' };
  let cannibalizationRisk = { status: 'SAFE' as const, competingPages: [] as any[], recommendation: 'KEEP_SEPARATE' as const, reason: '' };
  let searchIntent = 'unknown';

  let keywordData = { status: 'UNAVAILABLE' as const, source: 'Not Configured', searchVolume: 'N/A' as const, difficulty: 'N/A' as const, intent: 'N/A' as const, relatedKeywords: [] };
  let serpData = { status: 'UNAVAILABLE' as const, source: 'Not Configured', results: [], commonTopics: [] };
  let trendsData = { status: 'UNAVAILABLE' as const, source: 'Google Trends unavailable', trendSignal: 'UNAVAILABLE' as const };
  let plannerData = { status: 'UNAVAILABLE' as const, source: 'Keyword Planner unavailable', searchVolume: 'N/A' as const, competition: 'N/A' as const, relatedKeywords: [] };

  try {
    const siteUrl = await getGscSiteUrl();
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Define promises for concurrent execution
    const gscPromise = getGscAnalytics(siteUrl, startDate, endDate, isExistingPage ? ['query', 'page'] : ['query']);
    const keywordPromise = keywordProvider.getKeywordMetrics(target);
    const serpPromise = serpProvider.getSerpResults(target);
    const trendsPromise = googleTrendsProvider.getTrends(target);
    const plannerPromise = keywordPlannerProvider.getPlannerData(target);

    // Wait for all providers
    const [analytics, kwRes, serpRes, trendsRes, plannerRes] = await Promise.all([gscPromise, keywordPromise, serpPromise, trendsPromise, plannerPromise]);
    keywordData = kwRes as any;
    serpData = serpRes as any;
    trendsData = trendsRes as any;
    plannerData = plannerRes as any;

    if (isExistingPage && targetUrl) {
      const exactPageRows = analytics.filter((row: any) => row.keys[1] === targetUrl);
      
      if (exactPageRows.length > 0) {
        let totalClicks = 0;
        let totalImpressions = 0;
        let weightedPositionSum = 0;
        
        topQueries = exactPageRows.map((row: any) => {
          totalClicks += row.clicks;
          totalImpressions += row.impressions;
          weightedPositionSum += (row.position * row.impressions);
          return {
            query: row.keys[0],
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position
          };
        }).sort((a: any, b: any) => b.impressions - a.impressions).slice(0, 20);

        pageMetrics = {
          clicks: totalClicks,
          impressions: totalImpressions,
          ctr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
          position: totalImpressions > 0 ? weightedPositionSum / totalImpressions : 0
        };

        if (historicalBaseline) {
          const hist = historicalBaseline;
          if (pageMetrics.clicks >= hist.clicks && pageMetrics.impressions >= hist.impressions) {
            performanceDelta = { status: 'STRONG_PERFORMER', reason: 'Current metrics exceed or match historical baseline.' };
          } else if (pageMetrics.ctr >= 0.05 && pageMetrics.position <= 10) {
             performanceDelta = { status: 'STRONG_PERFORMER', reason: 'High CTR and Page 1 ranking indicates strong current performance.' };
          } else if (Math.abs(pageMetrics.clicks - hist.clicks) <= 2) {
             performanceDelta = { status: 'STABLE', reason: 'Current metrics are stable compared to baseline.' };
          } else {
             performanceDelta = { status: 'IMPROVEMENT_CANDIDATE', reason: 'Metrics have declined from baseline.' };
          }
        }
      }
    } else {
      const searchTerms = target.toLowerCase().split(' ').filter(w => w.length > 2);
      relatedQueries = analytics.filter((row: any) => {
        const query = row.keys[0].toLowerCase();
        return searchTerms.some(term => query.includes(term));
      }).slice(0, 20).map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      }));
    }

    // 3. Cannibalization Check (Internal DB)
    const existingPages = await prisma.seoLandingPage.findMany({
      select: { title: true, slug: true, type: true }
    });

    const targetWords = target.toLowerCase().split(' ').filter(w => w.length > 3);
    const competing = existingPages.filter(p => {
      if (isExistingPage && targetUrl && targetUrl.includes(p.slug)) return false; // Don't flag itself
      
      const titleWords = p.title.toLowerCase();
      let matches = 0;
      for (const w of targetWords) {
        if (titleWords.includes(w)) matches++;
      }
      return matches >= Math.min(2, targetWords.length);
    });

    if (competing.length > 0) {
      cannibalizationRisk = {
        status: competing.length > 1 ? 'HIGH_RISK' : 'MEDIUM_RISK',
        competingPages: competing.map(c => ({ url: `/${c.type.toLowerCase()}s/${c.slug}`, title: c.title, type: c.type })),
        recommendation: 'MANUAL_REVIEW',
        reason: `Found ${competing.length} competing pages. Requires manual review of search intent before consolidating.`
      };
      
      // Heuristic: If we are a property and there's a blog/taxi with same name, it might be different intent or cannibalization.
      if (isExistingPage && competing.some(c => c.type === 'BLOG' || c.type === 'TAXI')) {
        cannibalizationRisk.recommendation = 'MANUAL_REVIEW';
        cannibalizationRisk.reason = 'Multiple intent types (e.g. TAXI/BLOG) share the primary keyword. Check if search intent overlaps (e.g. promoting the hotel vs providing distinct transport info). Consolidate only if intent overlaps, otherwise KEEP_SEPARATE.';
      }
      
    } else if (isExistingPage) {
       cannibalizationRisk = { status: 'SAFE', competingPages: [], recommendation: 'OPTIMIZE_EXISTING', reason: '' };
    } else {
       cannibalizationRisk = { status: 'SAFE', competingPages: [], recommendation: 'KEEP_SEPARATE', reason: '' };
    }

    // 4. Search Intent Inference (Prioritize Provider, fallback to heuristic)
    if (keywordData && keywordData.intent && keywordData.intent !== 'N/A') {
      searchIntent = keywordData.intent;
    } else {
      const t = target.toLowerCase();
      if (t.includes('buy') || t.includes('book') || t.includes('price') || t.includes('package')) {
        searchIntent = 'transactional';
      } else if (t.includes('best') || t.includes('review') || t.includes('top')) {
        searchIntent = 'commercial';
      } else if (t.includes('how to') || t.includes('guide') || t.includes('what is') || type === 'BLOG') {
        searchIntent = 'informational';
      } else if (t.includes('near me') || t.includes('taxi') || t.includes('srinagar to')) {
        searchIntent = 'local';
      }
    }

  } catch (error) {
    console.error("SEO Research Engine Error:", error);
  }

  return {
    target,
    pageType: type,
    isExistingPage,
    pageUrl: targetUrl,
    historicalBaseline,
    gsc: {
      hasPageLevelHistory: !!pageMetrics,
      pageMetrics,
      topQueries,
      relatedQueries,
      opportunities
    },
    googleTrends: trendsData,
    keywordPlanner: plannerData,
    keywordResearch: keywordData,
    serpResearch: serpData,
    searchIntent,
    contentGaps: [],
    cannibalizationRisk,
    performanceDelta
  };
}
