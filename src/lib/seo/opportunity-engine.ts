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

export function toCanonicalTopic(topic: string): string {
  return topic.trim().toLowerCase().replace(/\s+/g, ' ');
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

       // -------------------------------------------------------------
       // 1. CONTINUOUS SCORING MODEL
       // -------------------------------------------------------------
       
       let action: ContentOpportunity['type'] = 'IGNORE';
       let reason = '';
       let evidence = '';
       let finalScore = 0;

       // A. Volume Signal (Logarithmic to prevent dominance, Max ~40)
       // log10(100) * 10 = 20 | log10(1000) * 10 = 30 | log10(10000) * 10 = 40
       const volumeSignal = Math.min(Math.log10(cluster.data.impressions + 1) * 12, 40);

       // B. Business Relevance (Max 30)
       let bizScore = 0;
       if (bizRelevance === 'HIGH') bizScore = 30;
       else if (bizRelevance === 'MEDIUM') bizScore = 15;
       else if (bizRelevance === 'LOW') bizScore = 5;

       // C. Intent Signal (Max 15)
       let intentScore = 0;
       if (intent === 'TRANSACTIONAL' || intent === 'COMMERCIAL') intentScore = 15;
       else if (intent === 'LOCAL') intentScore = 10;
       else if (intent === 'INFORMATIONAL') intentScore = 5;

       // D. Position Potential (Max 15)
       let posScore = 0;
       if (existingPage) {
           if (avgPosition >= 4 && avgPosition <= 10) posScore = 15; // Striking distance
           else if (avgPosition >= 11 && avgPosition <= 20) posScore = 10; // Page 2
           else if (avgPosition <= 3) posScore = 5; // Already winning
           else posScore = 0; // Too deep
       }

       // E. CTR Opportunity (Max 15)
       let ctrScore = 0;
       let expectedCtr = 0;
       let hasCtrDeficiency = false;
       
       if (existingPage && cluster.data.impressions >= 10) {
           // Conservative fallback benchmark
           if (avgPosition <= 1.5) expectedCtr = 0.15;
           else if (avgPosition <= 3.5) expectedCtr = 0.08;
           else if (avgPosition <= 10.5) expectedCtr = 0.03;
           else expectedCtr = 0.01;
           
           if (ctr < expectedCtr * 0.5) { // If CTR is less than half of conservative expectation
               hasCtrDeficiency = true;
               ctrScore = 15;
           }
       }

       // Gate: Only evaluate if the base signal shows some life (e.g. at least low relevance + some volume)
       // This prevents thousands of absolute zero-value queries from cluttering the DB.
       const baseEvalScore = volumeSignal + bizScore + intentScore;
       
       // Default evidence string builder
       const evidenceParts = [
           `${cluster.data.impressions} impressions`,
           existingPage ? `Rank: ${avgPosition.toFixed(1)}` : `No page`,
           `Biz: ${bizRelevance}`,
           `Intent: ${intent}`
       ];

       if (baseEvalScore > 5) {
           // -------------------------------------------------------------
           // 2. STRICT ACTION DECISION TREE
           // -------------------------------------------------------------
           
           if (existingPage) {
               if (avgPosition <= 3.5) {
                   if (hasCtrDeficiency) {
                       action = 'OPTIMIZE';
                       reason = `Page ranks strong (${avgPosition.toFixed(1)}) but CTR (${(ctr*100).toFixed(1)}%) is significantly below conservative expectation (${(expectedCtr*100).toFixed(1)}%). Optimize Meta Title/Description.`;
                   } else {
                       action = 'MONITOR';
                       reason = `Already ranking top-3 with healthy CTR (${(ctr*100).toFixed(1)}%). Protect and monitor.`;
                       posScore = -10; // Penalize score slightly so active tasks rise above
                   }
               } else if (avgPosition >= 4 && avgPosition <= 10) {
                   if (cluster.data.impressions >= 15 && (bizRelevance === 'HIGH' || bizRelevance === 'MEDIUM')) {
                       action = 'OPTIMIZE';
                       reason = `Striking distance (Pos ${avgPosition.toFixed(1)}) with meaningful volume and relevance. Page-1/top-3 improvement is plausible.`;
                   } else {
                       action = 'MONITOR';
                       reason = `Striking distance, but insufficient volume or business relevance to prioritize immediate optimization.`;
                   }
               } else if (avgPosition > 10 && avgPosition <= 20) {
                   if (cluster.data.impressions >= 30 && bizRelevance === 'HIGH') {
                       action = 'OPTIMIZE';
                       reason = `Page 2 ranking (Pos ${avgPosition.toFixed(1)}) with strong volume and high relevance. Needs content expansion/optimization.`;
                   } else {
                       action = 'MONITOR';
                       reason = `Page 2 ranking, but evidence is not strong enough to prioritize over higher-impact targets.`;
                   }
               } else {
                   // Position > 20
                   action = 'IGNORE';
                   reason = `Page ranks deep (Pos ${avgPosition.toFixed(1)}). Current GSC evidence does not indicate a near-term page-one opportunity.`;
               }
           } else {
               // NO EXISTING PAGE
               if (bizRelevance === 'HIGH' && cluster.data.impressions >= 15) {
                   action = 'CREATE';
                   reason = `No suitable existing page found. Query has meaningful demand and HIGH business relevance.`;
               } else if (bizRelevance === 'MEDIUM' && cluster.data.impressions >= 50 && (intent === 'TRANSACTIONAL' || intent === 'COMMERCIAL')) {
                   action = 'CREATE';
                   reason = `No existing page. Moderate relevance but strong demand and commercial intent justify content creation.`;
               } else {
                   action = 'IGNORE';
                   reason = `No page exists, but search demand, intent, or business relevance is too weak to justify creation.`;
               }
           }

           // -------------------------------------------------------------
           // 3. CANNIBALIZATION OVERRIDE (Must happen last)
           // -------------------------------------------------------------
           let cannibalizationAdjustment = 0;
           if (cannibalizationRisk === 'HIGH') {
               if (action === 'CREATE' || action === 'OPTIMIZE') {
                   action = 'MANUAL_REVIEW';
                   reason = `Multiple existing URLs target this entity/intent. Manual review is required to resolve cannibalization before creating or optimizing.`;
                   cannibalizationAdjustment = 10; // Prioritize review
               }
           }

           // -------------------------------------------------------------
           // 4. FETCH EXTERNAL SIGNALS & FINALIZE SCORE
           // -------------------------------------------------------------
           
           // Only fetch expensive API signals if it's actionable
           let trendSignal = 'UNAVAILABLE';
           let plannerVol = 'UNAVAILABLE';
           const displayTopic = cluster.queries[0].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
           
           if (action !== 'IGNORE' && action !== 'MONITOR') {
             const [trends, planner] = await Promise.all([
                googleTrendsProvider.getTrends(displayTopic),
                keywordPlannerProvider.getPlannerData(displayTopic)
             ]);
             trendSignal = trends.status === 'AVAILABLE' ? trends.trendSignal : 'UNAVAILABLE';
             plannerVol = planner.status === 'AVAILABLE' ? String(planner.searchVolume) : 'UNAVAILABLE';
             if (trendSignal !== 'UNAVAILABLE') evidenceParts.push(`Trends: ${trendSignal}`);
           }

           // Final Continuous Score
       const rawScore = volumeSignal + bizScore + intentScore + posScore + ctrScore + cannibalizationAdjustment;
       finalScore = action === 'IGNORE' ? 0 : Math.min(Math.max(Math.round(rawScore), 0), 100);
       evidence = evidenceParts.join(' | ');

        const canonicalTopic = toCanonicalTopic(displayTopic);

        opportunities.push({
          topic: displayTopic,
          canonicalTopic,
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
          googleTrends: trendSignal,
          keywordPlanner: plannerVol,
          opportunityScore: finalScore,
          reason
        });
      }
    }

    if (saveToDb) {
      // CANONICAL PERSISTENCE & DEDUPLICATION STRATEGY:
      // - Lookup existing records by `canonicalTopic` (case-insensitive deduplication).
      // - If multiple records share the same canonicalTopic, pick the primary:
      //     1. Active (status != 'RESOLVED')
      //     2. Highest opportunityScore
      //     3. Newest updatedAt
      // - Update the existing primary record in place (preserving id, createdAt, original human topic).
      // - If no record exists for this canonicalTopic, create a new record.
      // - Any non-primary duplicate records for this canonicalTopic remain marked RESOLVED.
      // - Topics that vanished from GSC data entirely are marked RESOLVED (never deleted).

      const currentCanonicalTopics = new Set(opportunities.map(op => op.canonicalTopic || toCanonicalTopic(op.topic)));

      // Fetch all existing records to inspect canonical groupings
      const allExisting = await prisma.seoOpportunity.findMany();
      
      // Group by canonicalTopic
      const existingByCanonical = new Map<string, typeof allExisting>();
      for (const rec of allExisting) {
        const cTopic = rec.canonicalTopic || toCanonicalTopic(rec.topic);
        if (!existingByCanonical.has(cTopic)) {
          existingByCanonical.set(cTopic, []);
        }
        existingByCanonical.get(cTopic)!.push(rec);
      }

      for (const op of opportunities) {
        const cTopic = op.canonicalTopic || toCanonicalTopic(op.topic);
        const existingGroup = existingByCanonical.get(cTopic) || [];

        // Pick primary record if exists
        let primaryRecord: typeof allExisting[0] | undefined;
        if (existingGroup.length > 0) {
          // Sort to find best primary
          existingGroup.sort((a, b) => {
            const aActive = a.status !== 'RESOLVED' ? 1 : 0;
            const bActive = b.status !== 'RESOLVED' ? 1 : 0;
            if (aActive !== bActive) return bActive - aActive;
            if (a.opportunityScore !== b.opportunityScore) return b.opportunityScore - a.opportunityScore;
            return b.updatedAt.getTime() - a.updatedAt.getTime();
          });
          primaryRecord = existingGroup[0];
        }

        if (primaryRecord) {
          // Update primary record in place
          const statusForUpdate = primaryRecord.status;
          await prisma.seoOpportunity.update({
            where: { id: primaryRecord.id },
            data: {
              canonicalTopic: cTopic,
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
              status: statusForUpdate,
              updatedAt: new Date()
            }
          });

          // If there were other duplicates in this group, ensure they are RESOLVED
          for (let i = 1; i < existingGroup.length; i++) {
            const dup = existingGroup[i];
            if (dup.status !== 'RESOLVED' || dup.canonicalTopic !== cTopic) {
              await prisma.seoOpportunity.update({
                where: { id: dup.id },
                data: {
                  canonicalTopic: cTopic,
                  status: 'RESOLVED',
                  reason: 'Duplicate canonical topic — superseded by existing opportunity.',
                  updatedAt: new Date()
                }
              });
            }
          }
        } else {
          // Create new record
          const created = await prisma.seoOpportunity.create({
            data: {
              topic: op.topic,
              canonicalTopic: cTopic,
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
              status: 'DISCOVERED'
            }
          });
          // Update in-memory map
          existingByCanonical.set(cTopic, [created]);
        }
      }

      // SAFE STALE RESOLUTION:
      // Topics whose canonicalTopic is no longer in current GSC data are marked RESOLVED
      const staleBefore = allExisting.filter(r => {
        const cTopic = r.canonicalTopic || toCanonicalTopic(r.topic);
        return !currentCanonicalTopics.has(cTopic) && r.status !== 'RESOLVED';
      });

      if (staleBefore.length > 0) {
        await prisma.seoOpportunity.updateMany({
          where: { id: { in: staleBefore.map(r => r.id) } },
          data: {
            status: 'RESOLVED',
            reason: 'Topic no longer present in current GSC data window. Preserved for historical reference.',
            updatedAt: new Date()
          }
        });
        console.log(`[SEO Discovery] ${staleBefore.length} stale opportunities marked RESOLVED (not deleted).`);
      }
    }

    // Sort by score
    return opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);

  } catch (err) {
    console.error("Opportunity Engine Error:", err);
  }

  return opportunities;
}
