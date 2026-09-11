# SEO Intelligence — System Architecture

> **Authority:** Verified against `src/lib/seo/`, `prisma/schema.prisma`, and `src/app/api/` as of 2026-09-10.

---

## Overview

The WanderKashmir SEO Intelligence System is a **human-supervised, evidence-driven SEO decision engine** that connects real Google Search Console (GSC) data to the content and page management system.

It does **NOT** blindly generate pages. It discovers evidence-based opportunities, prepares data-driven strategies, and leaves every consequential decision in the hands of the human Admin.

---

## System Philosophy

```
REAL GSC DATA → BETTER DECISIONS → BETTER CONTENT → VALIDATION → HUMAN APPROVAL → PUBLISH
```

- **Evidence-first**: All opportunities must have real GSC signals.
- **Human-gated**: Risky actions (new pages, cannibalization resolution) require explicit Admin decision.
- **Non-destructive**: No automatic deletion, redirect, canonical change, or content replacement.
- **Precision over volume**: One good, evidence-backed page beats ten keyword-stuffed doorway pages.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │  Google Search       │  │  WanderKashmir Database      │  │
│  │  Console (ACTIVE)    │  │  (Tours, Properties,         │  │
│  │  - Real clicks       │  │   SeoLandingPages, Blogs,    │  │
│  │  - Impressions       │  │   TourCategories)            │  │
│  │  - CTR, Position     │  │                              │  │
│  │  - 90-day rolling    │  │                              │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│               OPPORTUNITY ENGINE                            │
│  src/lib/seo/opportunity-engine.ts                          │
│  - GSC query ingestion (top 500 queries)                    │
│  - Semantic clustering                                      │
│  - Intent inference                                         │
│  - Business relevance scoring                               │
│  - Existing page detection (Tours, Props, SeoLandingPages)  │
│  - Cannibalization detection                                │
│  - Continuous 0-100 opportunity scoring                     │
│  - Action classification (CREATE/OPTIMIZE/MONITOR/IGNORE/   │
│                           MANUAL_REVIEW)                    │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│              SeoOpportunity Database Table                  │
│  - Non-destructive upsert architecture                      │
│  - Stale topics → RESOLVED (never deleted)                  │
│  - Canonical topic deduplication                            │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│            ADMIN OPPORTUNITIES DASHBOARD                    │
│  Admin reviews discovered opportunities                     │
│  Admin selects an opportunity and triggers Research         │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│                RESEARCH ENGINE                              │
│  src/lib/seo/research-engine.ts                             │
│  - GSC page-level analytics                                 │
│  - Keyword research provider (disabled/unavailable)         │
│  - SERP research provider (disabled)                        │
│  - Google Trends (unavailable)                              │
│  - Google Keyword Planner (integrated, requires OAuth)      │
│  - Cannibalization analysis (Tours, Props, SeoPages)        │
│  - Historical performance baseline                          │
│  - Search intent inference (provider → heuristic fallback)  │
│  - Manual Review Recommendation generation                  │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│                STRATEGY ENGINE                              │
│  src/lib/seo/strategy-engine.ts                             │
│  - Powered by Gemini 2.5 Flash                              │
│  - Uses real research data as input                         │
│  - Produces component-level action plan                     │
│    (PROTECT / OPTIMIZE / EXPAND / ADD / REMOVE)             │
│  - Historical GSC performance ALWAYS has priority           │
│  - Programmatic enforcement of MANUAL_REVIEW when needed    │
└─────────────────────────────────────────────────────────────┘
              ↓ (blocked here if MANUAL_REVIEW and no Admin decision)
┌─────────────────────────────────────────────────────────────┐
│              MANUAL REVIEW ENGINE                           │
│  src/lib/seo/manual-review-engine.ts                        │
│  - AI-assisted primary page recommendation                  │
│  - Intent × entity type matrix scoring                      │
│  - Confidence: HIGH / MEDIUM / LOW                          │
│  - Plain language summary for Admin                         │
│  - Admin must make explicit decision to unblock pipeline    │
└─────────────────────────────────────────────────────────────┘
              ↓ (Admin decision received)
