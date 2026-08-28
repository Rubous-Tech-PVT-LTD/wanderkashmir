import { getGscAnalytics, getGscSiteUrl } from "@/lib/gsc-client";
import { googleTrendsProvider, keywordPlannerProvider } from "./research/providers";
import prisma from "@/lib/prisma";
import { ContentOpportunity } from "./types";

const LOCATIONS = ['gulmarg', 'pahalgam', 'srinagar', 'sonmarg', 'kashmir', 'vergan', 'doodhpathri', 'yousmarg'];
const INTENTS = ['cafe', 'taxi', 'cab', 'hotel', 'resort', 'homestay', 'tour', 'package', 'places', 'itinerary', 'guide', 'weather', 'distance', 'fare'];

function getEntities(query: string) {
  const words = query.toLowerCase().split(/[^a-z0-9]+/);
  const locs = words.filter(w => LOCATIONS.includes(w));
  const ints = words.filter(w => INTENTS.includes(w));
  return { locs, ints, words: words.filter(w => w.length > 3 && !LOCATIONS.includes(w) && !INTENTS.includes(w)) };
}

function inferIntent(query: string, ints: string[]): ContentOpportunity['intent'] {
  const q = query.toLowerCase();
  if (q.includes('book') || q.includes('price') || q.includes('cost') || q.includes('fare')) return 'TRANSACTIONAL';
  if (ints.some(i => ['taxi', 'cab'].includes(i)) || q.includes('to')) return 'LOCAL'; // Transport
  if (q.includes('best') || q.includes('top') || q.includes('review')) return 'COMMERCIAL';
  if (q.includes('how') || q.includes('what') || q.includes('guide') || q.includes('weather')) return 'INFORMATIONAL';
  if (ints.some(i => ['hotel', 'resort', 'homestay', 'tour', 'package'].includes(i))) return 'COMMERCIAL';
  return 'UNKNOWN';
}

function getBusinessRelevance(ints: string[], locs: string[]): ContentOpportunity['businessRelevance'] {
  if (ints.some(i => ['hotel', 'resort', 'homestay', 'taxi', 'cab', 'tour', 'package'].includes(i))) return 'HIGH';
  if (ints.includes('cafe') || locs.length > 0) return 'MEDIUM';
  return 'LOW';
}

