# SEO Intelligence — Implementation Roadmap

> **Authority:** This roadmap is derived from the existing documentation (`WanderKashmir_SEO_Intelligence_Documentation.md`) and verified repository state.  
> **Rule:** Phases are implementation milestones. The conceptual workflow is documented separately in [WORKFLOW.md](./WORKFLOW.md). Do NOT conflate workflow steps with phase numbers.

---

## Phase 0: Foundation & Hardcoded SEO

**Status:** ✅ COMPLETED (historical)

**What was built:**
- Basic Next.js SEO page structure.
- Hardcoded topics and placeholders.
- No GSC integration.
- No evidence-based discovery.

**Why it was replaced:**
> "Previously, SEO was a guessing game. Topics were hardcoded or generated without evidence, leading to 'zero opportunities' or wasted effort on topics nobody searches for."

---

## Phase 1: Real GSC Connection

**Status:** ✅ COMPLETED

**What was built:**
- GSC OAuth flow (Google Search Console API).
- Encrypted refresh token storage in `SystemConfig`.
- `getGscClient()` and `getGscAnalytics()` functions.
- Real search data flowing into the system.

**Key deliverable:** System now uses real GSC data instead of hardcoded topics.

---

## Phase 2: Opportunity Engine + Scoring

**Status:** ✅ COMPLETED

**What was built:**
- `src/lib/seo/opportunity-engine.ts` — full implementation.
- Semantic clustering.
- Intent inference.
- Business relevance scoring.
- Existing page detection (Property + SeoLandingPage initially).
- Cannibalization detection.
- Continuous 0–100 opportunity scoring.
- Action classification (CREATE/OPTIMIZE/MONITOR/IGNORE/MANUAL_REVIEW).
- Non-destructive upsert DB persistence.
- `discover-seo-opportunities` cron route.
- `SeoOpportunity` database model.

**Key deliverable:** Automated, evidence-based SEO opportunity discovery.

---

## Phase 3: Research, Strategy, Generation + Tour Entity Awareness

**Status:** ✅ COMPLETED (verified against repository code)

**What was built:**
- `src/lib/seo/research-engine.ts` — full implementation.
- `src/lib/seo/strategy-engine.ts` — Gemini 2.5 Flash powered.
- `src/lib/seo/generation-engine.ts` — with generation guard.
- `src/lib/seo/validation-engine.ts`.
- `src/lib/seo/manual-review-engine.ts`.
- `src/lib/seo/net-new-engine.ts`.
- Tour entity detection added to opportunity engine.
- Admin SEO Intelligence API routes (7 routes).
- Google Ads API client (`src/lib/google-ads/client.ts`).
- Google Keyword Planner integration (via Google Ads API).
- `generate-seo` cron route.
- `[RETAIN EXISTING]` directive.
- Server-side generation guard.
- Admin decisions (`USE_EXISTING_PRIMARY`, `CONSOLIDATE`, `CREATE_NEW`, `IGNORE`).

**Google Ads Account approved:**
- Customer ID: `9633496997`
- Manager ID: `6548000449`
- Google Ads API Basic Access approved.

**Key deliverable:** Complete Research → Strategy → Generate → Validate → Publish pipeline with Admin governance.

---

## Current Phase Verification

> ✅ **Phase 3 is confirmed complete** based on code inspection of:
> - `src/lib/seo/opportunity-engine.ts` (Tour entity detection present)
> - `src/lib/seo/research-engine.ts` (Tour entity in cannibalization candidates)
> - `src/lib/seo/generation-engine.ts` (generation guard implemented)
> - `src/lib/seo/strategy-engine.ts` (Gemini 2.5 Flash, cannibalization enforcement)
> - `src/lib/seo/manual-review-engine.ts` (intent × type matrix)
> - `src/lib/seo/net-new-engine.ts` (seed-based discovery)
> - `src/lib/google-ads/client.ts` (real Google Ads API integration)
> - `src/app/api/admin/seo-intelligence/` (7 admin routes)
> - `prisma/schema.prisma` (SeoOpportunity, SeoLandingPage, SeoWorkflowState)

