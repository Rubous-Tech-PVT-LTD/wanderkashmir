# SEO Intelligence — Safety Rules

> **These rules are non-negotiable. They protect existing rankings, user trust, and business integrity.**  
> **Authority:** Verified against `src/lib/seo/`, `prisma/schema.prisma`, and existing documentation as of 2026-09-10.

---

## Database Safety Rules

### ABSOLUTELY FORBIDDEN

```
prisma migrate reset
db push --force-reset
DROP TABLE
DROP DATABASE
TRUNCATE
DELETE FROM seo_opportunity (broad/unconditional)
DELETE FROM seo_landing_page (broad/unconditional)
```

**Why:** The `SeoOpportunity` table is a historical log of SEO intelligence. Destroying it destroys the business's SEO institutional memory.

### Mandatory Database Rules

| Rule | Implementation |
|------|---------------|
| No bulk delete of production data | All removal via `status = 'RESOLVED'` (upsert) |
| No DROP or TRUNCATE | Not permitted under any circumstances |
| Existing IDs preserved | All upserts update existing records in-place |
| Existing `createdAt` preserved | Upserts never touch `createdAt` |
| Historical SEO records preserved | Stale topics → `status = 'RESOLVED'`, never deleted |
| Duplicate records resolved non-destructively | Primary record kept, others marked RESOLVED |
| High-performing pages protected | Strategy must PROTECT strong components |
| Point-in-Time Recovery (PITR) enabled | Production DB has PITR active |

---

## Content Safety Rules

### Absolute Prohibitions

| Prohibition | |
|------------|--|
| Fabricated prices | Never invent property rates, tour costs |
| Fabricated distances | Never invent travel times or distances |
| Fabricated hotel amenities | Never invent room features, facilities |
| Fabricated availability | Never claim a property is available |
| Fabricated reviews | Never generate fake ratings or testimonials |
| Fabricated policies | Never invent cancellation or refund policies |
| Fabricated business facts | Never invent phone numbers, addresses, emails |
| Fabricated routes | Never invent road or transport routes |
| Placeholder text | Never leave `[phone]`, `[email]`, `[contact]` in published content |
| Disabled provider metrics | Never display Google Trends or paid SERP data that was fabricated |

### Content Generation Rules

- Content must only use **verified database facts** (from Property, Tour, etc.) or **well-known Kashmir facts**.
- Generated content must **pass validation** before Admin review.
- If required factual data is missing: **omit the claim entirely** — do not invent it.
- Tone must be professional, human, and helpful.

---

## Automation Safety Rules

| Rule | Status |
|------|--------|
| DISCOVERY = Automatic | ✅ Allowed |
| GENERATION = Admin-triggered only | ✅ Enforced via server-side guard |
| PUBLISHING = Admin approval only | ✅ Enforced |
| Cron NEVER auto-publishes | ✅ Verified in code |
| No automatic 301 redirects | ✅ Enforced (manual only) |
| No automatic page deletion | ✅ Enforced |
| No automatic canonical changes | ✅ Enforced |
| No automatic content replacement of live pages | ✅ Generation creates new VALIDATED records |
| Blind page generation is prohibited | ✅ Generation guard enforces this |
| Mass keyword/city doorway pages prohibited | ✅ Quality gates and entity checks prevent this |

---

## URL Preservation Rules

Existing URLs must be preserved:
- **Never change an existing page's slug** unless there is a compelling reason AND proper 301 redirect is implemented manually.
- **Never delete a `SeoLandingPage` record** without verifying it's not receiving traffic (check GSC).
- **Never remove a Tour or Property page's slug** — these are the SEO foundation.

---

## Historical SEO Protection Rules

The Strategy Engine enforces these:

| Situation | Required Action |
|----------|----------------|
| Title gets > 5% CTR at position ≤ 5 | PROTECT — never rewrite |
| Meta description drives strong CTR | PROTECT — never rewrite |
| H1 heading aligns with top-traffic query | PROTECT — never change |
| Existing content ranks for valuable queries | PROTECT sections that serve those queries |
| Historical baseline shows strong performance | PROTECT all strong components |

**Hierarchy of authority:**
```
GSC Historical Performance > Strategy Engine Recommendations > Keyword Tool Suggestions
```

---

## Provider Safety Rules

- **Paid providers are disabled** unless explicitly enabled by the project owner.
- **Google Trends is unavailable** — do not represent it as active.
- **Keyword Planner** only reports data when OAuth is connected. Returns UNAVAILABLE if not.
- **Never fabricate metrics** from unavailable providers.
- **Manual review evidence** must always truthfully state provider availability.

---

## Cannibalization Safety Rules

| Rule | |
|------|-|
| No automatic 301 redirects | ✅ |
| No automatic page merging | ✅ |
| No automatic canonical replacement | ✅ |
| No automatic deletion of competing pages | ✅ |
| All cannibalization resolution = Admin decision | ✅ |
| MANUAL_REVIEW blocks pipeline until Admin decides | ✅ Enforced by generation guard |

---

## What MUST NEVER Happen

1. A page going live without Admin approval.
2. A validated page being treated as published without the explicit publish action.
3. Content being generated for a `MANUAL_REVIEW` opportunity without `adminDecision` being set.
4. Any database record being hard-deleted as part of discovery or generation.
5. Any 301 redirect being created by any automated script.
6. Any canonical tag being changed by any automated script.
7. Fake metrics appearing in the Admin UI or generated content.
8. A disabled provider being represented as active.
9. Any `prisma migrate reset` or `DROP` being run against the production database.
10. Mass creation of city/keyword doorway pages without genuine business inventory.

---

## Verification Tracking

Any change that touches:
- Existing page records
- Existing opportunity records
- Publishing state of any page

Must be tracked in the verification log. See [VERIFICATION.md](./VERIFICATION.md).
