# SEO Intelligence — Admin Decisions

> **Authority:** Verified against `src/lib/seo/types.ts` and `src/lib/seo/generation-engine.ts` as of 2026-09-10.

---

## Overview

Admin decisions are required at two critical points in the SEO Intelligence workflow:

1. **Manual Review Decision** — when cannibalization is detected (unblocks generation pipeline).
2. **Publish Approval** — final gate before a generated page goes live.

---

## Manual Review Decision Types

**Type:** `AdminManualReviewDecision` in `src/lib/seo/types.ts`

```typescript
{
  type: 'USE_EXISTING_PRIMARY' | 'CHOOSE_ANOTHER' | 'CREATE_NEW_PAGE' | 'IGNORE',
  primaryPageUrl?: string,
  primaryPageTitle?: string,
  primaryPageType?: string,
  source?: 'AI_RECOMMENDATION_ACCEPTED' | 'ADMIN_MANUAL_SELECTION' 
          | 'ADMIN_CREATE_NEW_CONFIRMED' | 'ADMIN_IGNORED',
  reason?: string,
  confirmedDistinctIntent?: string,
  decidedBy?: string,
  decidedAt: string
}
```

---

## Decision Type Detail

### `USE_EXISTING_PRIMARY`

**Meaning:** The Admin designates one existing page as the primary ranking target for this search intent.

**When to use:**
- The AI recommended an existing page and the Admin agrees.
- Multiple pages exist; one clearly serves the commercial/primary intent.

**Effect:**
- `strategy.adminDecision = 'USE_EXISTING'`
- `strategy.selectedPrimaryPageUrl` is set.
- Generation can proceed (guard is lifted).
- The existing page remains unchanged (Admin optimizes manually if needed).

**Source field:** `'AI_RECOMMENDATION_ACCEPTED'` (accepted AI pick) or `'ADMIN_MANUAL_SELECTION'` (Admin chose differently).

---

### `CHOOSE_ANOTHER` (Admin Manual Selection)

**Meaning:** The Admin agrees that an existing page should be primary, but selects a different page than the AI recommended.

**When to use:**
- AI recommended a Property page, but Admin knows the Blog is the better fit.
- Admin has context the AI does not.

**Effect:** Same as `USE_EXISTING_PRIMARY` but with `source: 'ADMIN_MANUAL_SELECTION'`.

---

### `CREATE_NEW_PAGE`

**Meaning:** The Admin confirms that the search intent is **genuinely distinct** and warrants a new page, even though competing pages exist.

**When to use:**
- Careful analysis shows the new intent is fundamentally different from existing pages.
- Business has capacity/content for the distinct intent.
- Not just a keyword variation — a genuinely different audience or need.

**Gate:**
- Admin must provide `confirmedDistinctIntent` — a brief explanation of why this intent is distinct.
- Without a clear distinct intent justification, this should not be used.

**What it does NOT mean:**
- Creating a doorway page because a keyword has impressions.
- Creating duplicate content under a slightly different angle.
- Ignoring the existing entity ecosystem.

**Effect:** `strategy.adminDecision = 'CREATE_NEW'`. Generation proceeds to create a new `SeoLandingPage`.

---

### `IGNORE`

**Meaning:** Admin determines no action is required for this opportunity.

**When to use:**
- The cannibalization situation is acceptable as-is.
- The opportunity score doesn't justify immediate investment.
- Existing pages serve the intent adequately.

**Effect:** `strategy.adminDecision = 'IGNORE'`. No content generated.

---

## Strategy-Level Admin Decisions

The `SeoStrategy` object also carries admin decision state:

```typescript
SeoStrategy {
  manualReviewRequired?: boolean,
  adminDecision?: 'USE_EXISTING' | 'CONSOLIDATE' | 'CREATE_NEW' | 'IGNORE',
  selectedPrimaryPageUrl?: string
}
```

---

## Generation Guard (Server-Side Enforcement)

**File:** `src/lib/seo/generation-engine.ts` (lines 18–26)

```typescript
// Server-side guard: Block generation if manual review required and no admin decision
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

**This is not a UI-only check.** It is enforced server-side in the generation engine.  
Even direct API calls cannot bypass this guard.

---

## Publish Approval

After generation and validation pass, the page is saved as `workflowState = 'VALIDATED'`.

**Admin must explicitly approve to publish.**

- Admin reviews the content in the preview.
- Admin clicks Approve → `workflowState = 'PUBLISHED'`.
- Page becomes publicly accessible.

**No automatic publishing ever occurs.**

---

## What Admin Cannot Delegate to Automation

| Action | Automated? |
|--------|-----------|
| Discovery (GSC → opportunities) | ✅ Yes |
| Research initiation | ❌ Admin triggers |
| Strategy generation | ✅ Yes (after research) |
| Manual review recommendation | ✅ Yes (auto-generated) |
| Manual review decision | ❌ **Admin required** |
| Content generation | ✅ Yes (after Admin unblocks) |
| Content validation | ✅ Yes |
| Publish approval | ❌ **Admin required** |
| Page deletion | ❌ **Admin required** (never automatic) |
| Redirects | ❌ **Admin required** (never automatic) |
| Canonical changes | ❌ **Admin required** (never automatic) |
