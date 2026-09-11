# SEO Intelligence — Google Search Console (GSC) Integration

> **Authority:** Verified against `src/lib/gsc-client.ts` and `src/lib/seo/opportunity-engine.ts` as of 2026-09-10.

---

## Overview

GSC is the primary data source for the entire SEO Intelligence system. All opportunity discovery is grounded in real GSC performance data.

**Status:** ✅ ACTIVE (OAuth connected, real data flowing)

---

## OAuth Architecture

**File:** `src/lib/gsc-client.ts`

```
GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
    ↓
OAuth2 flow → Admin connects GSC account
    ↓
Refresh token stored encrypted in: SystemConfig { key: "GSC_REFRESH_TOKEN" }
    ↓
Decrypted at runtime → OAuth2Client → auto-refreshed access token
    ↓
Google Search Console API v1
```

**Key env variables:**
- `GOOGLE_CLIENT_ID` — OAuth app identification
- `GOOGLE_CLIENT_SECRET` — OAuth app secret
- `GOOGLE_REDIRECT_URI` — Callback URL (production: `https://www.wanderkashmir.com/api/auth/google/callback`)

**Important:** The refresh token is **encrypted** before storage in `SystemConfig`. It is decrypted server-side only using `ENCRYPTION_KEY`.

---

## GSC Site URL

The target GSC property URL is stored in `SystemConfig { key: "GSC_SITE_URL" }`.

**Default (auto-created if missing):** `sc-domain:wanderkashmir.com`

The `sc-domain:` prefix is the domain-level GSC property format (covers all subdomains and protocols).

---

## Data Fetch Window

**Rolling 90-day window:**
```typescript
endDate = today (YYYY-MM-DD)
startDate = today − 90 days
```

This window ensures:
- Recent trends are captured.
- Seasonal patterns are visible.
- Historical success is preserved (not too narrow).

---

## GSC Analytics Function

```typescript
getGscAnalytics(siteUrl, startDate, endDate, dimensions)
```

**Dimensions used:**

| Call Context | Dimensions |
|-------------|-----------|
| Discovery (opportunity engine) | `['query', 'page']` |
| Research (existing page) | `['query', 'page']` |
| Research (new topic) | `['query']` |

**Returns:** Array of rows with `{ keys[], clicks, impressions, ctr, position }`

---

## In-Memory Caching

```typescript
const CACHE_TTL = 3600 * 1000; // 1 hour
```

GSC responses are cached in-memory for 1 hour to avoid repeated API calls during the same server session. Cache includes stale fallback — if API fails, the last successful response is returned.

---

## API Rate Limits & Behavior

- The Search Console API is queried with the 90-day window; no pagination is explicitly implemented (relies on the top 500 queries being returned in one call).
- Graceful fallback: errors are caught and empty array `[]` returned if no cached data exists.
- Stale cache is served as fallback if API errors occur.

---

## GSC as Ground Truth for Existing Pages

When GSC reports that a specific URL ranked for a cluster of queries, that URL is treated as the definitive existing page:

```typescript
// GSC-reported ranking page takes priority over DB slug matching
const pagesArray = Array.from(cluster.data.pages) as string[];
topRankingGscUrl = pagesArray[0]; // First ranking page from GSC
```

This means: if GSC says `/tours/kashmir-honeymoon-package` ranked for "kashmir honeymoon tour", that Tour page IS the existing page — even if the slug-matching heuristic might have missed it.

---

## GSC Feeds the Performance Feedback Loop

After pages are published:
1. GSC begins recording performance data for the new/updated page.
2. Within the next 90-day window, the page appears in GSC analytics.
3. Discovery cron picks up the page's queries.
4. If page ranks well with healthy CTR → `MONITOR`.
5. If CTR deficiency → `OPTIMIZE`.
6. If ranking slipped → `OPTIMIZE` or `MONITOR`.

This creates the continuous improvement feedback loop.

---

## GSC Troubleshooting

| Problem | Check |
|---------|-------|
| Opportunities empty | GSC OAuth connection, refresh token validity, API limits, date range, system logs |
| GSC unavailable | OAuth status, refresh token expiry, `GSC_REFRESH_TOKEN` in SystemConfig, Google Cloud project configuration |
| Stale data | In-memory cache TTL (1 hour); server restart or wait clears cache |
| Wrong site URL | `SystemConfig.GSC_SITE_URL` value; verify it matches the actual GSC property |
| Missing queries | GSC may not report queries with very low impressions (<10 is filtered by the engine) |

---

## GSC Does NOT Dictate Website Hierarchy

GSC shows what users search for. It does NOT:
- Define the website's content hierarchy.
- Override the Tour/Property/TourCategory entity structure.
- Justify mass doorway page creation for every keyword.
- Replace human editorial judgment about what pages to create.

GSC data is **evidence**. Business decisions about content strategy remain with the Admin.
