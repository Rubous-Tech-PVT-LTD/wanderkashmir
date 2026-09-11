# SEO Intelligence — Internal Linking

> This document covers the internal linking approach for SEO content and readiness for indexing.

---

## Overview

Internal linking is a post-publication distribution step. After a page is published, internal links help:
1. Spread SEO authority to and from the new page.
2. Make the page discoverable by both users and search engine crawlers.
3. Support the intended topic cluster structure.

---

## Internal Linking in the Generation Engine

The Strategy Engine produces an `internalLinks` component:

```typescript
internalLinks: {
  action: ComponentAction,    // Usually 'ADD' or 'OPTIMIZE'
  reason: string,
  content: string             // Guidelines for internal links to add
}
```

The Generation Engine follows these guidelines when writing the content body.

---

## Internal Linking Rules

### Do

- Link new SEO pages to the most relevant **Tour pages** (`/tours/{slug}`).
- Link new destination/guide pages to relevant **Tour Category** pages.
- Link property review blogs to the **Property page** (`/stays/{id}`).
- Link tour package informational pages to the **actual bookable Tour**.
- Use descriptive anchor text — not generic "click here" or "learn more".

### Do NOT

- Create circular links that add no user value.
- Duplicate anchor text for different destinations.
- Over-link (keyword stuffing via anchor text).
- Link to pages that are in `DRAFT` or `VALIDATED` (not yet published).

---

## Topic Cluster Linking Model

```
Tours Hub (/tours)
    ↕
Tour Category Hub (/tours/[category])
    ↕
Individual Tour Page (/tours/[slug])
    ↕
Supporting Blog / Guide (/blog/[slug])
    ↕
Related Property Page (/stays/[id])
```

Each cluster should have:
- One primary commercial page (Tour or Property) as the authority.
- Supporting informational pages (Blogs, Guides) linking to the commercial page.
- The commercial page acknowledging the supporting content where relevant.

---

## Sitemap / Indexing Readiness

After publishing a new `SeoLandingPage`:

1. **Sitemap**: Verify the sitemap (`/sitemap.xml`) includes the new page. Next.js ISR/static sitemap should pick it up.
2. **Google Search Console**: Use GSC's URL Inspection tool to request indexing for the new page.
3. **Internal links**: At least one existing published page should link to the new page before requesting indexing.
4. **Crawlability**: Verify the page has no `noindex` meta tag or robots.txt exclusion.

---

## Canonical Tags

**Current rule:** No automatic canonical changes.

For canonical tags:
- Each page should have a canonical pointing to itself (standard behavior).
- If consolidating pages, canonical changes must be done **manually by the Admin**.
- Never automatically set canonical to a different page.

---

## Redirect Rules

**Current rule:** No automatic redirects.

If consolidation is needed (e.g., after an Admin `CONSOLIDATE` decision):
- The Admin manually implements the 301 redirect.
- The redirect must be added to Next.js `next.config.ts` or handled at the infrastructure level.
- The source URL's GSC signals and backlinks should be assessed before redirecting.
- The redirect plan must be documented before implementation.

---

## Priority Linking Queue

When publishing multiple new pages, prioritize internal linking in this order:

1. Pages with highest opportunity score (most evidence).
2. Pages that target transactional/commercial intent (directly drives revenue).
3. Pages that are part of an existing successful topic cluster.
4. Pages that receive inbound links from other existing pages naturally.
