# WanderKashmir V2

**Version:** 2.0.0  
**Status:** V2 Production Migration / Development Baseline

---

## Architecture

```
                    ┌─────────────────────────┐
                    │   NEON PRODUCTION DB    │
                    │  (Shared Production DB) │
                    └────────────┬────────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
                  ▼                             ▼
        ┌───────────────────┐        ┌────────────────────┐
        │ V1 LEGACY         │        │ V2 (this app)      │
        │                   │        │                    │
        │ Preserved system  │        │ Future Production  │
        │ Existing Admin    │        │ New public frontend│
        │ Existing Vendor   │        │ Future Admin       │
        │ Existing business │        │ Progressive        │
        │ logic & data      │        │ replacement of V1  │
        └───────────────────┘        └────────────────────┘
```

### Architecture Rules

- **V1 is the preserved legacy production system.** It must not be deleted during migration.
- **V2 is the future production application.** It progressively replaces required V1 functionality.
- **The existing Neon PostgreSQL database** remains the production data source during migration.
- **Existing production data must be preserved.** No data migration, reset, or duplication.
- **V2 will eventually contain** the public website and Admin.
- **No duplicate production database** should be created.
- **No parallel Prisma schema** should be created for V2.
- **Existing production SEO, vendor, and data records** must remain intact.

---

## V1 Production Lock Policy

`v1.0.0` represents the **frozen production V1 baseline**.

1. V1 must not be modified casually during V2 development.
2. V1 may receive a critical emergency production hotfix **only when explicitly required**.
3. Any V1 hotfix must be separately committed and documented.
4. V1 must never be deleted simply because V2 is being developed.
5. Existing V1 production data must remain preserved.
6. Existing V1 SEO infrastructure must remain preserved.
7. Existing V1 Vendor data/system must remain preserved.
8. Existing V1 Admin functionality must remain available until its required capabilities are safely replaced in V2.
9. V1 retirement will happen **only after a future explicit migration/deprecation phase**.

---

## V2 Production Migration Policy

V2 is **not allowed** to silently replace V1. Migration must happen in controlled phases.

### Migration Sequence

| Phase | Description |
|-------|-------------|
| **Phase A** | V2 versioning + baseline ✅ *(current)* |
| **Phase B** | V2 public data bridge |
| **Phase C** | V2 public production readiness |
| **Phase D** | V2 Admin architecture |
| **Phase E** | V2 Admin feature migration |
| **Phase F** | V2 Vendor/business feature migration |
| **Phase G** | V2 full production cutover |
| **Phase H** | V1 dependency audit |
| **Phase I** | V1 deprecation / retirement |

---

## Development

```bash
cd wanderKashmirV2
npm install
npm run dev
```

> **Note:** Requires `DATABASE_URL` in `.env.local` pointing to the shared Neon production database.

---

## V2 Production Baseline

- **V2 branch:** `v2-production`
- **V1 frozen tag:** `v1.0.0`
- **V1 commit (baseline):** `16a07a4`
