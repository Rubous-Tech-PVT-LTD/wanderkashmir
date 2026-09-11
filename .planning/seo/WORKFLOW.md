# SEO Intelligence — End-to-End Workflow

> **IMPORTANT DISTINCTION**  
> This document describes the **WORKFLOW** — the conceptual SEO Intelligence operating model.  
> Phases are implementation milestones. See [ROADMAP.md](./ROADMAP.md) for phase history and status.  
> The workflow existed as an approved architecture before all phases were built.

---

## The Complete SEO Intelligence Workflow

```
REAL GSC DATA
    ↓
DISCOVER
    ↓
UNDERSTAND / CLUSTER / INTENT
    ↓
OPPORTUNITY
    ↓
RESEARCH
    ↓
STRATEGY
    ↓
MANUAL REVIEW          ← (Only when cannibalization detected)
    ↓
ADMIN DECISION         ← (Required before generation can proceed)
    ↓
GENERATE
    ↓
VALIDATE
    ↓
PUBLISH
    ↓
INTERNAL LINKING / INDEXING
    ↓
GSC PERFORMANCE
    ↓
FEEDBACK INTO SEO INTELLIGENCE (next 90-day window)
```

---

## Step-by-Step Workflow Detail

### Step 1: DISCOVER
**Who:** Automated cron job (`/api/cron/discover-seo-opportunities`)  
**How:**
1. Calls GSC API with a rolling 90-day date window.
2. Fetches the top **500 queries** site-wide (by impressions).
3. Groups queries into semantic clusters by location + intent entity tokens.
4. Each cluster represents one potential opportunity topic.

**Output:** Clustered queries with aggregate GSC signals (clicks, impressions, CTR, avg. position).

---

### Step 2: UNDERSTAND / CLUSTER / INTENT

**Who:** Opportunity Engine (`src/lib/seo/opportunity-engine.ts`)  
**How:**
1. For each cluster, extracts **entities**: location tokens (Gulmarg, Pahalgam, etc.) and intent tokens (hotel, taxi, tour, etc.).
2. Infers **search intent**: TRANSACTIONAL → LOCAL → INFORMATIONAL → COMMERCIAL → UNKNOWN.
3. Assigns **business relevance**: HIGH / MEDIUM / LOW.
4. Identifies the **primary query** (highest impressions in cluster).

---

### Step 3: OPPORTUNITY

**Who:** Opportunity Engine  
**How:**
1. Checks existing pages:
   - Queries `Tour` table (live tours only) by title/slug match.
   - Queries `Property` table by name match.
   - Queries `SeoLandingPage` table by slug/title match.
   - Uses GSC-reported ranking pages as ground truth when available.
2. Detects cannibalization (multiple pages matching the same cluster).
3. Computes a **continuous 0–100 opportunity score**.
4. Classifies action: `CREATE` / `OPTIMIZE` / `MONITOR` / `IGNORE` / `MANUAL_REVIEW`.
5. Saves to `SeoOpportunity` table (upsert by canonicalTopic — non-destructive).

**Output:** Prioritized list of opportunities with scores and action classifications.

---

### Step 4: RESEARCH

**Who:** Admin initiates. Research Engine (`src/lib/seo/research-engine.ts`) executes.  
**How:**
1. Fetches **GSC page-level analytics** for the specific page/topic.
2. Calls all configured research providers (with graceful degradation for unavailable ones).
3. Performs **cannibalization analysis** against all entities (Tours, Properties, SeoLandingPages, TourCategories where applicable).
4. Infers **search intent** (provider data → heuristic fallback).
5. Computes **performance delta** vs. historical baseline.
6. Generates **Manual Review Recommendation** if competing pages are found.

**Output:** `SeoResearch` object with all gathered signals.

---

### Step 5: STRATEGY

**Who:** Strategy Engine (`src/lib/seo/strategy-engine.ts`) — automatic after research.  
**How:**
1. Sends research data to Gemini 2.5 Flash.
2. Gemini produces a **component-level action plan**.
3. Each page component (title, meta description, H1, sections, FAQs, internal links) gets one of: `PROTECT` / `OPTIMIZE` / `EXPAND` / `ADD` / `REMOVE`.
4. Programmatic enforcement: if cannibalization is HIGH, `recommendedAction` is forced to `MANUAL_REVIEW` regardless of Gemini output.
5. Historical GSC performance **ALWAYS** overrides external AI keyword suggestions.

**Output:** `SeoStrategy` object with per-component action plan.

---

### Step 6: MANUAL REVIEW (conditional)

**When triggered:** `cannibalizationRisk.status === 'HIGH_RISK'` OR `strategy.manualReviewRequired === true`

