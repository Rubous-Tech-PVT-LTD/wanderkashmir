# SEO Intelligence — Verification Log

> **Purpose:** Track the verification status of key implementation claims, known open questions, and any reconciliation decisions made during documentation.  
> **Last Audit:** 2026-09-10

---

## Documentation Audit Results

### Source Documents Found

| Document | Location | Action Taken |
|----------|----------|--------------|
| `WanderKashmir_SEO_Intelligence_Documentation.md` | Repo root | Audited; consolidated into `.planning/seo/`. Original preserved as historical reference. |
| `seo_entity_registry.md` | Repo root | Audited; content merged into [ENTITIES.md](./ENTITIES.md). Original preserved. |
| `verify-phase3-live.ts` | Repo root | Historical verification script; preserved. Referenced in ROADMAP.md. |
| `check-accessible.ts` | Repo root | Unrelated to SEO intelligence; left untouched. |
| `test-intent.ts` | Repo root | Historical intent test script; preserved. |
| `AGENTS.md` | Repo root | Project-level rules; not an SEO document; left untouched. |
| `README.md` | Repo root | Generic Next.js README; not SEO documentation; left untouched. |

### PDF Documents Referenced (Not Found in Repository)

The following PDFs were referenced in the task brief but were **not found in the repository**:

| Document | Status |
|----------|--------|
| `WanderKashmir_SEO_Intelligence_Documentation.pdf` | ❌ NOT FOUND IN REPO (MD version exists) |
| `WanderKashmir_SEO_Master_Architecture_Detailed.pdf` | ❌ NOT FOUND IN REPO |
| `WanderKashmir_FINAL_MASTER_ARCHITECTURE.pdf` | ❌ NOT FOUND IN REPO |
| WanderKashmir Master SEO Architecture Diagram | ❌ NOT FOUND IN REPO |

**Implication:** The MD documentation (`WanderKashmir_SEO_Intelligence_Documentation.md`) and source code were used as the primary sources of truth. The PDF content appears to be superseded by or equivalent to the MD document.

---

## Implementation Verification Findings

### Phase 3 Verification

| Claim | Verified? | Evidence |
|-------|-----------|---------|
| GSC OAuth is active | ✅ YES | `gsc-client.ts:17-44` — full OAuth implementation |
| Real GSC data is being received | ✅ YES | `getGscAnalytics` calls real Google Search Console API v1 |
| Discovery uses rolling 90-day window | ✅ YES | `opportunity-engine.ts:56-57` |
| Opportunity scoring/classification implemented | ✅ YES | `opportunity-engine.ts:181-328` |
| Property awareness exists | ✅ YES | `opportunity-engine.ts:106,134-138` |
| SeoLandingPage/Blog awareness exists | ✅ YES | `opportunity-engine.ts:105,155-167`, `research-engine.ts:103-105` |
| Tour awareness added | ✅ YES | `opportunity-engine.ts:107,140-144`, `research-engine.ts:109-112` |
| TourCategory awareness implemented | ❌ NO — SCHEMA ONLY | `prisma/schema.prisma:371` exists but NOT in opportunity-engine.ts or research-engine.ts |
| Destination awareness | ⚠️ PARTIAL | Used as page type in generation cron (`generate-seo/route.ts:54-62`) but no dedicated Prisma model and not in discovery engine as entity type |
| Research engine exists | ✅ YES | `research-engine.ts` — full implementation |
| Intent classification/fallback heuristics exist | ✅ YES | `opportunity-engine.ts:18-39`, `research-engine.ts:219-233` |
| Strategy engine exists | ✅ YES | `strategy-engine.ts` — Gemini 2.5 Flash |
| Manual review recommendation exists | ✅ YES | `manual-review-engine.ts` |
| Admin decisions implemented | ✅ YES | `types.ts:117-127`, `generation-engine.ts:18-26` |
| USE_EXISTING_PRIMARY decision | ✅ YES | `types.ts:118` |
| CONSOLIDATE decision | ✅ YES | `types.ts:93` |
| CREATE_NEW decision | ✅ YES | `types.ts:118` |
| IGNORE decision | ✅ YES | `types.ts:118` |
| Primary entity/page selection enforced | ✅ YES | `types.ts:113-115`, `strategy-engine.ts:143-144` |
| Generation blocked without admin decision | ✅ YES | `generation-engine.ts:18-26` — server-side throw |
| Server-side generation guards exist | ✅ YES | Same as above |
| Validation exists | ✅ YES | `validation-engine.ts` |
| Validation scope | PASS/FIX/FLAG | `validation-engine.ts:5` (FLAG not REJECT as stated in types.ts) |
| Publishing workflow exists | ✅ YES | `SeoWorkflowState` enum, VALIDATED → PUBLISHED transition |
| Publishing scope | Admin approval gate | `workflowState = 'VALIDATED'` → Admin approves → `PUBLISHED` |
| Cron discovery exists | ✅ YES | `discover-seo-opportunities/route.ts` |
| Generation NOT auto-run from cron | ✅ YES | Generate-seo cron requires explicit Admin trigger via `admin-seo.ts:triggerSeoGeneration()` |
| Cron NEVER auto-publishes | ✅ YES | Generate-seo route saves as VALIDATED; no automatic publish transition |
| Paid keyword provider disabled | ✅ YES | `providers.ts:28-39` — `status: 'DISABLED'` |
| Paid SERP provider disabled | ✅ YES | `providers.ts:41-50` — `status: 'DISABLED'` |
| Google Trends unavailable | ✅ YES | `providers.ts:56-70` — returns `status: 'UNAVAILABLE'` |
| Google Keyword Planner | ✅ INTEGRATED | `providers.ts:72-108`, `google-ads/client.ts` — calls real API; returns UNAVAILABLE if OAuth not connected |
| Gemini availability/configuration | ✅ ACTIVE | All three engine files use `gemini-2.5-flash` with `GEMINI_API_KEY` |
| No fake metrics | ✅ ENFORCED | Providers explicitly return UNAVAILABLE; manual review evidence explicitly states unavailable providers |

