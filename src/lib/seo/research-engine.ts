import prisma from "@/lib/prisma";
import { getGscAnalytics, getGscSiteUrl } from "@/lib/gsc-client";
import { SeoResearch } from "./types";
import { keywordProvider, serpProvider, googleTrendsProvider, keywordPlannerProvider } from "./research/providers";
import { generateManualReviewRecommendation } from "./manual-review-engine";

export async function runSeoResearch(target: string, type: string, targetUrl?: string, historicalBaseline?: any): Promise<SeoResearch> {
  const isExistingPage = !!targetUrl;
  
  let pageMetrics;
  let topQueries: any[] = [];
  let relatedQueries: any[] = [];
  let opportunities: any[] = [];
  let performanceDelta: NonNullable<SeoResearch['performanceDelta']> = { status: 'INSUFFICIENT_DATA', reason: 'No historical baseline provided.' };
  let cannibalizationRisk: SeoResearch['cannibalizationRisk'] = { status: 'SAFE', competingPages: [], recommendation: 'KEEP_SEPARATE', reason: '' };
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
      const exactPageRows = analytics.filter((row: any) => {
        const pageKey = row.keys[1] || '';
        return pageKey === targetUrl || (targetUrl && pageKey.endsWith(targetUrl)) || (targetUrl && targetUrl.endsWith(pageKey));
      });
      
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
      }

      if (historicalBaseline) {
        const hist = historicalBaseline;
        const currentMetrics = pageMetrics || hist;
        if (currentMetrics.clicks >= hist.clicks && currentMetrics.impressions >= hist.impressions) {
          performanceDelta = { status: 'STRONG_PERFORMER', reason: 'Current metrics exceed or match historical baseline.' };
        } else if (currentMetrics.ctr >= 0.05 && currentMetrics.position <= 10) {
           performanceDelta = { status: 'STRONG_PERFORMER', reason: 'High CTR and Page 1 ranking indicates strong current performance.' };
        } else if (Math.abs(currentMetrics.clicks - hist.clicks) <= 2) {
           performanceDelta = { status: 'STABLE', reason: 'Current metrics are stable compared to baseline.' };
        } else {
           performanceDelta = { status: 'IMPROVEMENT_CANDIDATE', reason: 'Metrics have declined from baseline.' };
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
      select: { id: true, title: true, slug: true, type: true }
    });
    const existingProperties = await prisma.property.findMany({
      select: { id: true, name: true, location: true }
    });

    const stopWords = new Set(['to', 'the', 'in', 'for', 'and', 'of', 'with', 'a', 'an', 'is', 'called', 'what', 'fare', 'cost', 'guide', 'places', 'unique', 'hidden', 'best', 'top', '2026', '2025', '2024']);
    const targetWords = target.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !stopWords.has(w));
    const genericKeywords = new Set([
      'kashmir', 'valley', 'valleys', 'premium', 'luxury', 'guide', 'places', 'tour', 'tours', 'package', 'packages',
      'homestay', 'homestays', 'hotel', 'hotels', 'resort', 'resorts', 'taxi', 'taxis', 'cab', 'cabs', 'cabfare', 'fare',
      'distance', 'booking', 'bookings', 'stays', 'stay', 'trip', 'travel', 'secret', 'trails', 'hidden', 'waterfalls',
      'waterfall', 'meadow', 'meadows', 'riverfront', 'escape', 'view', 'retreat', 'exclusive', 'wonders', 'bliss',
      'ride', 'horse', 'riding', 'trek', 'trekking', 'adventure', 'eco', 'skiing', 'mountaineering', 'camping',
      'stargazing', 'tourism', 'safari', 'hiking', 'rafting', 'sightseeing', 'expedition', 'cottage', 'cottages',
      'lake', 'lakes', 'wild', 'serenity', 'authentic', 'village', 'life', 'pristine', 'cascades', 'cascade'
    ]);
    const entityTokens = targetWords.filter(w => !genericKeywords.has(w));

    // Map properties to a similar structure as SeoLandingPage for competition checking
    const propertyCandidates = existingProperties.map(p => ({
      id: p.id,
      title: p.name,
      slug: p.id,
      type: 'PROPERTY',
      entityType: 'PROPERTY' as const
    }));

    const seoPageCandidates = existingPages.map(p => ({
      ...p,
      entityType: 'SEO_LANDING_PAGE' as const
    }));

    const allCandidates = [...seoPageCandidates, ...propertyCandidates];

    const competing = allCandidates.filter(p => {
      const slugClean = p.slug.toLowerCase();
      if (isExistingPage && targetUrl && (targetUrl.toLowerCase().includes(slugClean) || slugClean.includes(targetUrl.toLowerCase().replace(/^\/[^/]+\//, '')))) {
        return false; // Don't flag itself
      }
      
      const titleWords = p.title.toLowerCase();
      const hasEntityMatch = entityTokens.length > 0 
        ? entityTokens.some(e => titleWords.includes(e) || slugClean.includes(e))
        : true;

      let matches = 0;
      for (const w of targetWords) {
        if (titleWords.includes(w) || slugClean.includes(w)) matches++;
      }
      return hasEntityMatch && matches >= Math.min(2, targetWords.length) && targetWords.length > 0;
    });

    if (competing.length > 0) {
      cannibalizationRisk = {
        status: competing.length > 1 ? 'HIGH_RISK' : 'MEDIUM_RISK',
        competingPages: competing.map(c => ({ 
          id: c.id, 
          url: c.entityType === 'PROPERTY' ? `/stays/${c.id}` : `/${c.type.toLowerCase()}s/${c.slug}`, 
          title: c.title, 
          type: c.type,
          entityType: c.entityType
        })),
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
       cannibalizationRisk = { status: 'SAFE', competingPages: [], recommendation: 'CREATE_NEW', reason: '' };
    }

    // 4. Search Intent Inference (Prioritize Provider, fallback to heuristic)
    if (keywordData && keywordData.intent && keywordData.intent !== 'N/A') {
      searchIntent = keywordData.intent;
    } else {
      const t = target.toLowerCase();
      if (t.includes('buy') || t.includes('book') || t.includes('price') || t.includes('cost') || t.includes('fare')) {
        searchIntent = 'transactional';
      } else if (t.includes('best') || t.includes('review') || t.includes('top') || t.includes('hotel') || t.includes('resort') || t.includes('homestay') || t.includes('stay') || t.includes('tour') || t.includes('package')) {
        searchIntent = 'commercial';
      } else if (t.includes('how') || t.includes('what') || t.includes('guide') || t.includes('weather') || type === 'BLOG') {
        searchIntent = 'informational';
      } else if (t.includes('near me') || t.includes('taxi') || t.includes('cab') || t.includes('to') || t.includes('distance') || type === 'TAXI') {
        searchIntent = 'local';
      }
    }

  } catch (error) {
    console.error("SEO Research Engine Error:", error);
  }

  // 5. Generate AI-Assisted Manual Review Recommendation if competing pages exist
  let manualReviewRecommendation;
  if (cannibalizationRisk.competingPages.length > 0) {
    manualReviewRecommendation = generateManualReviewRecommendation(
      target,
      searchIntent,
      cannibalizationRisk.competingPages,
      topQueries.length > 0 ? topQueries : relatedQueries
    );
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
    performanceDelta,
    manualReviewRecommendation
  };
}
