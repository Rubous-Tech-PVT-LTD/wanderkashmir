# SEO Intelligence — Validation Engine

> **Authority:** Verified against `src/lib/seo/validation-engine.ts` as of 2026-09-10.

---

## Overview

The Validation Engine is the final automated quality gate before content reaches Admin preview. It audits generated content against the strategy blueprint and WanderKashmir content standards.

**File:** `src/lib/seo/validation-engine.ts`  
**Model:** Gemini 2.5 Flash  
**Input:** `SeoStrategy` + generated content string  
**Output:** `ValidationReport`

---

## Validation Criteria (Checked by AI)

1. **Strategy compliance**: Did the generated content follow the recommended sections from the strategy?
2. **High-performing query protection**: Did the content protect the existing queries that were marked for protection?
3. **Keyword stuffing**: Is the primary keyword repeated unnaturally often?
4. **Fake facts**: Are there obviously fabricated facts (fake distances, phone numbers, invented hotel amenities)?
5. **Search intent fulfillment**: Does the content address the target search intent?

---

## Validation Output (`ValidationReport`)

```typescript
interface ValidationReport {
  status: 'PASS' | 'FIX' | 'FLAG';
  issues: string[];
  keywordDensity: number;
}
```

Note: The type `SeoValidationResult` in `types.ts` uses `PASS | FIX | REJECT`, while the actual `ValidationReport` interface in `validation-engine.ts` uses `PASS | FIX | FLAG`. The engine uses FLAG for major violations.

---

## Validation Status Meanings

| Status | Meaning | Next Action |
|--------|---------|------------|
| `PASS` | Content meets all quality standards | Cleared for Admin Preview → possible publish |
| `FIX` | Minor issues detected; content needs correction | Cannot publish until fixed or Admin manually overrides |
| `FLAG` | Major violations detected | Admin must review; may need regeneration |

**Important:** `FIX` and `FLAG` are safety results, not system failures.

> "Validation = FIX does not mean the system broke. It means the generated content hallucinated or failed guidelines. Review manually."

---

## What Happens on Validation Failure

In the cron generate-seo route:
```typescript
if (validation.status !== 'PASS') {
  // Mark opportunity as REJECTED
  await prisma.seoOpportunity.update({
    where: { id: opportunityId },
    data: { status: 'REJECTED' }
  });
  // Return error — page is NOT saved
  return { success: false, message: "Validation Failed", issues: validation.issues }
}
```

The page is **not created** if validation fails via cron.

---

## Validation in Admin-Triggered Workflow

When Admin triggers the full pipeline manually:
1. Generation runs.
2. Validation runs.
3. If PASS → page saved as `workflowState = 'VALIDATED'`.
4. Admin reviews the validation report in the preview.
5. Admin approves → `workflowState = 'PUBLISHED'`.

If FIX/FLAG → Admin sees the issues and can:
- Request regeneration.
- Make manual content edits.
- Override (at Admin's risk — not recommended).

---

## Validation Store on SeoLandingPage

The `SeoLandingPage` model stores the validation report:

```prisma
validationReport  Json?   // Stores the ValidationReport object
```

This allows Admin to review the validation findings alongside the content preview.

---

## Gemini Configuration for Validation

```typescript
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
generationConfig: { responseMimeType: "application/json" }
```

Output is JSON only with `{ status, issues, keywordDensity }`.

---

## Troubleshooting

| Problem | Resolution |
|---------|-----------|
| Content always gets FIX/FLAG | Check generation prompt; verify strategy protection directives are respected |
| Fake facts flagged | Generation engine may not have received verified DB entity context |
| Keyword stuffing flagged | Strategy may be recommending too aggressive optimization; adjust section guidelines |
| Intent mismatch flagged | Research intent inference may be incorrect; Admin can manually correct the intent classification |
