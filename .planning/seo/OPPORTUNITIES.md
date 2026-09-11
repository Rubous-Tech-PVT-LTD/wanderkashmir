# SEO Intelligence — Opportunities

> **Authority:** Verified against `src/lib/seo/opportunity-engine.ts` and `src/lib/seo/types.ts` as of 2026-09-10.

---

## Opportunity Types

The `ContentOpportunity.type` field classifies what action the business should take:

| Type | Meaning | When Triggered |
|------|---------|---------------|
| `CREATE` | No suitable existing page exists; evidence supports creation | No existing page + HIGH relevance + sufficient volume |
| `OPTIMIZE` | An existing page can be improved | Existing page in striking distance (pos 4–20) OR CTR deficiency |
| `MONITOR` | Existing page is healthy or low priority | Top-3 with good CTR, or insufficient evidence to act now |
| `MANUAL_REVIEW` | Multiple pages target the same entity/intent | HIGH cannibalization risk |
| `IGNORE` | No near-term opportunity | Ranking too deep (>20) OR insufficient relevance/volume |

---

## Opportunity Score (0–100 Continuous)

**No coarse bucket scoring. No impressions dominance.**

### Scoring Components

```
Component                  Formula                              Max Points
─────────────────────────────────────────────────────────────────────────
Volume Signal              Math.min(log10(impressions+1)*12, 40)     40
Business Relevance         HIGH=30, MEDIUM=15, LOW=5                 30
Intent Signal              TRANSACTIONAL/COMMERCIAL=15, LOCAL=10,     15
                           INFORMATIONAL=5
Position Potential         Pos 4-10=+15, Pos 11-20=+10, Pos 1-3=+5,  15
                           Pos >20=0 (MONITOR gets -10 penalty)
CTR Deficiency             CTR < 50% of benchmark → +15              15
Cannibalization            HIGH risk → +10 (to surface for review)   10
─────────────────────────────────────────────────────────────────────────
TOTAL MAX                                                            100
```

### CTR Deficiency Benchmarks

| Position | Conservative Expected CTR | Deficiency Threshold |
|----------|--------------------------|---------------------|
| ≤ 1.5 | 15% | < 7.5% |
| ≤ 3.5 | 8% | < 4% |
| ≤ 10.5 | 3% | < 1.5% |
| > 10.5 | 1% | < 0.5% |

### Gatekeeper Rule

```
baseEvalScore = volumeSignal + bizScore + intentScore
if (baseEvalScore <= 5) → query is dropped entirely
```

This prevents low-value queries from cluttering the database.

### IGNORE Override

`IGNORE` actions are always forced to `opportunityScore = 0`, regardless of raw score.

---

## Decision Tree

```
Has Existing Page?
├── YES
│   ├── Position 1–3.5
│   │   ├── CTR deficiency (< 50% of benchmark) → OPTIMIZE
│   │   └── Healthy CTR → MONITOR (score −10)
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
    ├── MEDIUM relevance AND impressions ≥ 50 AND commercial → CREATE
    └── Otherwise → IGNORE

CANNIBALIZATION OVERRIDE (runs after all above):
HIGH risk AND (action === CREATE OR OPTIMIZE) → MANUAL_REVIEW
```

---

## Opportunity Database Model

**Model:** `SeoOpportunity` in `prisma/schema.prisma` (line 827)

```prisma
model SeoOpportunity {
  id                   String   @id @default(cuid())
  topic                String   @unique
  cluster              Json?    // Array of related queries
  gscSignals           Json?    // { clicks, impressions, ctr, position }
  intent               String?
  businessRelevance    String?
  cannibalizationRisk  String?
  googleTrends         String?
  keywordPlanner       String?
  type                 String   // CREATE/OPTIMIZE/MONITOR/IGNORE/MANUAL_REVIEW
  opportunityScore     Int      @default(0)
  reason               String?
  evidence             String?
  existingPageUrl      String?
  existingPageType     String?
  status               String   @default("DISCOVERED")
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  canonicalTopic       String?
  manualReviewDecision Json?

  @@index([canonicalTopic])
}
```

**Workflow states for `status`:**

