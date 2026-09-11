# WanderKashmir SEO Intelligence — Planning Documentation

> **Status:** ACTIVE PRODUCTION SYSTEM  
> **Last Reconciled:** 2026-09-10  
> **Authority:** This directory is the single source of truth for SEO architecture, workflow, implementation state, and roadmap.

---

## Document Map

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Complete SEO system architecture, components, and data flow |
| [WORKFLOW.md](./WORKFLOW.md) | End-to-end SEO Intelligence operating model (DISCOVER → PUBLISH) |
| [ENTITIES.md](./ENTITIES.md) | All SEO-relevant entity types, their DB models, URLs, and integration status |
| [DISCOVERY.md](./DISCOVERY.md) | GSC-based opportunity discovery, clustering, scoring, and classification |
| [RESEARCH.md](./RESEARCH.md) | Research engine: providers, data gathering, graceful degradation |
| [OPPORTUNITIES.md](./OPPORTUNITIES.md) | Opportunity types, scoring formula, action decision tree |
| [CANNIBALIZATION.md](./CANNIBALIZATION.md) | Cannibalization detection, MANUAL_REVIEW trigger, rules |
| [MANUAL-REVIEW.md](./MANUAL-REVIEW.md) | Manual review engine, AI recommendation, confidence scoring |
| [ADMIN-DECISIONS.md](./ADMIN-DECISIONS.md) | Admin decision types and their effects on the pipeline |
| [STRATEGY.md](./STRATEGY.md) | Strategy engine: Gemini-powered strategy generation, protection rules |
| [GENERATION.md](./GENERATION.md) | Content generation engine, generation guards, RETAIN EXISTING directive |
| [VALIDATION.md](./VALIDATION.md) | Validation engine: checks, pass/fix/flag outcomes |
| [PUBLISHING.md](./PUBLISHING.md) | Publishing workflow, workflowState transitions, Admin approval gate |
| [INTERNAL-LINKING.md](./INTERNAL-LINKING.md) | Internal linking guidance and indexing readiness |
| [GSC.md](./GSC.md) | Google Search Console integration: OAuth, data fetch, 90-day window |
| [PROVIDERS.md](./PROVIDERS.md) | All data provider statuses (active, unavailable, disabled) |
| [SAFETY-RULES.md](./SAFETY-RULES.md) | Non-negotiable safety rules: DB, content, automation |
| [CURRENT-STATE.md](./CURRENT-STATE.md) | Repository-verified current implementation state |
| [ROADMAP.md](./ROADMAP.md) | Phase history, current phase, next implementation phase |
| [VERIFICATION.md](./VERIFICATION.md) | Verification checklist and open questions |

---

## Critical Distinction: Workflow vs. Phase

> **WORKFLOW** = The conceptual SEO Intelligence operating model (DISCOVER → PUBLISH → FEEDBACK).  
> **PHASE** = An implementation milestone marking what has been built.

The workflow existed conceptually before all phases were implemented. Phases are milestones, not workflow stages.

---

## Quick Reference: Current State

| Area | Status |
|------|--------|
| GSC OAuth | ✅ ACTIVE |
| GSC Data Ingestion (90-day rolling) | ✅ ACTIVE |
| Opportunity Discovery (Cron) | ✅ ACTIVE |
| Opportunity Scoring & Classification | ✅ ACTIVE |
| Tour Entity Awareness | ✅ VERIFIED IN CODE |
| Property Entity Awareness | ✅ VERIFIED IN CODE |
| SeoLandingPage Entity Awareness | ✅ VERIFIED IN CODE |
| Blog Entity Awareness | ✅ VERIFIED IN CODE (type=BLOG on SeoLandingPage) |
| TourCategory Entity Awareness | ⚠️ SCHEMA EXISTS, NOT IN OPPORTUNITY ENGINE |
| Destination Entity Awareness | ⚠️ TYPE USED IN GENERATION, NOT SCHEMA MODEL |
| Research Engine | ✅ ACTIVE |
| Manual Review Engine | ✅ ACTIVE |
| Strategy Engine (Gemini 2.5 Flash) | ✅ ACTIVE |
| Generation Engine (Gemini 2.5 Flash) | ✅ ACTIVE |
| Generation Guard (blocks without Admin decision) | ✅ VERIFIED IN CODE |
| Validation Engine | ✅ ACTIVE |
| Google Keyword Planner (GKP) | ✅ INTEGRATED (via Google Ads API, requires OAuth) |
| Google Trends | ❌ UNAVAILABLE (returns UNAVAILABLE) |
| Paid Keyword Provider | ❌ DISABLED BY POLICY |
| Paid SERP Provider | ❌ DISABLED BY POLICY |
| Publishing Workflow | ✅ ACTIVE (Admin approval gate enforced) |
| Cron: discover-seo-opportunities | ✅ ACTIVE |
| Cron: generate-seo | ✅ EXISTS (Manual trigger only via Admin action) |
| Automatic Publishing from Cron | ❌ NOT ALLOWED — Admin approval required |

---

## Source Documents

The following source documents were audited during reconciliation of this documentation:

| Document | Location | Status |
|----------|----------|--------|
| WanderKashmir_SEO_Intelligence_Documentation.md | Repo root | **Authoritative — superseded by this planning dir** |
| seo_entity_registry.md | Repo root | **Authoritative — referenced by ENTITIES.md** |
| verify-phase3-live.ts | Repo root | Historical verification script |
| `src/lib/seo/*.ts` | Source code | **Ground truth for all implementation claims** |
| `prisma/schema.prisma` | Prisma | **Ground truth for DB models** |
| `src/app/api/cron/` | Source code | **Ground truth for automation** |
| `src/app/api/admin/seo-intelligence/` | Source code | **Ground truth for admin API** |