┌─────────────────────────────────────────────────────────────┐
│               GENERATION ENGINE                             │
│  src/lib/seo/generation-engine.ts                           │
│  - Powered by Gemini 2.5 Flash                              │
│  - Server-side guard: throws if MANUAL_REVIEW + no decision │
│  - Strictly follows Strategy blueprint                      │
│  - PROTECT → outputs [RETAIN EXISTING]                      │
│  - Fetches verified DB entity facts                         │
│  - Never fabricates prices, amenities, distances, names     │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│              VALIDATION ENGINE                              │
│  src/lib/seo/validation-engine.ts                           │
│  - Powered by Gemini 2.5 Flash                              │
│  - Checks: strategy compliance, keyword stuffing,           │
│    fake facts, protected query preservation,                │
│    search intent fulfillment                                │
│  - Result: PASS / FIX / FLAG                                │
└─────────────────────────────────────────────────────────────┘
              ↓ (PASS only)
┌─────────────────────────────────────────────────────────────┐
│              ADMIN PREVIEW & APPROVAL                       │
│  Content saved as workflowState=VALIDATED                   │
│  Admin reviews the preview                                  │
│  Admin explicitly approves → workflowState=PUBLISHED        │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│                PUBLISHED PAGE                               │
│  SeoLandingPage / Tour / Blog record live                   │
│  Internal linking and indexing readiness applies            │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│              GSC PERFORMANCE MEASUREMENT                    │
│  Next 90-day rolling window picks up performance            │
│  Optimization feedback loop → back to Opportunity Engine    │
└─────────────────────────────────────────────────────────────┘
```

---

## Component File Map

| Component | File | Verified |
|-----------|------|---------|
| GSC Client | `src/lib/gsc-client.ts` | ✅ |
| Opportunity Engine | `src/lib/seo/opportunity-engine.ts` | ✅ |
| Net-New Engine | `src/lib/seo/net-new-engine.ts` | ✅ |
| Research Engine | `src/lib/seo/research-engine.ts` | ✅ |
| Manual Review Engine | `src/lib/seo/manual-review-engine.ts` | ✅ |
| Strategy Engine | `src/lib/seo/strategy-engine.ts` | ✅ |
| Generation Engine | `src/lib/seo/generation-engine.ts` | ✅ |
| Validation Engine | `src/lib/seo/validation-engine.ts` | ✅ |
| Research Providers | `src/lib/seo/research/providers.ts` | ✅ |
| Google Ads Client | `src/lib/google-ads/client.ts` | ✅ |
| SEO Types | `src/lib/seo/types.ts` | ✅ |
| Admin SEO Actions | `src/actions/admin-seo.ts` | ✅ |
| Discovery Cron Route | `src/app/api/cron/discover-seo-opportunities/route.ts` | ✅ |
| Generate-SEO Route | `src/app/api/cron/generate-seo/route.ts` | ✅ |
| SEO Intelligence API | `src/app/api/admin/seo-intelligence/` | ✅ |
| Prisma Schema | `prisma/schema.prisma` | ✅ |

---

## Automation Boundary

| Step | Automation |
|------|-----------|
| Discovery (GSC → SeoOpportunity) | ✅ AUTOMATIC (cron) |
| Research | 🔵 MANUAL TRIGGER (Admin initiates) |
| Strategy | 🔵 AUTOMATIC after Research |
| Manual Review Recommendation | 🔵 AUTOMATIC when cannibalization detected |
| Admin Decision | 🔴 ADMIN REQUIRED (blocks pipeline) |
| Generation | 🔵 AUTOMATIC after Admin unblocks |
| Validation | 🔵 AUTOMATIC after Generation |
| Admin Approval | 🔴 ADMIN REQUIRED (final gate) |
| Publishing | 🔴 ADMIN REQUIRED |

---

## Website SEO Architecture

```
Home
  ↓
Kashmir Tour Packages Hub (/tours)
  ↓
Tour Categories (TourCategory model, /tours/[category])   [SCHEMA EXISTS, UI VARIES]
  ↓
Individual Tours (Tour model, /tours/[slug])              [IMPLEMENTED]

Destinations (/destinations/[slug])                       [CONCEPTUAL / PARTIAL]

Stays / Properties (/stays/[id])                          [IMPLEMENTED]

Taxis / Transport                                          [IMPLEMENTED]

Blogs / Guides (/blog/[slug])                             [IMPLEMENTED via SeoLandingPage type=BLOG]

SEO Landing Pages (type-dependent URL)                    [IMPLEMENTED]
```

> **See [ENTITIES.md](./ENTITIES.md) for exact implementation status of each entity type.**

---

## Gemini Model in Use

| Engine | Model | Verified |
|--------|-------|---------|
| Strategy Engine | `gemini-2.5-flash` | ✅ |
| Generation Engine | `gemini-2.5-flash` | ✅ |
| Validation Engine | `gemini-2.5-flash` | ✅ |
