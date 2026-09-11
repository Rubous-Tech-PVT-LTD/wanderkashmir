# SEO Intelligence — Entity Registry

> **Authority:** Verified against `prisma/schema.prisma`, `src/lib/seo/opportunity-engine.ts`, `src/lib/seo/research-engine.ts`, and `seo_entity_registry.md` as of 2026-09-10.  
> **Source:** `seo_entity_registry.md` (repo root) — preserved and extended here.

---

## Core Principle

Before recommending any new SEO page, the SEO Intelligence system **must inspect** existing entities:

- A **Tour** is the primary source of truth for a bookable Kashmir tour/package.
- A **TourCategory** is the SEO hub page for a category of tours.
- A **Property** is the primary page for a bookable stay/hotel/resort.
- A **SeoLandingPage** is legitimate SEO or informational content.
- A **Blog** is a `SeoLandingPage` with `type = 'BLOG'`.

**One search intent should normally have one clear primary page.**  
Do not create pages solely because a keyword exists.

---

## Entity: TOUR

| Field | Value |
|-------|-------|
| Database Model | `Tour` |
| Primary Key | `id` (cuid) |
| Title Field | `title` |
| Slug Field | `slug` (unique) |
| Live Field | `isLive` |
| Public URL | `/tours/{slug}` |
| Category Link | `categoryId` → `TourCategory.id` |
| Purpose | Actual bookable tour / package — single source of truth |
| Bookable | YES |
| SEO Integration | ✅ ACTIVE |

**SEO Engine Awareness:**
- Opportunity Engine: ✅ Queries `Tour` table (`isLive: true`), matches by title/slug.
- Research Engine: ✅ Queries `Tour` table for cannibalization detection.
- Net-New Engine: ✅ Queries `Tour` table before classifying as net-new.
- Manual Review Engine: ✅ `entityType: 'TOUR'` handled in intent × type matrix.

**Important Rules:**
- Do NOT create a new SeoLandingPage for a query if an existing Tour already serves that commercial intent.
- Tour is the **bookable product**. Any SEO content about that tour should link to the Tour page, not compete with it.
- GSC data for Tour pages feeds directly into optimization opportunities.

---

## Entity: TOUR CATEGORY

| Field | Value |
|-------|-------|
| Database Model | `TourCategory` |
| Primary Key | `id` (cuid) |
| Name Field | `name` (unique) |
| Slug Field | `slug` (unique) |
| Description Field | `description` |
| Relations | `tours Tour[]` |
| Public URL | `/tours?category={slug}` |
| Purpose | Classification / SEO hub for a category of tours |
| Bookable | NO (links to individual bookable Tours) |
| SEO Integration | ✅ ACTIVE |

**SEO Engine Awareness:**
- Opportunity Engine: ✅ Queried in `opportunity-engine.ts`, matches category-level queries and calculates cannibalization risk.
- Research Engine: ✅ Included as `entityType: 'TOUR_CATEGORY'` in cannibalization candidate collection and filtering.
- Net-New Engine: ✅ Queried in `net-new-engine.ts`, recognized as existing page preventing duplicate net-new creation.
- Manual Review Engine: ✅ Handled in intent × type evaluation matrix (`PRIMARY_CANDIDATE` for category tour queries).
- Admin Protection: ✅ Protected in `/api/admin/seo-pages` against destructive overwrite when selected as primary.
- Schema Exists: ✅ `TourCategory` model is present in `prisma/schema.prisma` (line 371).

---

## Entity: PROPERTY

| Field | Value |
|-------|-------|
| Database Model | `Property` |
| Primary Key | `id` (cuid) |
| Name Field | `name` |
| Location Field | `location` |
| Slug Field | (none — URL uses `id` directly) |
| Live/Published | `isApproved: true` AND `status: 'APPROVED'` |
| Public URL | `/stays/{id}` |
| Purpose | Actual bookable stay / hotel / resort / homestay |
| Bookable | YES |
| SEO Integration | ✅ ACTIVE |

**SEO Engine Awareness:**
- Opportunity Engine: ✅ Queries `Property` table, matches by name.
- Research Engine: ✅ Maps properties as cannibalization candidates (`entityType: 'PROPERTY'`).
- Net-New Engine: ✅ Checks Properties before net-new classification.
- Manual Review Engine: ✅ PROPERTY/HOMESTAY types scored as `PRIMARY_CANDIDATE` for accommodation intent.
- Generation Engine: ✅ Fetches verified Property data (name, location, pricePerNight, amenities, FAQs).

**Important Rules:**
- If a query is for a specific property (commercial/transactional intent), the Property page IS the primary page.
- Never create a competing SeoLandingPage that targets the exact same property entity.

