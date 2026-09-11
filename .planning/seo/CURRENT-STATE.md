# SEO Intelligence — Current Implementation State

> **Authority:** This document reflects the actual repository state as verified on 2026-09-10.  
> **All claims are backed by code inspection.** See referenced files for evidence.

---

## IMPORTANT: Phase vs. Workflow Distinction

The SEO Intelligence **workflow** (DISCOVER → PUBLISH → FEEDBACK) is the conceptual operating model.  
**Phases** are implementation milestones. See [ROADMAP.md](./ROADMAP.md) for phase history.

The workflow may contain steps that were implemented across multiple phases.

---

## Core Infrastructure

| Component | Status | Evidence |
|-----------|--------|---------|
| Next.js 16 App | ✅ ACTIVE | `package.json` |
| PostgreSQL (Prisma 5.22) | ✅ ACTIVE | `prisma/schema.prisma` |
| Vercel deployment | ✅ ACTIVE | `vercel.json`, `render.yaml` |
| Upstash Redis | ✅ CONFIGURED | `src/lib/google-ads/client.ts` |
| Authentication (NextAuth v5 + CRM JWT) | ✅ ACTIVE | `src/lib/auth.ts`, `src/lib/crmAuth.ts` |
| Resend (email) | ✅ CONFIGURED | `package.json` |
| Cloudinary (images) | ✅ CONFIGURED | `src/lib/cloudinaryLoader.ts` |

---

## SEO System Components — Verified Status

### GSC Integration
| Feature | Status | File |
|---------|--------|------|
| OAuth client setup | ✅ IMPLEMENTED | `src/lib/gsc-client.ts:17` |
| Encrypted refresh token storage | ✅ IMPLEMENTED | `src/lib/gsc-client.ts:22-31` |
| GSC site URL from SystemConfig | ✅ IMPLEMENTED | `src/lib/gsc-client.ts:50-64` |
| getGscAnalytics function | ✅ IMPLEMENTED | `src/lib/gsc-client.ts:77-110` |
| In-memory 1hr cache | ✅ IMPLEMENTED | `src/lib/gsc-client.ts:83-87` |
| 90-day rolling window | ✅ IMPLEMENTED | `opportunity-engine.ts:56-57` |

### Opportunity Discovery
| Feature | Status | File |
|---------|--------|------|
| Discovery cron route | ✅ IMPLEMENTED | `src/app/api/cron/discover-seo-opportunities/route.ts` |
| CRON_SECRET authentication | ✅ IMPLEMENTED | Same file, line 9 |
| Top 500 query ingestion | ✅ IMPLEMENTED | `opportunity-engine.ts:60-79` |
| Semantic clustering | ✅ IMPLEMENTED | `opportunity-engine.ts:82-102` |
| Intent inference | ✅ IMPLEMENTED | `opportunity-engine.ts:18-39` |
| Business relevance scoring | ✅ IMPLEMENTED | `opportunity-engine.ts:41-45` |
| Tour entity detection | ✅ IMPLEMENTED | `opportunity-engine.ts:107,140-144` |
| Property entity detection | ✅ IMPLEMENTED | `opportunity-engine.ts:106,134-138` |
| SeoLandingPage detection | ✅ IMPLEMENTED | `opportunity-engine.ts:105,155-167` |
| GSC URL as existing page | ✅ IMPLEMENTED | `opportunity-engine.ts:124-129,150-161` |
| Cannibalization detection | ✅ IMPLEMENTED | `opportunity-engine.ts:171-178` |
| Continuous 0-100 scoring | ✅ IMPLEMENTED | `opportunity-engine.ts:191-328` |
| Action classification (5 types) | ✅ IMPLEMENTED | `opportunity-engine.ts:248-304` |
| Non-destructive upsert persistence | ✅ IMPLEMENTED | `opportunity-engine.ts:356-486` |
| Stale topic RESOLVED (not deleted) | ✅ IMPLEMENTED | `opportunity-engine.ts:470-485` |

### Entity Awareness
| Entity | Status | File |
|--------|--------|------|
| Tour (isLive) | ✅ ACTIVE | `opportunity-engine.ts:107`, `research-engine.ts:109-112` |
| Property | ✅ ACTIVE | `opportunity-engine.ts:106`, `research-engine.ts:106-108` |
| SeoLandingPage | ✅ ACTIVE | `opportunity-engine.ts:105`, `research-engine.ts:103-105` |
| Blog (type=BLOG on SeoLandingPage) | ✅ ACTIVE | `research-engine.ts:179-181` |
| TourCategory (schema exists) | ⚠️ SCHEMA ONLY | `prisma/schema.prisma:371` — NOT in opportunity or research engines |
| Destination (type used in generation) | ⚠️ PARTIAL | `generate-seo/route.ts:54-62` — no dedicated Prisma model |
| Taxi (type used in generation) | ✅ PARTIAL | Intent inferred, type used in generation cron |

### Research Engine
| Feature | Status | File |
|---------|--------|------|
| GSC page-level analytics | ✅ IMPLEMENTED | `research-engine.ts:43-87` |
| Concurrent provider fetching | ✅ IMPLEMENTED | `research-engine.ts:37` |
| Multi-entity cannibalization check | ✅ IMPLEMENTED | `research-engine.ts:103-217` |
| Intent inference (provider → heuristic) | ✅ IMPLEMENTED | `research-engine.ts:219-233` |
| Performance delta computation | ✅ IMPLEMENTED | `research-engine.ts:75-87` |
| Manual review recommendation trigger | ✅ IMPLEMENTED | `research-engine.ts:240-248` |

