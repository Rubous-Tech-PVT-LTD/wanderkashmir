# SEO Intelligence — Generation Engine

> **Authority:** Verified against `src/lib/seo/generation-engine.ts` as of 2026-09-10.

---

## Overview

The Generation Engine drafts SEO content based **exclusively** on the Strategy Engine's blueprint. It does not independently decide what to write.

**File:** `src/lib/seo/generation-engine.ts`  
**Model:** Gemini 2.5 Flash  
**Prerequisites:** Valid `SeoResearch` + `SeoStrategy`, and admin decision if `manualReviewRequired`.

---

## Server-Side Generation Guard

**This is enforced server-side. It cannot be bypassed.**

```typescript
if (
  (research.cannibalizationRisk?.status === 'HIGH_RISK' ||
   strategy.recommendedAction === 'MANUAL_REVIEW' ||
   strategy.manualReviewRequired) &&
  !strategy.adminDecision
) {
  throw new Error(
    "Generation blocked: Manual Review is required. Admin must select a decision " +
    "(e.g. Primary Page, Consolidate, Create New) before content generation."
  );
}
```

If this throws, generation stops. The error propagates to the Admin UI.

---

## Verified Entity Context

Before generating, the engine fetches **real database facts** for the target entity:

```typescript
const property = await prisma.property.findFirst({
  where: { name: { contains: research.target, mode: "insensitive" } },
  select: { name, location, pricePerNight, amenities, faqs }
});
```

If found, these verified facts are injected into the prompt:
```
VERIFIED DATABASE FACTS (Use this real data instead of inventing):
{ name, location, pricePerNight, amenities, faqs }
```

**Note:** Currently only Property entities are verified at generation time. Tour entity verification is a candidate for future enhancement.

---

## Content Generation Rules (Immutable)

1. **Strictly follow component-level actions** from the strategy (PROTECT, OPTIMIZE, EXPAND, ADD).
2. **PROTECT → `[RETAIN EXISTING]`**: If a component action is `PROTECT`, Gemini MUST output exactly `[RETAIN EXISTING]` for that field. No rewriting.
3. **Heading hierarchy enforcement**: Strategy H2s MUST remain H2s (`##`). H1 is reserved for the page title only.
4. **Natural semantic coverage**: Write for users first. No keyword stuffing or repetitive exact-match insertion.
5. **Rich Markdown**: Content must use H2, H3, bullet points, bold text — not a wall of text.
6. **No placeholders**: NEVER generate `[phone]`, `[email]`, `[contact]`, or any hypothetical placeholder.
7. **No fabrication**: NEVER invent prices, distances, amenities, or business names. Use only VERIFIED DATABASE FACTS or known facts about Kashmir.
8. **Professional tone**: Human, helpful, not AI-generated sounding.

---

## The [RETAIN EXISTING] Directive

When `strategy.title.action === 'PROTECT'`, Gemini outputs `"[RETAIN EXISTING]"` as the value.

After generation, the engine stitches the original values back:

```typescript
if (generated.title === '[RETAIN EXISTING]') generated.title = existingContent.title || '';
if (generated.h1Heading === '[RETAIN EXISTING]') generated.h1Heading = existingContent.h1Heading || '';
if (generated.description === '[RETAIN EXISTING]') generated.description = existingContent.description || '';
if (generated.content === '[RETAIN EXISTING]') generated.content = existingContent.content || '';
if (generated.faqs === '[RETAIN EXISTING]') generated.faqs = existingContent.faqs || [];
```

**Effect:** Protected components are never rewritten. The original high-performing content is preserved.

---

## Generation Output

```typescript
{
  title: string,         // Meta title (or [RETAIN EXISTING] resolved)
  h1Heading: string,     // Page H1 heading
  description: string,   // Meta description
  content: string,       // Full Markdown body content
  faqs: Array<{ question: string, answer: string }>
}
```

---

## JSON Schema Enforcement

Gemini is given a strict output schema:

```typescript
generationConfig: {
  responseMimeType: "application/json",
  responseSchema: {
    type: OBJECT,
    properties: {
      title: STRING,
      description: STRING,
      h1Heading: STRING,
      content: STRING,
      faqs: ARRAY of { question: STRING, answer: STRING }
    },
    required: ["title", "description", "h1Heading", "content", "faqs"]
  }
}
```

This ensures structured output even if the model attempts to produce prose.

---

## Generate-SEO Cron Route

**File:** `src/app/api/cron/generate-seo/route.ts`  
**Trigger:** Admin action via `triggerSeoGeneration(topic?)` in `src/actions/admin-seo.ts`  
**Auth:** Bearer `CRON_SECRET`  
**Max duration:** 120 seconds

**Page type detection logic** (topic → pageType):
| Condition | Page Type |
|-----------|-----------|
| Contains 'best'/'top'/'cheap' + 'hotels'/'resorts' | BLOG |
| Contains 'homestay' | HOMESTAY |
| Contains 'tour' or 'package' | TOUR |
| Contains 'hotel', 'resort', 'place', 'destination' | DESTINATION |
| Contains 'taxi', 'cab', 'transfer' | TAXI |
| Default | TAXI |

**Pipeline in the cron route:**
1. Research → 2. Strategy → 3. Generate → 4. Validate → 5. Save as VALIDATED

If validation fails: opportunity marked `REJECTED`. No page saved.  
If passes: page saved as `workflowState = 'VALIDATED'` — **awaiting Admin approval to publish.**

---

## What Generation NEVER Does

- Generate content without a strategy blueprint.
- Override PROTECT directives.
- Fabricate prices, hotel rates, distances, reviews, policies.
- Create content for MANUAL_REVIEW opportunities without an Admin decision.
- Publish content automatically.
- Use paid SERP data (disabled).
- Replace an entire existing page without explicit strategy authorization.
