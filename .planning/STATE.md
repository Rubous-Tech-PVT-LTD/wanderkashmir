# WanderKashmir — Current State

> **Last Updated:** 2026-09-10  
> **Verified against repository code.**

---

## SEO Intelligence — Current State

### What's Working Right Now

```
✅ GSC OAuth connected (real search data flowing)
✅ Automated opportunity discovery cron (90-day rolling window)
✅ Semantic clustering + intent inference
✅ Opportunity scoring (continuous 0–100)
✅ Action classification (CREATE/OPTIMIZE/MONITOR/IGNORE/MANUAL_REVIEW)
✅ Tour entity awareness in opportunity engine
✅ Property entity awareness in opportunity engine
✅ SeoLandingPage entity awareness in opportunity engine
✅ Cannibalization detection (multi-entity)
✅ Research engine (GSC + Keyword Planner + graceful degradation)
✅ Manual review engine (AI-assisted recommendation)
✅ Strategy engine (Gemini 2.5 Flash, component-level actions)
✅ Generation guard (blocks pipeline without Admin decision)
✅ Generation engine (Gemini 2.5 Flash, RETAIN EXISTING directive)
✅ Validation engine (PASS/FIX/FLAG)
✅ Admin SEO Intelligence API routes (7 routes)
✅ Publishing workflow (VALIDATED → Admin approves → PUBLISHED)
✅ Non-destructive database persistence
✅ Historical SEO protection
```

### What's Integrated But Conditional

```
✅ Google Keyword Planner — integrated via Google Ads API; 
   returns AVAILABLE when Google Ads OAuth is connected,
   UNAVAILABLE otherwise
```

### What's Not Available

```
❌ Google Trends — UNAVAILABLE (no unofficial scraping; legitimate API not configured)
❌ Paid Keyword Research Provider — DISABLED BY POLICY
❌ Paid SERP Provider — DISABLED BY POLICY
```

### Resolved in Phase 4

```
✅ TourCategory entity integrated across Opportunity, Research, and Net-New engines
✅ Tour & TourCategory evaluated in Manual Review Engine intent matrix
✅ Tour entity context fetched dynamically at generation time (verified facts)
✅ Destination routing verified (/destinations/[slug] serves type=DESTINATION)
✅ Baseline gscInitialMetrics captured at publication time & protected against overwrite
✅ Types expanded to include TOUR_CATEGORY; core products protected against admin overwrite
```

### Resolved in Phase 5

```
✅ Post-publication Feedback Analysis Engine (feedback-engine.ts)
✅ Deterministic 6-tier Signal Precedence Waterfall (no overlapping ambiguous signals)
✅ False decline protection (expanding keyword footprint recognized as growth)
✅ Striking distance conforms strictly to existing opportunity-engine decision tree
✅ Compound deduplication identity (canonicalTopic + existingPageUrl)
✅ Daily cron & admin manual discovery integration
✅ Admin UI feedback badges & baseline vs current comparison card
✅ Baseline gscInitialMetrics remains strictly immutable
```

---

## SEO Phase Status

| Phase | Status |
|-------|--------|
| Phase 0: Foundation (hardcoded SEO) | ✅ SUPERSEDED |
| Phase 1: Real GSC Connection | ✅ COMPLETE |
| Phase 2: Opportunity Engine + Scoring | ✅ COMPLETE |
| Phase 3: Research + Strategy + Generation + Tour Awareness | ✅ COMPLETE |
| Phase 4: TourCategory + Entity Completeness | ✅ COMPLETE |
| Phase 5: Optimization Feedback Enhancement | ✅ COMPLETE |

**Current SEO Status:** Phase 5 complete. Closed-loop SEO flywheel operational.  
**Active Pipeline:** DISCOVER → RESEARCH → STRATEGY → ADMIN DECISION → GENERATE → VALIDATE → PUBLISH → FEEDBACK ANALYSIS → RE-OPTIMIZATION.

---

## Active Automation

| Job | Frequency | Purpose |
|-----|-----------|---------|
| `discover-seo-opportunities` | Scheduled (Vercel Cron) | GSC data → opportunity discovery → DB |
| `generate-seo` | Admin-triggered only | Research → Strategy → Generate → Validate → VALIDATED |

**NEVER automatic:**
- Publishing
- Deletion
- Redirects
- Canonical changes

---

## Production Safety Status

| Feature | Status |
|---------|--------|
| PITR (Point-in-Time Recovery) | ✅ ENABLED |
| Non-destructive update strategy | ✅ ENFORCED |
| Admin authentication (CRM JWT) | ✅ ENFORCED |
| Cron authentication (CRON_SECRET) | ✅ ENFORCED |
| Server-side generation guard | ✅ ENFORCED |
| API keys server-side only | ✅ ENFORCED |

---

## Full SEO Documentation

→ [`.planning/seo/README.md`](./seo/README.md)