---

## Phase 4: TourCategory + Entity Completeness

**Status:** ✅ COMPLETED (verified against repository code)

**What was built:**
1. **TourCategory in Opportunity Engine:** Full existing-page detection for category hub pages (`/tours?category=${slug}`) and cannibalization match contribution in `src/lib/seo/opportunity-engine.ts`.
2. **TourCategory in Research Engine:** Added to cannibalization candidate pool and intent filtering in `src/lib/seo/research-engine.ts`.
3. **TourCategory in Net-New Engine:** Discovered category keywords resolved to existing category hubs in `src/lib/seo/net-new-engine.ts`.
4. **Tour & TourCategory in Manual Review Engine:** Full intent × type matrix scoring in `src/lib/seo/manual-review-engine.ts` (`PRIMARY_CANDIDATE` with scores 90–95 for tour package & category queries).
5. **Tour Entity Context in Generation Engine:** Verified `Tour` facts (title, duration, price, inclusions, highlights, itinerary) fetched and injected into prompt in `src/lib/seo/generation-engine.ts`.
6. **Destination Architecture & Routing Verified:** Confirmed `src/app/destinations/[slug]/page.tsx` dynamically renders `SeoLandingPage` (type=DESTINATION). Canonical URLs verified.
7. **Baseline `gscInitialMetrics` Captured:** Snapshot persisted on page create/publish in `/api/admin/seo-pages`, `AdminSeoTab.tsx`, and cron generation routes. Preserved against overwrite on subsequent updates.
8. **Entity Type Contracts Expanded:** `types.ts` updated to include `'TOUR_CATEGORY'` across candidate and recommendation models. Core products/hubs (`Tour`, `TourCategory`, `Property`) protected against destructive overwrites in admin publishing.

---

## Phase 5: Optimization Feedback Loop Enhancement (Future)

**Status:** ✅ COMPLETED (verified against repository code)

**What was built:**
1. **Feedback Analysis Engine:** `src/lib/seo/feedback-engine.ts` matching published pages with real GSC performance.
2. **Deterministic Signal Precedence Waterfall:** 6-tier non-overlapping priority waterfall (`INSUFFICIENT_DATA`, `HIGH_IMPRESSIONS_LOW_CTR`, `PERFORMANCE_DECLINE`, `STRIKING_DISTANCE`, `HEALTHY_GROWTH`, `STABLE`).
3. **Compound Deduplication Identity:** Anchored to `canonicalTopic` + `existingPageUrl`, allowing multiple distinct query intents per page while updating repeated syncs in-place.
4. **False Decline Protection:** Requires concurrent rank drop (≥ 3 positions) AND impression contraction (≥ 25%) before flagging a decline; expanding impression footprint is recognized as growth.
5. **Striking Distance Conformance:** Strictly adheres to existing `opportunity-engine.ts` decision tree thresholds rather than blindly optimizing.
6. **Immutable Baseline Protection:** `gscInitialMetrics` remains immutable; comparative metrics and deltas stored in `gscSignals` on `SeoOpportunity`.
7. **Cron & Admin Manual Integration:** Chained in daily discovery cron (`/api/cron/discover-seo-opportunities`) and admin manual discovery (`/api/admin/seo-intelligence/opportunities`).
8. **Admin UI Performance Card:** Feedback badges and baseline vs. current comparison metrics card in `AdminSeoTab.tsx`.

---

## Phase Naming Rule

| Label | Meaning |
|-------|---------|
| ✅ COMPLETED | Verified in repository code |
| 🔄 IN PROGRESS | Actively being built |
| 🔲 NOT STARTED | Approved but not yet built |
| 💡 CONCEPTUAL | Discussed but not yet approved |

---

## Important: What Is NOT a Phase

The following are **workflow steps**, not phases:
- Strategy → Manual Review → Admin Decision → Generate → Validate → Publish

These steps were part of the conceptual architecture from the beginning. They were **implemented** as part of Phase 2–3, but they are not themselves phases.

**See [WORKFLOW.md](./WORKFLOW.md)** for the complete workflow documentation.
