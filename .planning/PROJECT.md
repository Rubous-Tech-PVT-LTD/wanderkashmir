# WanderKashmir — Project Overview

> **GSD Planning Index**  
> Last Updated: 2026-09-10

---

## Project

WanderKashmir is a Kashmir tourism platform built on Next.js 16 with a full booking engine, vendor management system (CRM), and an AI-powered SEO Intelligence system.

**Production URL:** https://www.wanderkashmir.com  
**Stack:** Next.js 16, PostgreSQL (Prisma 5.22), Vercel, Upstash Redis, Gemini AI, Google Search Console, Google Ads API

---

## Major Systems

| System | Status |
|--------|--------|
| Public Website (Tours, Stays, Experiences) | ✅ ACTIVE |
| Booking Engine (Razorpay) | ✅ ACTIVE |
| Vendor Management (CRM) | ✅ ACTIVE |
| Admin Panel | ✅ ACTIVE |
| SEO Intelligence System | ✅ ACTIVE (Phase 3 complete) |
| Google Search Console Integration | ✅ ACTIVE |
| Google Keyword Planner Integration | ✅ INTEGRATED |

---

## SEO Intelligence System

For complete SEO documentation, see: [`.planning/seo/README.md`](./seo/README.md)

**Current Status:** Phase 3 complete. Full pipeline operational:
- Real GSC data → Opportunity Discovery → Research → Strategy → Generation → Validation → Admin Approval → Publish

**Current SEO Implementation State:**

| Component | Status |
|-----------|--------|
| GSC OAuth + Real Data | ✅ ACTIVE |
| Opportunity Discovery (Cron) | ✅ ACTIVE |
| Tour / Property / Blog / SeoLandingPage Entity Awareness | ✅ ACTIVE |
| TourCategory Entity Awareness | ⚠️ SCHEMA ONLY — not in SEO engines |
| Research Engine | ✅ ACTIVE |
| Manual Review Engine | ✅ ACTIVE |
| Strategy Engine (Gemini 2.5 Flash) | ✅ ACTIVE |
| Generation Engine + Guard | ✅ ACTIVE |
| Validation Engine | ✅ ACTIVE |
| Google Keyword Planner | ✅ INTEGRATED |
| Google Trends | ❌ UNAVAILABLE |
| Paid Keyword/SERP Providers | ❌ DISABLED |
| Publishing Workflow (Admin-gated) | ✅ ACTIVE |

**Next SEO Phase:** Phase 4 — TourCategory entity integration + entity completeness improvements.  
See [`.planning/seo/ROADMAP.md`](./seo/ROADMAP.md) for full phase detail.

---

## Core Entities

| Entity | Purpose | URL |
|--------|---------|-----|
| Tour | Bookable tour/package | `/tours/{slug}` |
| TourCategory | SEO hub for tour categories | `/tours/[category]` |
| Property | Bookable stay/hotel/resort | `/stays/{id}` |
| SeoLandingPage (type=BLOG) | Blog / informational content | `/blog/{slug}` |
| SeoLandingPage (other types) | SEO content pages | Type-dependent |
| Vehicle / Driver | Taxi/transport | Via vendor system |
| GuideProfile | Tour guide listings | Via vendor system |

---

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema (source of truth) |
| `src/lib/seo/` | SEO Intelligence engine files |
| `src/lib/gsc-client.ts` | Google Search Console client |
| `src/lib/google-ads/client.ts` | Google Keyword Planner client |
| `src/app/api/cron/` | Scheduled jobs |
| `src/app/api/admin/seo-intelligence/` | Admin SEO API routes |
| `src/actions/admin-seo.ts` | Admin SEO server actions |
| `.planning/seo/` | **SEO Intelligence documentation** |