---

## Entity: SEO LANDING PAGE

| Field | Value |
|-------|-------|
| Database Model | `SeoLandingPage` |
| Primary Key | `id` (cuid) |
| Title Field | `title` |
| Slug Field | `slug` (unique) |
| Type Field | `type` (string — BLOG, DESTINATION, TAXI, HOMESTAY, TOUR, etc.) |
| Live/Published | `workflowState = 'PUBLISHED'` |
| Public URL | Type-dependent (e.g., `/blog/{slug}`, `/stays/{slug}`, `/taxis/{slug}`) |
| Purpose | Legitimate SEO or informational content |
| Bookable | Depends on type |
| SEO Integration | ✅ ACTIVE |

**Workflow States (enum `SeoWorkflowState`):**
- `DRAFT`
- `RESEARCHED`
- `STRATEGISED`
- `GENERATED`
- `VALIDATED` — awaiting Admin approval
- `PUBLISHED` — live
- `REJECTED`

**SEO Engine Awareness:**
- Opportunity Engine: ✅ Queries all SeoLandingPages for existing-page matching.
- Research Engine: ✅ Includes all SeoLandingPages in cannibalization candidates.
- Net-New Engine: ✅ Checks SeoLandingPages before net-new classification.

---

## Entity: BLOG

| Field | Value |
|-------|-------|
| Database Model | `SeoLandingPage` (with `type = 'BLOG'`) |
| Public URL | `/blog/{slug}` |
| Purpose | Informational / editorial travel content |
| Bookable | NO |
| SEO Integration | ✅ ACTIVE |

**Note:** Blogs are not a separate model. They are `SeoLandingPage` records filtered by `type = 'BLOG'`.

**SEO Engine Awareness:**
- Opportunity Engine: ✅ Included via general SeoLandingPage query.
- Research Engine: ✅ Blog pages identified by `type = 'BLOG'`; intent filtered (blogs serve informational queries).
- Manual Review Engine: ✅ BLOG type scored as `PRIMARY_CANDIDATE` for informational intent.

---

## Entity: TAXI / TRANSPORT

| Field | Value |
|-------|-------|
| Database Model | `SeoLandingPage` (with `type = 'TAXI'`) OR `Vehicle`/`VendorProfile` |
| Public URL | `/taxis/{slug}` (where applicable) |
| Purpose | Transportation / cab routes |
| Bookable | Via Vendor Profile system |
| SEO Integration | ✅ ACTIVE (via SeoLandingPage) |

**SEO Engine Awareness:**
- Opportunity Engine: ✅ TAXI intent inferred from `['taxi', 'cab']` tokens → `LOCAL` intent.
- Research Engine: ✅ TAXI type handled in cannibalization filter.
- Manual Review Engine: ✅ TAXI type scored as `PRIMARY_CANDIDATE` for transport intent.
- Net-New Engine: ✅ `inferredType = 'TAXI'` assigned for local/transport intent queries.

---

## Entity: DESTINATION

| Field | Value |
|-------|-------|
| Database Model | `SeoLandingPage` (with `type = 'DESTINATION'`) |
| Dedicated Prisma Model | ❌ NOT REQUIRED (served via `SeoLandingPage`) |
| Public URL | `/destinations/{slug}` |
| Purpose | Destination overview / travel guide |
| Bookable | NO (links to matching bookable stays & tours) |
| SEO Integration | ✅ ACTIVE |

**Notes:**
- DESTINATION is a first-class page type in the SEO Intelligence pipeline.
- Served in production by `src/app/destinations/[slug]/page.tsx` with dynamic structured data (`TouristDestination`, `FAQPage`), property matching, and ISR caching.
- Handled across discovery, research, strategy, generation, and validation engines.

---

## Future Entity Template

When a new SEO-relevant entity is added, document it here AND integrate it with the SEO Intelligence system:

```
## Entity: [NAME]

| Field | Value |
|-------|-------|
| Database Model | |
| Primary Key | |
| Title/Name Field | |
| Slug Field | |
| Live/Published Field | |
| Public URL | |
| Purpose | |
| Bookable | YES / NO |
| SEO Integration | PENDING / ACTIVE |
| Date Added | |

SEO Integration Checklist:
- [ ] Entity discovery in opportunity-engine.ts
- [ ] Intent classification
- [ ] Existing-page detection
- [ ] Cannibalization protection
- [ ] Exact entity ID preservation
- [ ] Public URL mapping
- [ ] research-engine.ts cannibalization candidates
- [ ] net-new-engine.ts entity check
- [ ] manual-review-engine.ts intent × type matrix
```