**Who:** Manual Review Engine (`src/lib/seo/manual-review-engine.ts`) + Admin decision.  
**How:**
1. Manual Review Engine evaluates all competing pages using an **Intent × Entity Type matrix**.
2. Scores each candidate (0–100) and assigns roles: `PRIMARY_CANDIDATE` / `SUPPORTING_INFORMATIONAL` / `SUPPORTING_TRANSPORT` / `SUPPORTING_COMMERCIAL` / `POTENTIAL_DUPLICATE`.
3. Produces a recommendation with `HIGH` / `MEDIUM` / `LOW` confidence.
4. Presents a plain-language summary to the Admin.
5. **Admin must make an explicit decision.** Without it, the pipeline is blocked.

**See [MANUAL-REVIEW.md](./MANUAL-REVIEW.md) and [ADMIN-DECISIONS.md](./ADMIN-DECISIONS.md) for detail.**

---

### Step 7: ADMIN DECISION

**Who:** Human Admin (required).  
**Decision types:**
- `USE_EXISTING_PRIMARY` — designate an existing page as the primary for this intent.
- `CONSOLIDATE` — plan to consolidate competing pages (Admin executes manually, no auto-action).
- `CREATE_NEW` — Admin confirms a genuine net-new page is warranted.
- `IGNORE` — no action required.

**Effect:** Sets `strategy.adminDecision`, which unblocks the generation guard.

**See [ADMIN-DECISIONS.md](./ADMIN-DECISIONS.md) for full detail.**

---

### Step 8: GENERATE

**Who:** Generation Engine (`src/lib/seo/generation-engine.ts`)  
**Prerequisites:** `strategy.adminDecision` must be set if `manualReviewRequired`.  
**How:**
1. **Server-side guard** throws immediately if: `(HIGH_RISK || manualReviewRequired) && !adminDecision`.
2. Fetches verified entity context from the database (e.g., real property amenities, FAQs, price).
3. Sends strategy + research + existing content + verified facts to Gemini 2.5 Flash.
4. PROTECT components → AI outputs `[RETAIN EXISTING]` → stitched back to original values.
5. Never fabricates: prices, distances, phone numbers, hotel names, availability, amenities.

**Output:** Generated content object: `{ title, h1Heading, description, content, faqs }`.

---

### Step 9: VALIDATE

**Who:** Validation Engine (`src/lib/seo/validation-engine.ts`)  
**How:** Sends strategy + generated content to Gemini 2.5 Flash for audit.  
**Checks:**
1. Did it follow the recommended sections?
2. Did it protect the existing high-performing queries?
3. Evidence of keyword stuffing?
4. Any obviously fake facts?
5. Does content fulfill the search intent?

**Result:**
- `PASS` → content cleared for Admin Preview.
- `FIX` → content cannot be published; must be corrected or manually reviewed.
- `FLAG` → major violation detected; Admin must review before any action.

---

### Step 10: PUBLISH

**Who:** Admin (required — explicit approval).  
**How:**
1. Content saved as `workflowState = VALIDATED`.
2. Admin reviews in preview.
3. Admin clicks Approve → `workflowState = PUBLISHED`.
4. Page becomes publicly accessible.

**Rules:**
- Cron **NEVER** auto-publishes.
- No automatic publishing from any automated script.

---

### Step 11: INTERNAL LINKING / INDEXING

After publication:
- Internal links within content should point to verified existing pages.
- Sitemap should include the new page for indexing readiness.
- See [INTERNAL-LINKING.md](./INTERNAL-LINKING.md).

---

### Step 12: GSC PERFORMANCE → FEEDBACK

- Next 90-day rolling window includes the new/updated page.
- GSC data feeds back into the Opportunity Engine.
- High-performing pages are protected in future strategy cycles.
- CTR deficiency or position regression triggers OPTIMIZE opportunities.

---

## Daily Admin Workflow

1. Open **Admin Panel → SEO → Opportunities**.
2. Review top-scored opportunities.
3. Start with the highest-value, clean opportunity (`OPTIMIZE` or `CREATE`).
4. Avoid `MANUAL_REVIEW` until understanding page ownership and cannibalization context.
5. Click **Research** → review research output.
6. Review **Strategy** output.
7. If `MANUAL_REVIEW`: review AI recommendation, make Admin decision.
8. Click **Generate**.
9. Review **Validation** results (fix if `FIX`/`FLAG`).
10. Preview the changes.
11. **Approve only if correct.**
12. Publish.
13. Later, monitor GSC performance to see the impact.

---

## Automation Rules (Immutable)

| Rule | |
|------|-|
| DISCOVERY | Automatic (cron) |
| GENERATION | Controlled (Admin-triggered only) |
| PUBLISHING | Admin approval (never automatic) |
| DELETION | Never automatic |
| REDIRECTS | Never automatic |
| CANONICAL CHANGES | Never automatic |