export async function detectOpportunities(saveToDb = false): Promise<ContentOpportunity[]> {
  const opportunities: ContentOpportunity[] = [];
  
  try {
    const siteUrl = await getGscSiteUrl();
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Fetch Top 500 Queries site-wide
    const analytics = await getGscAnalytics(siteUrl, startDate, endDate, ['query', 'page']);
    
    // Group raw queries
    const rawQueries = new Map<string, { clicks: number; impressions: number; positionSum: number; pages: Set<string> }>();
    analytics.forEach((row: any) => {
      const query = row.keys[0];
      const page = row.keys[1];
      if (!rawQueries.has(query)) {
        rawQueries.set(query, { clicks: 0, impressions: 0, positionSum: 0, pages: new Set() });
      }
      const data = rawQueries.get(query)!;
      data.clicks += row.clicks;
      data.impressions += row.impressions;
      data.positionSum += (row.position * row.impressions);
      data.pages.add(page);
    });

    const sortedQueries = Array.from(rawQueries.entries())
      .sort((a, b) => b[1].impressions - a[1].impressions)
      .slice(0, 500);

    // 2. Clustering
    const clusters: { name: string; queries: string[]; data: any }[] = [];
    
    for (const [query, data] of sortedQueries) {
      if (data.impressions < 10) continue; // Filter out extreme long tail noise
      
      const ents = getEntities(query);
      const clusterKey = [...ents.locs, ...ents.ints].sort().join('-') || ents.words.slice(0, 2).join('-');
      
      if (!clusterKey) continue; // Unclusterable noise

      let cluster = clusters.find(c => c.name === clusterKey);
      if (!cluster) {
        cluster = { name: clusterKey, queries: [], data: { clicks: 0, impressions: 0, positionSum: 0, pages: new Set() } };
        clusters.push(cluster);
      }
      cluster.queries.push(query);
      cluster.data.clicks += data.clicks;
      cluster.data.impressions += data.impressions;
      cluster.data.positionSum += data.positionSum;
      data.pages.forEach(p => cluster!.data.pages.add(p));
    }

    // 3. Existing Page Check
    const existingSeoPages = await prisma.seoLandingPage.findMany({ select: { slug: true, title: true, type: true }});
    const existingProperties = await prisma.property.findMany({ select: { id: true, name: true }});

    for (const cluster of clusters) {
       const primaryQuery = cluster.queries[0]; // The highest impression query in the cluster
       const avgPosition = cluster.data.positionSum / cluster.data.impressions;
       const ctr = cluster.data.impressions > 0 ? cluster.data.clicks / cluster.data.impressions : 0;
       
       const ents = getEntities(primaryQuery);
       const intent = inferIntent(primaryQuery, ents.ints);
       const bizRelevance = getBusinessRelevance(ents.ints, ents.locs);
       
       // Detect overlapping pages by DB match OR GSC reported ranking pages
       let existingPage: ContentOpportunity['existingPage'] | undefined;
       let cannibalizationRisk: ContentOpportunity['cannibalizationRisk'] = 'LOW';
       
       const querySlugified = primaryQuery.toLowerCase().replace(/[^a-z0-9-]/g, '-');
       
       // Check GSC Ranking Pages First
       let topRankingGscUrl = '';
       if (cluster.data.pages.size > 0) {
           const pagesArray = Array.from(cluster.data.pages) as string[];
           topRankingGscUrl = pagesArray[0]; // Take the first ranking page reported by GSC
       }
       
       // Match properties
       const matchedProp = existingProperties.find(p => p.name.toLowerCase().includes(ents.words.join(' ')) && ents.words.length > 0 || p.name.toLowerCase() === primaryQuery);
       if (matchedProp) {
         existingPage = { url: `/stays/${matchedProp.id}`, title: matchedProp.name, type: 'PROPERTY' };
       } else if (topRankingGscUrl) {
         // If GSC tells us what page ranks, use it! It's a real existing page.
         const urlPath = topRankingGscUrl.replace(/^https?:\/\/[^\/]+/, '');
         
         // Try to find its title in DB, otherwise use URL path
         const matchedSeo = existingSeoPages.find(p => urlPath.includes(p.slug));
         existingPage = { 
            url: urlPath, 
            title: matchedSeo ? matchedSeo.title : urlPath, 
            type: matchedSeo ? matchedSeo.type : 'PAGE' 
         };
       } else {
         // Fallback to strict DB matching if GSC didn't report a page
         const matchedSeo = existingSeoPages.find(p => querySlugified.includes(p.slug) || p.slug.includes(querySlugified) || p.title.toLowerCase().includes(primaryQuery));
         if (matchedSeo) {
           existingPage = { url: `/${matchedSeo.type.toLowerCase()}s/${matchedSeo.slug}`, title: matchedSeo.title, type: matchedSeo.type };
         }
       }
       
       // Check for cannibalization (multiple pages matching)
       let matchCount = 0;
       if (matchedProp) matchCount++;
       existingSeoPages.forEach(p => {
          if (querySlugified.includes(p.slug) || p.slug.includes(querySlugified) || p.title.toLowerCase().includes(primaryQuery)) matchCount++;
       });
       if (matchCount > 1) cannibalizationRisk = 'HIGH';
       else if (cluster.data.pages.size > 1) cannibalizationRisk = 'MEDIUM';

       // 4. Scoring & Action Logic
       let score = 0;
       let action: ContentOpportunity['type'] = 'IGNORE';
       let reason = '';
       let evidence = '';

       // Base score on volume
       const impScore = Math.min(cluster.data.impressions / 100, 40); // Max 40 pts for volume
       const bizScore = bizRelevance === 'HIGH' ? 30 : bizRelevance === 'MEDIUM' ? 15 : 5;
       
       score = impScore + bizScore;

       // Grab Free Signals (Graceful fallback)
       const displayTopic = cluster.queries[0].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

       // Evaluate all clusters that have any business relevance (score > 5 means at least LOW relevance)
       if (score > 5) {
         const [trends, planner] = await Promise.all([
            googleTrendsProvider.getTrends(displayTopic),
            keywordPlannerProvider.getPlannerData(displayTopic)
         ]);

         if (existingPage) {
             if (avgPosition >= 4 && avgPosition <= 20) {
                 action = 'OPTIMIZE';
                 score += 30; // High potential to push to top 3
                 evidence = `Ranking Pos ${avgPosition.toFixed(1)} with ${cluster.data.impressions} impressions. Trends: ${trends.trendSignal}`;
                 reason = `Existing page can be optimized to reach top 3.`;
             } else if (avgPosition <= 3 && ctr < 0.05) {
                 action = 'OPTIMIZE';
                 score += 20;
                 evidence = `Strong ranking (Pos ${avgPosition.toFixed(1)}) but low CTR (${(ctr*100).toFixed(1)}%). Trends: ${trends.trendSignal}`;
                 reason = `CTR opportunity. Needs better Meta Title/Description.`;
             } else if (avgPosition <= 3 && ctr >= 0.05) {
                 action = 'MONITOR';
                 score -= 20; // Don't prioritize
                 evidence = `Ranking Pos ${avgPosition.toFixed(1)} with strong CTR. Trends: ${trends.trendSignal}`;
                 reason = `Page is performing strongly. Protect and monitor.`;
             } else {
                 action = 'IGNORE'; // Way off page 2, existing page isn't working
             }
             
             if (cannibalizationRisk === 'HIGH') {
                action = 'OPTIMIZE';
                reason += ` High cannibalization risk detected across ${matchCount} pages. Needs manual review and consolidation.`;
                score += 10; // Prioritize fixing cannibalization
             }
         } else {
             if (bizRelevance === 'HIGH' || (bizRelevance === 'MEDIUM' && cluster.data.impressions > 50)) {
                 action = 'CREATE';
                 score += 30;
                 evidence = `${cluster.data.impressions} impressions for missing topic. Trends: ${trends.trendSignal}. Planner: ${planner.searchVolume}`;
                 reason = `Significant search volume for relevant intent, but no dedicated page exists.`;
             } else {
                 action = 'IGNORE';
             }
         }

         if (cannibalizationRisk === 'HIGH' && action === 'CREATE') {
            action = 'MANUAL_REVIEW';
            reason = 'Strong opportunity but high cannibalization risk with existing content.';
         }

         opportunities.push({
           topic: displayTopic,
           cluster: cluster.queries,
           type: action,
           evidence,
           gscSignals: {
             clicks: cluster.data.clicks,
             impressions: cluster.data.impressions,
             ctr,
             position: avgPosition
           },
           intent,
           businessRelevance: bizRelevance,
           existingPage,
           cannibalizationRisk,
           googleTrends: trends.status === 'AVAILABLE' ? trends.trendSignal : 'UNAVAILABLE',
           keywordPlanner: planner.status === 'AVAILABLE' ? String(planner.searchVolume) : 'UNAVAILABLE',
           opportunityScore: Math.min(Math.round(score), 100),
           reason
         });
       }
    }

    if (saveToDb) {
      for (const op of opportunities) {
        await prisma.seoOpportunity.upsert({
          where: { topic: op.topic },
          update: {
            cluster: op.cluster as any,
            gscSignals: op.gscSignals as any,
            intent: op.intent,
            businessRelevance: op.businessRelevance,
            cannibalizationRisk: op.cannibalizationRisk,
            googleTrends: op.googleTrends,
            keywordPlanner: op.keywordPlanner,
            type: op.type,
            opportunityScore: op.opportunityScore,
            reason: op.reason,
            evidence: op.evidence,
            existingPageUrl: op.existingPage?.url,
            existingPageType: op.existingPage?.type,
            updatedAt: new Date()
          },
          create: {
            topic: op.topic,
            cluster: op.cluster as any,
            gscSignals: op.gscSignals as any,
            intent: op.intent,
            businessRelevance: op.businessRelevance,
            cannibalizationRisk: op.cannibalizationRisk,
            googleTrends: op.googleTrends,
            keywordPlanner: op.keywordPlanner,
            type: op.type,
            opportunityScore: op.opportunityScore,
            reason: op.reason,
            evidence: op.evidence,
            existingPageUrl: op.existingPage?.url,
            existingPageType: op.existingPage?.type,
            status: "DISCOVERED"
          }
        });
      }
    }

    return opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);

  } catch (err) {
    console.error("Opportunity Engine Error:", err);
  }

  return opportunities;
}
