# SEO Intelligence — Data Providers

> **Authority:** Verified against `src/lib/seo/research/providers.ts` and `src/lib/google-ads/client.ts` as of 2026-09-10.

---

## Provider Summary

| Provider | Status | Source File | Notes |
|---------|--------|-------------|-------|
| Google Search Console | ✅ ACTIVE | `src/lib/gsc-client.ts` | Primary data source, OAuth |
| Google Keyword Planner | ✅ INTEGRATED | `src/lib/google-ads/client.ts` | Requires Google Ads OAuth |
| Gemini AI (Strategy) | ✅ ACTIVE | `src/lib/seo/strategy-engine.ts` | Gemini 2.5 Flash |
| Gemini AI (Generation) | ✅ ACTIVE | `src/lib/seo/generation-engine.ts` | Gemini 2.5 Flash |
| Gemini AI (Validation) | ✅ ACTIVE | `src/lib/seo/validation-engine.ts` | Gemini 2.5 Flash |
| Google Trends | ❌ UNAVAILABLE | `src/lib/seo/research/providers.ts` | Returns UNAVAILABLE |
| Keyword Research Provider | ❌ DISABLED | `src/lib/seo/research/providers.ts` | "Paid Provider Disabled by Policy" |
| SERP Research Provider | ❌ DISABLED | `src/lib/seo/research/providers.ts` | "Paid Provider Disabled by Policy" |

---

## Google Search Console (GSC)

**Status:** ✅ ACTIVE  
**Type:** Real Google API, OAuth 2.0  
**Data:** Real clicks, impressions, CTR, position, query, page  
**Window:** 90-day rolling  
**Authentication:** Refresh token stored encrypted in `SystemConfig`

See [GSC.md](./GSC.md) for full detail.

---

## Google Keyword Planner (GKP)

**Status:** ✅ INTEGRATED (requires Google Ads OAuth connection to be active)  
**File:** `src/lib/google-ads/client.ts` + `src/lib/seo/research/providers.ts`  
**API:** Google Ads API v25 `KeywordPlanIdeaService`

**Implementation class:**
```typescript
class GoogleAdsKeywordPlannerProvider implements KeywordPlannerProvider {
  async getPlannerData(target: string): Promise<KeywordPlannerData>
}
```

**How it works:**
1. Reads encrypted Google Ads refresh token from `SystemConfig { key: "GOOGLE_ADS_REFRESH_TOKEN" }`.
2. Decrypts and exchanges for an access token via OAuth2.
3. Calls `POST https://googleads.googleapis.com/v25/customers/{customerId}:generateKeywordIdeas`.
4. Returns: search volume, competition, related keywords.
5. Results cached in Redis for 24 hours (if Redis is configured).

**Google Ads Account Details:**
- Customer ID: `9633496997`
- Manager/Login Customer ID: `6548000449`
- Geo Target: India (`geoTargetConstants/2356`)
- Language: English (`languageConstants/1000`)
- Max results: 100 per call

**Fallback behavior:** If OAuth fails or API errors, returns `status: 'UNAVAILABLE'`. The pipeline continues without planner data.

**Required env variables:**
```
GOOGLE_ADS_CLIENT_ID
GOOGLE_ADS_CLIENT_SECRET
GOOGLE_ADS_DEVELOPER_TOKEN
GOOGLE_ADS_CUSTOMER_ID      # Default: 9633496997
GOOGLE_ADS_LOGIN_CUSTOMER_ID # Default: 6548000449
```

---

## Google Trends

**Status:** ❌ UNAVAILABLE  
**File:** `src/lib/seo/research/providers.ts`  
**Implementation class:** `DefaultGoogleTrendsProvider`

```typescript
class DefaultGoogleTrendsProvider implements GoogleTrendsProvider {
  async getTrends(target: string): Promise<GoogleTrendsData> {
    return {
      status: 'UNAVAILABLE',
      source: 'Google Trends unavailable',
      trendSignal: 'UNAVAILABLE'
    };
  }
}
```

**Why unavailable:**
- No unofficial scraping is used (would violate Google's terms).
- Legitimate Google Trends API access is not currently configured.

**Graceful handling:**
- Returns `UNAVAILABLE` status.
- Pipeline continues without trend data.
- Manual review evidence output explicitly states: `"Google Trends: UNAVAILABLE"`.

**Future work:** Legitimate Google Trends API integration (when available/approved).

---

## Keyword Research Provider (Paid)

**Status:** ❌ DISABLED BY POLICY  
**File:** `src/lib/seo/research/providers.ts`  
**Implementation class:** `DefaultKeywordProvider`

```typescript
class DefaultKeywordProvider implements KeywordResearchProvider {
  async getKeywordMetrics(topic: string): Promise<KeywordResearchData> {
    return {
      status: 'DISABLED',
      source: 'Paid Provider Disabled by Policy',
      searchVolume: 'N/A',
      difficulty: 'N/A',
      intent: 'N/A',
      relatedKeywords: []
    };
  }
}
```

**Why disabled:**
- No paid keyword research provider (e.g., Ahrefs, SEMrush, Moz API) is currently contracted.
- Disabled by explicit policy to prevent runaway costs.

**Effect:** Keyword difficulty and paid search volume data are not available. The system uses GSC data and GKP instead.

---

## SERP Research Provider (Paid)

**Status:** ❌ DISABLED BY POLICY  
**File:** `src/lib/seo/research/providers.ts`  
**Implementation class:** `DefaultSerpProvider`

```typescript
class DefaultSerpProvider implements SerpResearchProvider {
  async getSerpResults(topic: string): Promise<SerpResearchData> {
    return {
      status: 'DISABLED',
      source: 'Paid Provider Disabled by Policy',
      results: [],
      commonTopics: []
    };
  }
}
```

**Why disabled:**
- No paid SERP API (e.g., SerpAPI, ValueSERP, Brightdata) is currently contracted.
- Disabled by explicit policy.

**Effect:** Competitor SERP analysis is not available. Strategy engine adapts by relying on GSC data.

---

## Gemini AI (Google DeepMind)

**Status:** ✅ ACTIVE  
**Model:** `gemini-2.5-flash` (verified in all three engine files)  
**API Key:** `GEMINI_API_KEY` (server-side only, never exposed to client)  
**Library:** `@google/generative-ai` v0.24.1

**Usage:**
| Engine | Purpose |
|--------|---------|
| Strategy Engine | Formulates component-level action plan from research data |
| Generation Engine | Drafts content based exclusively on strategy blueprint |
| Validation Engine | Audits generated content against strategy and safety rules |

**Gemini does NOT:**
- Independently decide what content should be generated.
- Override GSC historical success data.
- Fabricate metrics or facts.
- Bypass the generation guard.

---

## Provider Caching

| Provider | Cache Location | TTL |
|---------|---------------|-----|
| GSC | In-memory (`gscCache`) | 1 hour |
| Keyword Planner | Redis (Upstash) | 24 hours |
| Keyword Planner (fallback) | In-memory (`researchCache`) | Session |
| Google Trends | In-memory (`researchCache`) | Session |

---

## Adding a New Provider

To add a legitimate new provider in the future:

1. Implement the relevant interface in `src/lib/seo/research/providers.ts`.
2. Add provider status to [CURRENT-STATE.md](./CURRENT-STATE.md).
3. Update `runSeoResearch` in `research-engine.ts` to call it.
4. Add environment variable documentation.
5. Test with `status: 'UNAVAILABLE'` fallback before enabling.
6. Never enable a provider that could fabricate metrics.
7. Update this document with the new provider status.