### Manual Review Engine
| Feature | Status | File |
|---------|--------|------|
| Intent classification | ✅ IMPLEMENTED | `manual-review-engine.ts:34-46` |
| Intent × entity type scoring matrix | ✅ IMPLEMENTED | `manual-review-engine.ts:58-124` |
| Candidate scoring and ranking | ✅ IMPLEMENTED | `manual-review-engine.ts:146-148` |
| Confidence level (HIGH/MEDIUM/LOW) | ✅ IMPLEMENTED | `manual-review-engine.ts:155-164` |
| Plain language summary | ✅ IMPLEMENTED | `manual-review-engine.ts:166-168` |
| Honest evidence reporting | ✅ IMPLEMENTED | `manual-review-engine.ts:170-181` |

### Strategy Engine
| Feature | Status | File |
|---------|--------|------|
| Gemini 2.5 Flash integration | ✅ IMPLEMENTED | `strategy-engine.ts:14` |
| Component-level action planning | ✅ IMPLEMENTED | `strategy-engine.ts:55-70` |
| Cannibalization enforcement | ✅ IMPLEMENTED | `strategy-engine.ts:84-99` |
| PROTECT directive | ✅ IMPLEMENTED | `strategy-engine.ts:39-41` |
| JSON-only output | ✅ IMPLEMENTED | `strategy-engine.ts:75-76` |

### Generation Engine
| Feature | Status | File |
|---------|--------|------|
| Server-side generation guard | ✅ IMPLEMENTED | `generation-engine.ts:18-26` |
| Verified entity context fetch | ✅ IMPLEMENTED | `generation-engine.ts:31-43` (Property only) |
| [RETAIN EXISTING] directive | ✅ IMPLEMENTED | `generation-engine.ts:117-128` |
| JSON schema enforcement | ✅ IMPLEMENTED | `generation-engine.ts:88-108` |
| No fabrication rules | ✅ IN PROMPT | `generation-engine.ts:66-68` |

### Validation Engine
| Feature | Status | File |
|---------|--------|------|
| Gemini 2.5 Flash validation | ✅ IMPLEMENTED | `validation-engine.ts:20` |
| PASS/FIX/FLAG result | ✅ IMPLEMENTED | `validation-engine.ts:4-8` |
| Keyword stuffing check | ✅ IN PROMPT | `validation-engine.ts:35` |
| Fake facts check | ✅ IN PROMPT | `validation-engine.ts:37` |
| Strategy compliance check | ✅ IN PROMPT | `validation-engine.ts:33` |

### Net-New Discovery Engine
| Feature | Status | File |
|---------|--------|------|
| Seed-based keyword expansion | ✅ IMPLEMENTED | `net-new-engine.ts:7-13` |
| Entity protection gate | ✅ IMPLEMENTED | `net-new-engine.ts:74-88` |
| Location relevance gate | ✅ IMPLEMENTED | `net-new-engine.ts:92-94` |
| Net-new → MANUAL_REVIEW | ✅ IMPLEMENTED | `net-new-engine.ts:135` |
| Non-destructive DB save | ✅ IMPLEMENTED | `net-new-engine.ts:148-191` |

---

## Provider Statuses

| Provider | Status | Evidence |
|---------|--------|---------|
| GSC | ✅ ACTIVE | `gsc-client.ts` — real API |
| Google Keyword Planner | ✅ INTEGRATED | `google-ads/client.ts` — calls real API when OAuth connected |
| Google Trends | ❌ UNAVAILABLE | `providers.ts:56-70` — returns UNAVAILABLE |
| Paid Keyword Provider | ❌ DISABLED | `providers.ts:28-39` — "Paid Provider Disabled by Policy" |
| Paid SERP Provider | ❌ DISABLED | `providers.ts:41-50` — "Paid Provider Disabled by Policy" |
| Gemini (AI) | ✅ ACTIVE | All three engine files — gemini-2.5-flash |

---

## Admin API Routes

| Route | Status |
|-------|--------|
| `/api/admin/seo-intelligence/opportunities` | ✅ EXISTS |
| `/api/admin/seo-intelligence/research` | ✅ EXISTS |
| `/api/admin/seo-intelligence/strategy` | ✅ EXISTS |
| `/api/admin/seo-intelligence/generate` | ✅ EXISTS |
| `/api/admin/seo-intelligence/validate` | ✅ EXISTS |
| `/api/admin/seo-intelligence/manual-review` | ✅ EXISTS |
| `/api/admin/seo-intelligence/overview` | ✅ EXISTS |

---

## Database Schema State

| Model | Exists | SEO Integration |
|-------|--------|----------------|
| `SeoOpportunity` | ✅ | Core SEO table |
| `SeoLandingPage` | ✅ | Content storage |
| `Tour` | ✅ | Entity detection |
| `TourCategory` | ✅ | Schema only (not in SEO engines) |
| `Property` | ✅ | Entity detection |
| `Vehicle` / `Driver` | ✅ | Not in SEO engines |
| `GuideProfile` | ✅ | Not in SEO engines |

---

## Known Gaps / Items Requiring Next Phase Work

| Gap | Priority | Detail |
|-----|----------|--------|
| TourCategory not in opportunity engine | HIGH | TourCategory pages are SEO hubs; they should be checked for existing-page detection |
| TourCategory not in research engine | HIGH | Should be included in cannibalization candidates |
| Destination not a real Prisma model | MEDIUM | Currently a `type` on SeoLandingPage; consider if a dedicated model is needed |
| Tour entity context not fetched at generation | MEDIUM | Only Properties currently fetched for verified facts; Tours should also be fetched |
| `gscInitialMetrics` capture mechanism | LOW | Field exists on SeoLandingPage but capture timing needs verification |
| Vehicle/Guide SEO integration | LOW | Currently not part of SEO intelligence |
