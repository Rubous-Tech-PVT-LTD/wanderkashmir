# SEO Intelligence — Discovery System

> **Authority:** Verified against `src/lib/seo/opportunity-engine.ts` and `src/app/api/cron/discover-seo-opportunities/route.ts` as of 2026-09-10.

---

## Overview

Discovery is the **only fully automatic step** in the SEO Intelligence workflow. It runs via a scheduled cron job and continuously populates the `SeoOpportunity` database table with evidence-based opportunities from real GSC data.

**The Golden Rule:**
- DISCOVERY = AUTOMATIC
- GENERATION = CONTROLLED
- PUBLISHING = ADMIN APPROVAL

---

## Discovery Trigger

**Cron Route:** `GET /api/cron/discover-seo-opportunities`  
**Auth:** Bearer token `CRON_SECRET`  
**Max Duration:** 300 seconds (5 minutes — Vercel Pro max)  
**File:** `src/app/api/cron/discover-seo-opportunities/route.ts`

The cron calls `detectOpportunities(true)` with `saveToDb = true`.

---

## GSC Data Ingestion

1. Retrieves the GSC site URL from `SystemConfig` (key: `GSC_SITE_URL`).
2. Computes rolling 90-day window:
   - `startDate` = today − 90 days
   - `endDate` = today
3. Calls `getGscAnalytics(siteUrl, startDate, endDate, ['query', 'page'])`.
4. Fetches up to the top **500 queries** by impressions.

**Data per row:**
- `query` — the search term
- `page` — the URL that ranked
- `clicks`, `impressions`, `ctr`, `position`

---

## Semantic Clustering

Queries are grouped into clusters using entity tokens:

**Location tokens (hardcoded):**
```
gulmarg, pahalgam, srinagar, sonmarg, kashmir, vergan, doodhpathri, yousmarg
```

**Intent tokens (hardcoded):**
```
cafe, taxi, cab, hotel, resort, homestay, tour, package, places, itinerary,
guide, weather, distance, fare
```

**Clustering logic:**
- Cluster key = sorted `[location tokens] + [intent tokens]` joined with `-`.
- If no location/intent tokens, uses first 2 meaningful words.
- Queries without a cluster key are discarded as unclusterable noise.
- Queries with `< 10 impressions` are filtered out as extreme long-tail noise.

---

## Intent Inference

Function: `inferIntent(query, ints)` in `opportunity-engine.ts`

**Priority order (first match wins):**

1. **TRANSACTIONAL**: contains `book`, `price`, `cost`, `fare`
2. **LOCAL**: route pattern (`[loc] to [loc]`) OR transport tokens (`taxi`, `cab`, `transfer`, `transport`)
3. **INFORMATIONAL**: contains `itinerary`, `details`, `review`, `guide`, `how`, `what`, `why`, `weather`, `places to visit`, `things to do`, `attractions`, `tips`
4. **COMMERCIAL**: contains `best`, `top` OR entity tokens (`hotel`, `resort`, `homestay`, `tour`, `package`)
5. **UNKNOWN**: no match

---

## Business Relevance Scoring

Function: `getBusinessRelevance(ints, locs)` in `opportunity-engine.ts`

| Relevance | Condition |
|-----------|-----------|
| HIGH | Intent includes `hotel`, `resort`, `homestay`, `taxi`, `cab`, `tour`, `package` |
| MEDIUM | Intent includes `cafe` OR has location tokens |
| LOW | Neither of the above |

---

## Existing Page Detection

For each cluster, the engine checks for matching pages:

**Priority order:**
1. **Tour match**: `Tour` table (`isLive: true`) — matches by title or intent-qualified title.
2. **Property match**: `Property` table — matches by name.
3. **GSC-reported page**: If GSC data says a specific URL ranked, use it as the existing page (ground truth).
4. **SeoLandingPage slug match**: Fallback DB match by slug.

**Result:** `existingPage = { id, url, title, type }` or `undefined`.

---

## Cannibalization Detection

```typescript
matchCount = 0
if (matchedProp) matchCount++
if (matchedTour) matchCount++
existingSeoPages.forEach(p => { if (slug/title matches) matchCount++ })

if (matchCount > 1) → cannibalizationRisk = 'HIGH'
else if (cluster.data.pages.size > 1) → cannibalizationRisk = 'MEDIUM'
else → cannibalizationRisk = 'LOW'
```

