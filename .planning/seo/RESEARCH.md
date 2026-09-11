# SEO Intelligence — Research Engine

> **Authority:** Verified against `src/lib/seo/research-engine.ts` and `src/lib/seo/research/providers.ts` as of 2026-09-10.

---

## Overview

The Research Engine gathers all available context for a specific opportunity topic before strategy generation. It is **Admin-initiated** — not automatic.

**File:** `src/lib/seo/research-engine.ts`  
**Entry point:** `runSeoResearch(target, type, targetUrl?, historicalBaseline?)`

---

## Research Inputs

| Input | Description |
|-------|-------------|
| `target` | The opportunity topic/query string |
| `type` | Page type context (BLOG, TOUR, DESTINATION, TAXI, etc.) |
| `targetUrl` | URL of existing page (if optimizing an existing page) |
| `historicalBaseline` | Previous GSC metrics snapshot (for performance delta) |

---

## Research Process (Concurrent Execution)

The engine fires all provider calls **in parallel** using `Promise.all()`:

```typescript
const [analytics, kwRes, serpRes, trendsRes, plannerRes] = await Promise.all([
  gscPromise,          // Real GSC data
  keywordPromise,      // Keyword research provider (DISABLED)
  serpPromise,         // SERP research provider (DISABLED)
  trendsPromise,       // Google Trends (UNAVAILABLE)
  plannerPromise       // Google Keyword Planner (INTEGRATED)
]);
```

---

## GSC Analytics Gathering

**For existing pages:**
- Fetches 90-day analytics filtered by the specific page URL.
- Extracts: page-level metrics (total clicks, impressions, CTR, avg. position).
- Extracts: top 20 queries ranked for that page.

**For new topics (no existing page):**
- Fetches related queries from the 90-day analytics.
- Filters by term overlap with the target topic.

---

## Cannibalization Analysis

The research engine performs a multi-entity cannibalization check:

**Entity sources checked:**
1. `SeoLandingPage` table — all pages with slug/title matching.
2. `Property` table — all properties with name matching.
3. `Tour` table (`isLive: true`) — all active tours with title/slug matching.

**Stop word filtering:**
Generic words are excluded from entity matching to prevent false positives:
```
kashmir, valley, premium, luxury, guide, places, tour, tours, package, packages,
homestay, hotel, resort, taxi, cab, fare, distance, booking, trip, travel...
```

**Intent-based filtering:**
- TOUR and PROPERTY pages only flagged as competing for commercial/transactional queries.
- BLOG pages only flagged as competing for informational queries.
- Exact title match always flags regardless of intent.

**Cannibalization status:**
- `SAFE` — no competing pages
- `MEDIUM_RISK` — 1 competing page
- `HIGH_RISK` — 2+ competing pages

---

## Search Intent Inference

**Priority:** Provider data → heuristic fallback

```typescript
// 1. Try keyword research provider intent
if (keywordData.intent && keywordData.intent !== 'N/A') {
  searchIntent = keywordData.intent;
} else {
  // 2. Heuristic fallback
  if (contains('buy', 'book', 'price', 'cost', 'fare')) → 'transactional'
  else if (contains('best', 'review', 'top', 'hotel', 'resort', ...)) → 'commercial'
  else if (contains('how', 'what', 'guide', 'weather') || type === 'BLOG') → 'informational'
  else if (contains('near me', 'taxi', 'cab', 'to', 'distance') || type === 'TAXI') → 'local'
}
```

---

## Performance Delta Computation

When `historicalBaseline` is provided:

| Delta Status | Condition |
|-------------|-----------|
| `STRONG_PERFORMER` | Current metrics exceed/match baseline |
| `STRONG_PERFORMER` | CTR ≥ 5% AND position ≤ 10 |
| `STABLE` | Metrics within ±2 clicks of baseline |
| `IMPROVEMENT_CANDIDATE` | Metrics have declined from baseline |
| `INSUFFICIENT_DATA` | No historical baseline provided |

---

## Manual Review Recommendation Generation

If competing pages are found, the engine automatically calls the Manual Review Engine:

```typescript
if (cannibalizationRisk.competingPages.length > 0) {
  manualReviewRecommendation = generateManualReviewRecommendation(
    target,
    searchIntent,
    cannibalizationRisk.competingPages,
    topQueries
  );
}
```

**See [MANUAL-REVIEW.md](./MANUAL-REVIEW.md) for the recommendation engine detail.**

---

## Research Output (`SeoResearch`)

```typescript
{
  target: string,
  pageType: string,
  isExistingPage: boolean,
  pageUrl?: string,
  gsc: {
    hasPageLevelHistory: boolean,
    pageMetrics?: { clicks, impressions, ctr, position },
    topQueries: [],           // Top 20 queries for existing pages
    relatedQueries: [],       // Related queries for new topics
    opportunities: []
  },
  keywordResearch: KeywordResearchData,    // Status: DISABLED
  serpResearch: SerpResearchData,          // Status: DISABLED
  googleTrends: GoogleTrendsData,          // Status: UNAVAILABLE
  keywordPlanner: KeywordPlannerData,      // Status: AVAILABLE or UNAVAILABLE
  searchIntent: string,
  contentGaps: [],
  cannibalizationRisk: {
    status: 'SAFE' | 'MEDIUM_RISK' | 'HIGH_RISK',
    competingPages: [],
    recommendation: string,
    reason: string
  },
  historicalBaseline?: any,
  performanceDelta?: { status, reason },
  manualReviewRecommendation?: ManualReviewRecommendation
}
```

---

## Graceful Degradation

If any provider is unavailable or fails:
- The engine returns a `status: 'UNAVAILABLE'` or `status: 'DISABLED'` result for that provider.
- The pipeline **continues** with whatever data is available.
- **No fabricated metrics are ever injected.**
- Strategy engine handles `UNAVAILABLE` gracefully by basing decisions on GSC data alone.

---

## Provider Status Summary

| Provider | Status | Details |
|---------|--------|---------|
| GSC (Google Search Console) | ✅ ACTIVE | Real data, 90-day rolling |
| Google Keyword Planner | ✅ INTEGRATED | Requires Google Ads OAuth connection |
| Google Trends | ❌ UNAVAILABLE | Returns UNAVAILABLE always |
| Keyword Research Provider | ❌ DISABLED | `DefaultKeywordProvider` — "Paid Provider Disabled by Policy" |
| SERP Research Provider | ❌ DISABLED | `DefaultSerpProvider` — "Paid Provider Disabled by Policy" |

**See [PROVIDERS.md](./PROVIDERS.md) for full provider detail.**