| Status | Meaning |
|--------|---------|
| `DISCOVERED` | Found by cron discovery |
| `RESEARCHED` | Research engine ran |
| `SELECTED` | Admin chose to work on it |
| `GENERATED` | Content drafted |
| `VALIDATED` | Validation passed |
| `PUBLISHED` | Page is live |
| `RESOLVED` | Fell out of GSC window (preserved historically) |
| `REJECTED` | Validation failed |

---

## Canonical Topic Deduplication

Topics are normalized to a **canonicalTopic** (lowercase, trimmed, normalized whitespace).

This prevents duplicate opportunities for the same semantic topic appearing as separate DB records.

**Priority for selecting the primary record when duplicates exist:**
1. Active status (not RESOLVED) wins.
2. Higher `opportunityScore` wins.
3. Most recently updated wins.

---

## Real Examples (from existing system)

### Vergan Resort
- **Action:** `MANUAL_REVIEW`
- **Why:** Extremely high relevance and volume. Multiple existing pages target it (Property page + Blog). Cannibalization must be resolved before any action.

### Keran Valley Homestay
- **Action:** `MANUAL_REVIEW`
- **Score:** 92
- **Why:** Very high score but CTR deficiency OR cannibalization flags require human decision.

### Pine Palace Hotel Gulmarg
- **Action:** `IGNORE`
- **Score:** 0
- **Why:** Ranks at position 46. No near-term page-one opportunity.

### Salamabad
- **Action:** `MONITOR`
- **Score:** 62
- **Why:** In striking distance (Pos 8.7) but insufficient volume/relevance to prioritize.

### What Is The Other Name For Oont Kadal In Kashmir?
- **Action:** `MONITOR`
- **Score:** 64
- **Why:** Page 2 ranking but not strong enough commercial signal to prioritize.

---

## What MANUAL_REVIEW Means

`MANUAL_REVIEW` does **NOT** automatically:
- Delete pages
- Redirect pages
- Merge pages
- Modify canonical tags
- Change page content

It means: **Admin must decide which page is the primary ranking page for that search intent.** The pipeline is blocked until the Admin makes an explicit decision.

See [MANUAL-REVIEW.md](./MANUAL-REVIEW.md) and [ADMIN-DECISIONS.md](./ADMIN-DECISIONS.md).

---

## Example: Query Analysis Scenarios

### Scenario: "Kashmir tour packages"

- **Existing:** Tours hub page, individual Tour pages, TourCategory pages.
- **Expected action:** OPTIMIZE or MONITOR the existing page. **Do NOT create a competing SeoLandingPage.**
- **Rule:** The Tours hub already serves this intent. Verify GSC data for it and optimize.

### Scenario: "Gondola ticket"

- **Check first:** Existing experience/tour/destination/guide pages about Gulmarg Gondola.
- **Expected:** If a Tour or SeoLandingPage already covers this, treat as OPTIMIZE or MONITOR.
- **Do NOT:** Auto-create a new page simply because the query has impressions.

### Scenario: "[City] to Kashmir tour packages"

- **Analyze:** Does the source-city intent represent a genuinely distinct audience from "Kashmir tour packages"?
- **Check:** Do existing Tours already satisfy the intent (e.g., pickup from Delhi included)?
- **Business check:** Does WanderKashmir actually serve that source city?
- **Rule against:** Mass doorway pages for every source city without actual inventory distinction.

### Scenario: "Hotel Vergan Resort" (Cannibalization Example)

1. Engine detects:
   - Property page at `/stays/[id]` for Vergan Resort.
   - Blog post about Vergan Resort.
   - Both pages ranking for similar queries.
2. Engine scores both; `matchCount > 1` → `cannibalizationRisk = 'HIGH'`.
3. Action forced to `MANUAL_REVIEW`.
4. Manual Review Engine runs intent matrix:
   - Property page → COMMERCIAL intent → PRIMARY_CANDIDATE (score 90).
   - Blog post → INFORMATIONAL intent → SUPPORTING_INFORMATIONAL (score 50).
5. AI recommends: Property page as primary for commercial queries, Blog as supporting.
6. Admin reviews recommendation.
7. Admin decides: `USE_EXISTING_PRIMARY` (Property) for commercial queries, Blog kept as-is.
8. No automatic changes made. Admin executes any desired optimization manually.
