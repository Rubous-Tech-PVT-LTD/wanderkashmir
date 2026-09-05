import prisma from "@/lib/prisma";
import { ContentOpportunity } from "./types";
import { getEntities, inferIntent, toCanonicalTopic } from "./opportunity-engine";
import { googleTrendsProvider, keywordPlannerProvider } from "./research/providers";

// Seed strategy: Conservative core concepts
const SEEDS = [
  'kashmir tour package',
  'srinagar hotels',
  'pahalgam taxi',
  'kashmir honeymoon',
  'kashmir offbeat places'
];

export async function detectNetNewOpportunities(saveToDb = false): Promise<ContentOpportunity[]> {
  const opportunities: ContentOpportunity[] = [];
  const discoveredKeywords = new Set<string>();

  try {
    // 1. Generate Candidates from Seeds
    for (const seed of SEEDS) {
      const plannerData = await keywordPlannerProvider.getPlannerData(seed);
      if (plannerData.status === 'AVAILABLE' && plannerData.relatedKeywords.length > 0) {
        plannerData.relatedKeywords.forEach(kw => discoveredKeywords.add(kw.toLowerCase()));
      }
      discoveredKeywords.add(seed.toLowerCase()); // Always include the seed itself
    }

    // 2. Fetch Entity Universe (Load once, match in memory)
    const existingSeoPages = await prisma.seoLandingPage.findMany({ select: { id: true, slug: true, title: true, type: true }});
    const existingProperties = await prisma.property.findMany({ select: { id: true, name: true }});
    const existingTours = await prisma.tour.findMany({ where: { isLive: true }, select: { id: true, title: true, slug: true, category: true }});

    // 3. Process each discovered keyword
    for (const keyword of Array.from(discoveredKeywords)) {
      const ents = getEntities(keyword);
      const intent = inferIntent(keyword, ents.ints);
      
      const querySlugified = keyword.replace(/[^a-z0-9-]/g, '-');
      const isCommercialQuery = intent === 'COMMERCIAL' || intent === 'TRANSACTIONAL';
      
      // Intent Protection: Find exact entity matches for this intent
      let existingPage: { id?: string; url: string; title: string; type: string } | undefined = undefined;
      
      const matchedProp = existingProperties.find(p => 
        p.name.toLowerCase() === keyword || 
        (isCommercialQuery && keyword.includes(p.name.toLowerCase())) ||
        (isCommercialQuery && p.name.toLowerCase().includes(ents.words.join(' ')) && ents.words.length > 0)
      );
      
      const matchedTour = existingTours.find(t => 
        t.title.toLowerCase() === keyword || 
        (isCommercialQuery && keyword.includes(t.title.toLowerCase())) ||
        (isCommercialQuery && t.title.toLowerCase().includes(ents.words.join(' ')) && ents.words.length > 0)
      );

      const matchedSeo = existingSeoPages.find(p => 
        querySlugified.includes(p.slug) || 
        p.slug.includes(querySlugified) || 
        p.title.toLowerCase().includes(keyword)
      );

      // Entity purpose inference
      let inferredType = 'PAGE';
      if (intent === 'TRANSACTIONAL' || intent === 'COMMERCIAL' || intent === 'LOCAL') {
        if (ents.ints.includes('hotel') || ents.ints.includes('resort')) inferredType = 'PROPERTY';
        else if (ents.ints.includes('taxi') || ents.ints.includes('cab') || intent === 'LOCAL') inferredType = 'TAXI';
        else inferredType = 'TOUR';
      } else {
        inferredType = 'BLOG'; // Informational
      }

      // Check if existing entity serves EXACT intent
      if (matchedTour && isCommercialQuery) {
        existingPage = { id: matchedTour.id, url: `/tours/${matchedTour.slug}`, title: matchedTour.title, type: 'TOUR' };
      } else if (matchedProp && isCommercialQuery) {
        existingPage = { id: matchedProp.id, url: `/stays/${matchedProp.id}`, title: matchedProp.name, type: 'PROPERTY' };
      } else if (matchedSeo) {
        // If informational query and informational page exists, it matches.
        // Or if the SEO page is exactly targeting this.
        existingPage = { id: matchedSeo.id, url: `/${matchedSeo.type.toLowerCase()}s/${matchedSeo.slug}`, title: matchedSeo.title, type: matchedSeo.type };
      }

      // NET-NEW GATE
      if (existingPage) {
        // Not net-new. This is handled by GSC flow.
        continue; 
      }

      // Quality / Relevance Gate
      // Ensure it has at least some relevance to our domain
      if (ents.locs.length === 0 && !keyword.includes('kashmir') && !keyword.includes('srinagar') && !keyword.includes('gulmarg') && !keyword.includes('pahalgam') && !keyword.includes('sonmarg')) {
        continue; // Not relevant
      }

      // Fetch Evidence (Multi-source)
      // We do not reject if volume is unavailable!
      const [trends, planner] = await Promise.all([
        googleTrendsProvider.getTrends(keyword),
        keywordPlannerProvider.getPlannerData(keyword)
      ]);

      const trendSignal = trends.status === 'AVAILABLE' ? trends.trendSignal : 'UNAVAILABLE';
      const plannerVol = planner.status === 'AVAILABLE' ? String(planner.searchVolume) : 'UNAVAILABLE';
      
      const evidenceParts = [
        `Source: KEYWORD_PLANNER/TRENDS`,
        `Intent: ${intent}`,
        `Recommendation: ${inferredType}`
      ];

      if (plannerVol !== 'UNAVAILABLE') evidenceParts.push(`Volume: ${plannerVol}`);
      if (trendSignal !== 'UNAVAILABLE') evidenceParts.push(`Trends: ${trendSignal}`);
      if (plannerVol === 'UNAVAILABLE' && trendSignal === 'UNAVAILABLE') {
          evidenceParts.push(`Provider Data Unavailable (Assumed relevant)`);
      }

      const displayTopic = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const cTopic = toCanonicalTopic(displayTopic);

      // Score for net-new
      // We give it a base score so it shows up in manual review
      let score = 50; 
      if (planner.status === 'AVAILABLE' && typeof planner.searchVolume === 'number' && planner.searchVolume > 100) {
        score += 20;
      }
      if (intent === 'TRANSACTIONAL' || intent === 'COMMERCIAL') {
        score += 15;
      }

      opportunities.push({
        topic: displayTopic,
        canonicalTopic: cTopic,
        cluster: [keyword],
        type: 'MANUAL_REVIEW', // Phase 3 stops at manual review for NET_NEW
        evidence: evidenceParts.join(' | '),
        gscSignals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
        intent,
        businessRelevance: 'HIGH', // Passed our seed and location gate
        cannibalizationRisk: 'LOW',
        googleTrends: trendSignal,
        keywordPlanner: plannerVol,
        opportunityScore: score,
        reason: `NET_NEW: Relevant search demand exists, no existing entity serves this exact intent. Recommended Entity: ${inferredType}.`
      });
    }

    if (saveToDb && opportunities.length > 0) {
      // Idempotency: Deduplicate against existing opportunities (both GSC and Net-New)
      const allExisting = await prisma.seoOpportunity.findMany();
      const existingByCanonical = new Map<string, typeof allExisting[0]>();
      for (const rec of allExisting) {
        const cTopic = rec.canonicalTopic || toCanonicalTopic(rec.topic);
        // Only keep the most relevant/active one in map for quick lookup
        if (!existingByCanonical.has(cTopic) || rec.status !== 'RESOLVED') {
          existingByCanonical.set(cTopic, rec);
        }
      }

      for (const op of opportunities) {
        const cTopic = op.canonicalTopic!;
        const existingRecord = existingByCanonical.get(cTopic);

        if (existingRecord) {
          // If it already exists, DO NOT create a duplicate. 
          // Preserve GSC metrics if it was a GSC opportunity.
          // We can append our new evidence if we want, but for idempotency, we just ignore if it exists.
          continue; 
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
              status: 'DISCOVERED'
            }
          });
          existingByCanonical.set(cTopic, created);
        }
      }
    }

    return opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
  } catch (err) {
    console.error("Net-New Opportunity Engine Error:", err);
  }

  return opportunities;
}
