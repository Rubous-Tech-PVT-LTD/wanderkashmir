# SEO Intelligence — Strategy Engine

> **Authority:** Verified against `src/lib/seo/strategy-engine.ts` and `src/lib/seo/types.ts` as of 2026-09-10.

---

## Overview

The Strategy Engine converts research data into a precise, component-level action plan that tells the Generation Engine exactly what to do with each part of the page.

**File:** `src/lib/seo/strategy-engine.ts`  
**Model:** Gemini 2.5 Flash  
**Input:** `SeoResearch` object  
**Output:** `SeoStrategy` object

---

## Core Rule: Historical Priority

> **Historical GSC performance ALWAYS has priority over external AI keyword suggestions.**

If GSC data shows a title achieves 10% CTR on Page 1, that title must be PROTECTED — even if Gemini or any keyword tool suggests a "better" title. The existing success is evidence; AI suggestions are hypotheses.

---

## Strategy Generation Process

1. Research data is bundled into a structured prompt.
2. Prompt includes real GSC data, keyword planner data, trends data, competing pages, and cannibalization status.
3. Gemini 2.5 Flash generates a JSON strategy.
4. **Programmatic enforcement layer** validates and corrects the output:
   - If `isHighCannibalization`: forces `recommendedAction = 'MANUAL_REVIEW'` and `manualReviewRequired = true`.
   - Sanitizes any rogue "New page" phrases in reasons when competing pages exist.
   - Adds `competingPagesAnalysis` if missing.

---

## Component Actions

Each page component receives one of five actions:

| Action | Meaning |
|--------|---------|
| `PROTECT` | Do NOT modify. The existing content is performing well. |
| `OPTIMIZE` | Minor targeted changes allowed. |
| `EXPAND` | Add more content to an existing section. |
| `ADD` | Create an entirely new section/component that doesn't exist yet. |
| `REMOVE` | Remove a section (rare, Admin should confirm). |

---

## Strategy Output (`SeoStrategy`)

```typescript
{
  primaryTopic: string,
  queriesToProtect: string[],       // Queries currently performing well — protect SEO
  queriesToImprove: string[],       // Queries with potential to improve
  competingPagesAnalysis?: string,  // Required when competing pages exist
  manualReviewRequired?: boolean,
  adminDecision?: 'USE_EXISTING' | 'CONSOLIDATE' | 'CREATE_NEW' | 'IGNORE',
  selectedPrimaryPageUrl?: string,
  
  title: { action: ComponentAction, reason: string, content: string },
  metaDescription: { action: ComponentAction, reason: string, content: string },
  h1Heading: { action: ComponentAction, reason: string, content: string },
  
  sections: [{
    heading: string,
    action: ComponentAction,
    reason: string,
    contentGuidelines?: string
  }],
  
  faqs: { action: ComponentAction, reason: string, content: string },
  internalLinks: { action: ComponentAction, reason: string, content: string },
  
  recommendedAction: 'KEEP' | 'OPTIMIZE' | 'MONITOR' | 'CONSOLIDATE' | 'MANUAL_REVIEW'
}
```

---

## Prompt Rules Enforced

The strategy prompt includes these immutable rules:

1. **HISTORICAL SEO PROTECTION IS SUPREME** — if GSC shows strong performance, respond with PROTECT.
2. **DO NOT OVERRIDE GSC SUCCESS WITH KEYWORD DATA** — if existing title gets 10% CTR on Page 1, protect it regardless of keyword suggestions.
3. **CANNIBALIZATION RULES**:
   - High cannibalization → must set `recommendedAction: 'MANUAL_REVIEW'` and `manualReviewRequired: true`.
   - Must NOT use phrases like "New page, needs..." or "Create new page" when competing pages exist.
4. **UNAVAILABLE PROVIDERS** — if keyword/SERP data is UNAVAILABLE, base strategy solely on GSC data. Do NOT fabricate missing metrics.
5. **SERP ANALYSIS** — look for common topics and content types; suggest new sections or FAQs but do NOT copy competitors.
6. **KEYWORD SEMANTICS** — use related keywords for heading variations but do NOT recommend keyword stuffing.

---

## Strategy for Existing vs. New Pages

### Existing Pages
- Strategy focuses on protecting high-performing components.
- Only approved expansion areas are targeted for optimization.
- Protected components receive `action: 'PROTECT'`.

### New Pages
- Strategy creates a full content blueprint.
- All components have `action: 'ADD'` or `action: 'OPTIMIZE'`.
- Strategy must align with confirmed distinct intent (when `adminDecision = 'CREATE_NEW'`).

---

## Example: PROTECT Directive

**Situation:** Tour page title "Kashmir Honeymoon Packages 2026" ranks #2 with 12% CTR.

**Keyword tool suggests:** "Romantic Kashmir Tour Package" as a better title.

**Strategy Engine output:**
```json
{
  "title": {
    "action": "PROTECT",
    "reason": "Current title achieves 12% CTR at position 2. Changing it risks losing existing search equity. GSC success overrides keyword tool suggestion.",
    "content": "[RETAIN EXISTING]"
  }
}
```

---

## Gemini Configuration

```typescript
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
generationConfig: { responseMimeType: "application/json" }
```

Response is JSON-only (no markdown, no explanations).

---

## Fallback Behavior

If Gemini API call fails:
- The strategy engine throws an error.
- The pipeline halts at the strategy step.
- No partial or fabricated strategy is returned.
- Admin can retry after resolving the API issue.