HIGH cannibalization forces action to `MANUAL_REVIEW` (see [CANNIBALIZATION.md](./CANNIBALIZATION.md)).

---

## Opportunity Scoring Formula

**Continuous 0–100 scale.** Components:

| Component | Formula | Max |
|-----------|---------|-----|
| Volume Signal | `Math.min(Math.log10(impressions + 1) * 12, 40)` | 40 |
| Business Relevance | HIGH=30, MEDIUM=15, LOW=5 | 30 |
| Intent Signal | TRANSACTIONAL/COMMERCIAL=15, LOCAL=10, INFORMATIONAL=5 | 15 |
| Position Potential | Pos 4–10=15, Pos 11–20=10, Pos 1–3=5, >20=0 | 15 |
| CTR Deficiency | CTR < 50% of conservative benchmark → +15 | 15 |
| Cannibalization | HIGH risk → +10 (to prioritize the review) | 10 |

**Gatekeeper:** If `volumeSignal + bizScore + intentScore ≤ 5`, the query is dropped entirely.

**IGNORE actions** are forced to `opportunityScore = 0`.

---

## Action Classification Decision Tree

```
Has existing page?
│
├── YES
│   │
│   ├── Position 1–3.5
│   │   ├── CTR deficiency → OPTIMIZE
│   │   └── Healthy CTR → MONITOR (posScore = -10)
│   │
│   ├── Position 4–10
│   │   ├── impressions ≥ 15 AND HIGH/MEDIUM relevance → OPTIMIZE
│   │   └── Otherwise → MONITOR
│   │
│   ├── Position 11–20
│   │   ├── impressions ≥ 30 AND HIGH relevance → OPTIMIZE
│   │   └── Otherwise → MONITOR
│   │
│   └── Position > 20 → IGNORE
│
└── NO (no existing page)
    ├── HIGH relevance AND impressions ≥ 15 → CREATE
    ├── MEDIUM relevance AND impressions ≥ 50 AND commercial intent → CREATE
    └── Otherwise → IGNORE

OVERRIDE: HIGH cannibalization AND action is CREATE or OPTIMIZE → MANUAL_REVIEW
```

---

## Net-New Discovery

**File:** `src/lib/seo/net-new-engine.ts`

For topics that have no GSC signal (truly undiscovered), the engine uses **Google Keyword Planner** seeds:

```typescript
const SEEDS = [
  'kashmir tour package',
  'srinagar hotels',
  'pahalgam taxi',
  'kashmir honeymoon',
  'kashmir offbeat places'
]
```

**Process:**
1. Calls Keyword Planner for each seed → gets related keyword ideas.
2. Checks each keyword against existing Tours, Properties, SeoLandingPages.
3. If no existing entity serves the intent → qualifies as NET_NEW.
4. Relevance gate: keyword must contain Kashmir-region location tokens.
5. Net-new opportunities are saved as `type: 'MANUAL_REVIEW'` (Admin decides before creation).

**Note:** This engine only produces output when Google Keyword Planner OAuth is connected.

---

## Database Persistence Strategy

**Non-destructive upsert architecture:**

1. Look up existing record by `canonicalTopic` (case-insensitive).
2. If multiple records share same `canonicalTopic`:
   - Pick primary: active status > highest score > newest `updatedAt`.
   - Update primary in-place (preserves `id`, `createdAt`).
   - Mark non-primary duplicates as `RESOLVED`.
3. If no existing record → create new.
4. Topics no longer in GSC data → mark `RESOLVED` (never deleted).

**`SeoOpportunity` workflow states:**
- `DISCOVERED` — new topic found
- `RESEARCHED` — research engine has gathered context
- `SELECTED` — Admin has chosen to proceed
- `GENERATED` — content is drafted
- `VALIDATED` — content passed validation
- `PUBLISHED` — content is live
- `RESOLVED` — topic fell out of GSC window (preserved historically)
- `REJECTED` — validation failed

---

## External Signal Fetching

During discovery, external signals are fetched **only for actionable topics** (not IGNORE or MONITOR):

```typescript
if (action !== 'IGNORE' && action !== 'MONITOR') {
  const [trends, planner] = await Promise.all([
    googleTrendsProvider.getTrends(topic),  // Returns UNAVAILABLE
    keywordPlannerProvider.getPlannerData(topic)  // Returns AVAILABLE or UNAVAILABLE
  ]);
}
```

This prevents unnecessary API calls for low-priority topics.