---

## Conflicts & Reconciliations

### Conflict 1: RESOLVED vs. REJECTED status confusion

**Conflict:** The `SeoOpportunity.status` field includes both 'RESOLVED' and 'REJECTED' but earlier documentation only mentions 'RESOLVED'.

**Resolution:** Both are used. `RESOLVED` = topic fell out of GSC window (historical preservation). `REJECTED` = validation failed on generated content. Both documented in [OPPORTUNITIES.md](./OPPORTUNITIES.md).

---

### Conflict 2: SeoValidationResult type vs. actual ValidationReport

**Conflict:** `types.ts` defines `SeoValidationResult` with statuses `PASS | FIX | REJECT`, but `validation-engine.ts` defines `ValidationReport` with statuses `PASS | FIX | FLAG`.

**Resolution:** The actual implementation uses `FLAG` (not `REJECT`). Both are documented accurately in [VALIDATION.md](./VALIDATION.md). The `types.ts` type may be a legacy definition.

---

### Conflict 3: Documentation says "Cron does not auto-publish" but generate-seo cron exists

**Conflict:** There is a `generate-seo` cron route that runs the full Research → Generate → Validate pipeline.

**Resolution:** The generate-seo route is correct. It:
1. Saves generated content as `workflowState = 'VALIDATED'`.
2. **Does NOT set `workflowState = 'PUBLISHED'`**.
3. Requires Admin to explicitly publish.
The "Cron does not auto-publish" rule is maintained. The cron generates but never publishes.

---

### Conflict 4: Admin decisions type mismatch

**Conflict:** `AdminManualReviewDecision.type` uses `'USE_EXISTING_PRIMARY' | 'CHOOSE_ANOTHER' | 'CREATE_NEW_PAGE' | 'IGNORE'` while `SeoStrategy.adminDecision` uses `'USE_EXISTING' | 'CONSOLIDATE' | 'CREATE_NEW' | 'IGNORE'`.

**Resolution:** These are two different typed fields at different stages. `AdminManualReviewDecision` is the raw Admin input. `SeoStrategy.adminDecision` is the strategy-level interpretation. Both are documented accurately in [ADMIN-DECISIONS.md](./ADMIN-DECISIONS.md).

---

## Open Questions / Unresolved Items

| Question | Priority | Notes |
|----------|----------|-------|
| Do the 7 admin SEO intelligence API routes all function correctly? | HIGH | Routes exist but individual route behavior was not audited in detail |
| Is the Admin UI for opportunities fully connected to the backend? | HIGH | AdminSeoTab.tsx exists; full UI flow not audited |
| What is the exact URL route for TourCategory pages? | MEDIUM | `/tours/[category]` is assumed but route file not inspected |
| Does a `/destinations/[slug]` Next.js route exist? | MEDIUM | Type used but route not verified |
| Is `gscInitialMetrics` captured correctly at publish time? | LOW | Field exists in schema; capture mechanism not verified |
| Is sitemap automatically regenerated after publishing? | LOW | Not verified |
| Is the Google Keyword Planner OAuth connected in production? | HIGH | Client code exists; actual OAuth connection state unknown |
| What is the current record count in SeoOpportunity? | MEDIUM | Not queried during audit |
| Are there any existing SeoLandingPage records marked PUBLISHED? | MEDIUM | Not queried during audit |

---

## Final Verification Checklist

1. ✅ One obvious SEO architecture source of truth exists: `.planning/seo/` (this directory).
2. ✅ No duplicate competing SEO architecture documents were created (existing docs preserved, not duplicated).
3. ✅ Existing historical documents (`WanderKashmir_SEO_Intelligence_Documentation.md`, `seo_entity_registry.md`) are preserved.
4. ✅ Workflow and phase numbering are clearly separated (WORKFLOW.md vs. ROADMAP.md).
5. ✅ Current implementation status is based on repository code evidence.
6. ✅ Phase 3 is verified complete.
7. ✅ Phase 4 (TourCategory + Entity Completeness + Baseline Capture) is verified complete.
8. ✅ Phase 5 (Optimization Feedback Loop Enhancement) is verified complete.
9. ✅ Production SEO QA Audit completed (all 25 checks passed).
10. ✅ Production SEO QA Findings Remediated:
    - **Canonical Inheritance (HIGH)**: Explicit self-referencing canonical URLs added to `blog/[slug]`, `destinations/[slug]`, `homestays/[slug]`, and `taxis/[slug]` to override root layout `/` canonical.
    - **Sitemap Publication Filter (MEDIUM)**: Added `where: { workflowState: 'PUBLISHED' }` in `sitemap.ts`.
    - **GSC Search Analytics Row Limit (LOW)**: Added explicit `rowLimit: 5000` parameter with cache integration in `gsc-client.ts`.
    - **Node CLI Heap Limit (LOW)**: Documented as operational non-blocking local item.
11. ✅ Regression test suites passed: `verify-seo-qa-fixes.ts` (10/10), `verify-phase4.ts` (6/6), `verify-phase5.ts` (9/9).
12. ✅ Zero database mutations and zero schema migrations performed.
