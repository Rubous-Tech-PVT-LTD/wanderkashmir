# SEO Intelligence — Publishing Workflow

> **Authority:** Verified against `prisma/schema.prisma` (SeoWorkflowState enum, SeoLandingPage model) and `src/app/api/cron/generate-seo/route.ts` as of 2026-09-10.

---

## Overview

Publishing is the final step of the SEO Intelligence workflow. It is always **Admin-controlled** and never automatic.

---

## SeoWorkflowState Enum

```prisma
enum SeoWorkflowState {
  DRAFT
  RESEARCHED
  STRATEGISED
  GENERATED
  VALIDATED
  PUBLISHED
  REJECTED
}
```

---

## State Transition Flow

```
DRAFT
  ↓ (Research runs)
RESEARCHED
  ↓ (Strategy generated)
STRATEGISED
  ↓ (Generation runs)
GENERATED
  ↓ (Validation PASS)
VALIDATED ← Admin reviews here
  ↓ (Admin approves)
PUBLISHED ← Page is live
  
  OR
  
VALIDATED → REJECTED (validation FIX/FLAG; cannot publish)
GENERATED → REJECTED (validation failure in cron flow)
```

---

## SeoLandingPage Model (Publishing-Relevant Fields)

```prisma
model SeoLandingPage {
  id                String           @id @default(cuid())
  slug              String           @unique
  type              String           // BLOG, DESTINATION, TAXI, HOMESTAY, TOUR, etc.
  title             String
  description       String?
  h1Heading         String
  content           String?
  faqs              Json?
  imageUrl          String?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  gscInitialMetrics Json?            // Baseline GSC metrics captured at creation
  seoResearch       Json?            // Full research data stored on page
  seoStrategy       Json?            // Full strategy stored on page
  validationReport  Json?            // Validation result stored on page
  workflowState     SeoWorkflowState @default(PUBLISHED)
}
```

---

## What Triggers VALIDATED State

1. **Via cron generate-seo route**: Page is created with `workflowState = 'VALIDATED'` directly after successful generation + validation.
2. **Via Admin-triggered pipeline**: Research → Strategy → Generate → Validate → `workflowState = 'VALIDATED'`.

The opportunity's `SeoOpportunity.status` is also updated to `'VALIDATED'` when the page passes.

---

## What Triggers PUBLISHED State

Only an **explicit Admin action** transitions `workflowState` from `VALIDATED` to `PUBLISHED`.

Via the Admin panel:
- Admin navigates to the SEO Pages section.
- Admin reviews the validated content.
- Admin clicks Approve / Publish.
- Page becomes accessible to the public.

---

## Publishing Rules

| Rule | |
|------|-|
| Cron NEVER auto-publishes | ✅ Enforced |
| Admin approval ALWAYS required | ✅ Enforced |
| Validation must PASS before publish | ✅ Enforced (VALIDATED state prerequisite) |
| Admin can review research + strategy + validation report | ✅ Stored on page record |
| Existing published pages are NEVER overwritten without Admin review | ✅ Enforced |

---

## Page URL Assignment

The slug is assigned during generation:

```typescript
slug: requestedTopic.toLowerCase().replace(/[^a-z0-9-]/g, '-')
```

The public URL depends on the `type` field. Examples:
- `type = 'BLOG'` → `/blog/{slug}`
- `type = 'DESTINATION'` → `/destinations/{slug}` (route must exist)
- `type = 'TAXI'` → `/taxis/{slug}` (route must exist)
- `type = 'HOMESTAY'` → `/stays/{slug}` (route must exist)

> **Important:** Publishing a page with a `type` that has no active Next.js route will result in a 404. Verify route existence before publishing non-standard types.

---

## Image Assignment at Generation

Currently, the generation cron assigns a placeholder image:

```typescript
imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(topic)}?width=800&height=400&nologo=true`
```

For production publishing, the Admin should verify the image is appropriate or replace it with a real Cloudinary-hosted image.

---

## GSC Initial Metrics

The `gscInitialMetrics` field on `SeoLandingPage` is intended to store baseline GSC metrics captured at the time of publication. This provides a reference point for future performance delta calculations.

**Current status:** Field exists in schema; capture mechanism should be verified in Admin publish flow.

---

## After Publishing

1. The page is included in the sitemap (verify sitemap regeneration).
2. GSC may begin reporting impressions within 1–4 weeks depending on indexing.
3. The 90-day rolling discovery window will pick up performance signals from the new page.
4. Future opportunities may classify the page for `OPTIMIZE` if CTR deficiency is detected.
