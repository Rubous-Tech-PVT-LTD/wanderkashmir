# SEO Intelligence — Manual Review Engine

> **Authority:** Verified against `src/lib/seo/manual-review-engine.ts` and `src/lib/seo/types.ts` as of 2026-09-10.

---

## Overview

The Manual Review Engine is an **AI-assisted recommendation system** that analyzes competing pages to help the Admin make an informed primary-page decision.

**File:** `src/lib/seo/manual-review-engine.ts`  
**Entry:** `generateManualReviewRecommendation(targetTopic, searchIntent, competingPages, gscQueries)`

**Critically:** It produces a **recommendation only**. It does not make decisions. It does not change pages. The Admin makes the final decision.

---

## When It Runs

The Manual Review Engine runs automatically when `cannibalizationRisk.competingPages.length > 0` during research.

---

## Intent Classification

First, it classifies the search intent of the target topic:

```typescript
isAccommodationIntent = intent === 'commercial' | 'transactional'
                        OR topic contains: hotel, resort, homestay, stay, room, lodge

isTransportIntent = intent === 'local'
                    OR topic contains: taxi, cab, fare, distance, ride

isInformationalIntent = intent === 'informational'
                        OR topic contains: guide, weather, how, what, places, visit, history
```

---

## Intent × Entity Type Scoring Matrix

Each competing page is evaluated against the detected intent:

### Accommodation Intent

| Page Type | Score | Role | Intent Alignment |
|-----------|-------|------|-----------------|
| PROPERTY / HOMESTAY | 90 | PRIMARY_CANDIDATE | Direct commercial accommodation match |
| BLOG | 50 | SUPPORTING_INFORMATIONAL | Informational/reading intent |
| TAXI | 40 | SUPPORTING_TRANSPORT | Transport to the resort |
| DESTINATION | 60 | SUPPORTING_INFORMATIONAL | Regional context |

### Transport Intent

| Page Type | Score | Role | Intent Alignment |
|-----------|-------|------|-----------------|
| TAXI | 90 | PRIMARY_CANDIDATE | Direct transport/route match |
| BLOG | 50 | SUPPORTING_INFORMATIONAL | Travel background info |
| Other | 40 | SUPPORTING_COMMERCIAL | Secondary |

### Informational Intent

| Page Type | Score | Role | Intent Alignment |
|-----------|-------|------|-----------------|
| BLOG / DESTINATION | 90 | PRIMARY_CANDIDATE | Direct informational match |
| Other | 45 | SUPPORTING_COMMERCIAL | Commercial entity, secondary for info queries |

### General/Unknown Intent

| Page Type | Score | Role |
|-----------|-------|------|
| PROPERTY / HOMESTAY | 75 | PRIMARY_CANDIDATE |
| Other | 55 | SUPPORTING_INFORMATIONAL |

**Keyword overlap bonus:** +8 points if 2+ topic words match the page title/URL.

---

## Confidence Level

| Confidence | Condition |
|-----------|-----------|
| HIGH | Top candidate score ≥ 85 AND gap to second candidate ≥ 20 points |
| MEDIUM | Top candidate score ≥ 65 |
| LOW | Top candidate score < 65 (overlapping relevance) |

---

## Recommendation Output (`ManualReviewRecommendation`)

```typescript
{
  direction: 'USE_EXISTING_PRIMARY' | 'CONSOLIDATE' | 'CREATE_NEW' | 'IGNORE',
  recommendedPrimaryPage: {
    id, url, title, pageType,
    role, score, reasons, evidence
  } | null,
  intent: string,                // Human-readable intent description
  confidence: 'HIGH' | 'MEDIUM' | 'LOW',
  reason: string,                // Plain language explanation
  evidence: string[],            // Factual evidence list
  competingPages: CompetingPageCandidate[],
  targetTopic: string,
  searchIntent: string,
  confidenceReason: string,
  plainLanguageSummary: string,
  suggestedAction: 'USE_EXISTING_PRIMARY' | 'CONSOLIDATE' | 'CREATE_NEW' | 'MANUAL_SELECTION_REQUIRED'
}
```

---

## Evidence Reporting (Honest Transparency)

The recommendation always includes honest evidence statements:

```
"Target Search Intent: COMMERCIAL"
"Existing Competing Pages Detected: 2"
"Leading Candidate: Vergan Resort (PROPERTY)"
"Intent Alignment: Direct match for commercial accommodation intent"
"Calculated Relevance Score: 90/100"
"GSC Page-Level History: 5 verified queries" (or "N/A / UNAVAILABLE")
"Google Trends: UNAVAILABLE"
"Google Keyword Planner: UNAVAILABLE"
"Paid Keyword Research Provider: UNAVAILABLE (Disabled)"
"Paid SERP Provider: UNAVAILABLE (Disabled)"
```

**No fabricated metrics. No fake confidence signals.**

---

## No-Competing-Pages Case

If `competingPages.length === 0`:
```typescript
return {
  direction: 'CREATE_NEW',
  intent: searchIntent,
  reason: 'No competing pages detected. You may proceed with normal optimization or creation.',
  confidence: 'LOW',
  recommendedPrimaryPage: null,
  competingPages: []
}
```

---

## Admin's Role

The Manual Review Engine gives the Admin:
1. A ranked list of competing pages with scores and roles.
2. An AI recommendation with confidence level.
3. A plain-language summary.
4. Real evidence backing the recommendation.

The Admin then makes an **explicit `AdminManualReviewDecision`** to unblock the pipeline.

**See [ADMIN-DECISIONS.md](./ADMIN-DECISIONS.md) for decision types and their effects.**
