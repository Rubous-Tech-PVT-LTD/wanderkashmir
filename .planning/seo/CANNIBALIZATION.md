# SEO Intelligence — Cannibalization

> **Authority:** Verified against `src/lib/seo/opportunity-engine.ts`, `src/lib/seo/research-engine.ts`, and `src/lib/seo/manual-review-engine.ts` as of 2026-09-10.

---

## What Is Cannibalization?

**Keyword/entity cannibalization** occurs when multiple pages on WanderKashmir target the same search entity or search intent. Google must choose which page to rank, often splitting authority between them and reducing overall performance.

**Examples:**
- A `Property` page AND a `Blog` post both targeting "Vergan Resort Gulmarg".
- An existing `Tour` page AND a new `SeoLandingPage` both targeting "Kashmir honeymoon packages".
- Multiple `SeoLandingPage` records created for the same destination entity.

---

## Cannibalization Detection (Discovery Phase)

Detected in `opportunity-engine.ts` during the opportunity scoring phase.

**Match counting logic:**
```typescript
let matchCount = 0;
if (matchedProp) matchCount++;          // Property match
if (matchedTour) matchCount++;          // Tour match
existingSeoPages.forEach(p => {
  if (slug/title matches) matchCount++;
});

if (matchCount > 1) → cannibalizationRisk = 'HIGH'
else if (cluster.data.pages.size > 1) → cannibalizationRisk = 'MEDIUM'
else → cannibalizationRisk = 'LOW'
```

**Action override:**  
If `cannibalizationRisk === 'HIGH'` AND action would be `CREATE` or `OPTIMIZE`:
```
action → MANUAL_REVIEW
reason → "Multiple existing URLs target this entity/intent. Manual review required."
opportunityScore → +10 (to prioritize the review)
```

---

## Cannibalization Detection (Research Phase)

Detected in `research-engine.ts` during per-opportunity research.

**More sophisticated multi-entity check:**
1. Filters against all SeoLandingPages, Properties, and Tours.
2. Uses `entityTokens` (meaningful words, stop words removed).
3. Applies **intent-based filtering**:
   - Tours/Properties only flagged as competing for commercial queries.
   - Blogs only flagged as competing for informational queries.
   - Exact title match always flags.
4. Returns competing pages with `intentAlignment` scores.
5. Result: `cannibalizationRisk.status = 'SAFE' | 'MEDIUM_RISK' | 'HIGH_RISK'`.

---

## The MANUAL_REVIEW Response

`MANUAL_REVIEW` does **NOT** trigger any automated changes.

It means: "The system has identified that multiple pages compete for this entity/intent. A human Admin must decide the strategy."

**What Admin must decide:**
1. Which page should be the **primary** ranking page for this search intent?
2. Which intent belongs to which page?
3. Should another page target a different/distinct intent?
4. Should pages eventually be consolidated or redirected? (Admin executes, not the system.)
5. Should nothing be changed? (Status quo preserved.)

---

## Golden Rules for Cannibalization

```
NO AUTOMATIC 301 REDIRECTS
NO AUTOMATIC DELETION
NO AUTOMATIC MERGING
NO AUTOMATIC CANONICAL REPLACEMENT
```

**All cannibalization resolution requires explicit Admin action.**

---

## Cannibalization Resolution Options

The Admin's options (via `AdminManualReviewDecision.type`):

| Decision | Meaning |
|----------|---------|
| `USE_EXISTING_PRIMARY` | Designate one existing page as primary; others may remain but serve different intents |
| `CHOOSE_ANOTHER` | Admin selects a different page than the AI recommended |
| `CREATE_NEW_PAGE` | Admin confirms the intent is genuinely distinct and warrants a new page |
| `IGNORE` | No action required — situation is acceptable as-is |

---

## Historical SEO Protection During Cannibalization

When cannibalization is detected, the **existing high-performing page must be protected**:

1. The Strategy Engine marks components of the strong page as `PROTECT`.
2. The `[RETAIN EXISTING]` directive ensures those components are never rewritten.
3. The system does **not** rewrite a strong component simply because AI thinks another keyword sounds better.

**Performance hierarchy:**
```
Strong Performer → PROTECT (no changes)
Stable → PROTECT or minor OPTIMIZE
Improvement Candidate → OPTIMIZE with caution
```

---

## Case Study: Vergan Resort

**Situation:**
- `Property` page exists for Vergan Resort at `/stays/[id]`.
- `Blog` post exists about Vergan Resort.
- GSC shows both pages ranking for "Vergan Resort" and related queries.

**Engine classification:**
- `matchCount = 2` (Property + Blog) → `cannibalizationRisk = HIGH`.
- Action forced to `MANUAL_REVIEW`.

**Manual Review Engine output:**
- Property page → commercial/accommodation intent → `PRIMARY_CANDIDATE` (score 90).
- Blog post → informational intent → `SUPPORTING_INFORMATIONAL` (score 50).
- Confidence: HIGH (score gap ≥ 20, clear intent separation).

**AI recommendation:**
> "Keep the Property page as the primary ranking page for commercial booking intent. The Blog post serves supporting informational/research intent and can link to the Property page."

**Admin decision options:**
1. Accept recommendation: `USE_EXISTING_PRIMARY` (Property page).
2. Optimize Property page for commercial queries.
3. Update Blog internal links to point to Property as the authority.
4. Optionally: over time, consolidate if Blog provides no distinct value.

**What the system does automatically:** NOTHING. Admin executes all changes.

---

## Preventing Future Cannibalization

**Before creating any new page:**
1. The Opportunity Engine checks existing entities.
2. The Research Engine checks existing entities again, more thoroughly.
3. The Net-New Engine explicitly gates out topics where existing entities serve the intent.
4. The Strategy Engine flags `manualReviewRequired = true` when risk is HIGH.
5. The Generation Engine **throws** if `manualReviewRequired && !adminDecision`.

**Philosophy:** "One search intent → one clear primary page."
