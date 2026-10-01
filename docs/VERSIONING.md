# WanderKashmir — Version Baseline

## Versions

### V1 — Frozen Legacy Production

| Property | Value |
|---|---|
| Tag | `v1.0.0` |
| Commit | `16a07a4` |
| Branch origin | `main` |
| Status | **Frozen Legacy Production** |
| Description | Last stable committed production state. WanderKashmir V1 production application including Admin, Vendor, Auth, Booking, CRM, SEO infrastructure. |

### V2 — Future Production

| Property | Value |
|---|---|
| Version | `2.0.0` |
| Branch | `v2-production` |
| Location | `./wanderKashmirV2` |
| Status | **V2 Production Migration Baseline** |
| Description | New public frontend. Progressive replacement of V1 public functionality. Will eventually contain Admin and full production system. |

---

## Architecture

V1 and V2 **share the existing production Neon PostgreSQL database** during the migration period.

```
Neon Production DB
  ├── V1 (reads + writes) — production today
  └── V2 (reads only currently) — future production
```

- V1 is **preserved**. Not deleted.
- V2 **gradually replaces** V1 functionality in controlled phases.
- V1 is **not retired** until a future explicit deprecation phase.

---

## Production Lock Rules

1. `v1.0.0` is the frozen V1 baseline — **do not modify V1 casually**.
2. V1 may receive **emergency hotfixes only** — separately committed and documented.
3. V2 development happens in `./wanderKashmirV2` scope only.
4. **No duplicate database** — only one Neon production DB.
5. **No parallel Prisma schema** for V2.
6. V2 must not silently replace V1 — **controlled phases only**.

---

## Migration Phases

| Phase | Description | Status |
|-------|-------------|--------|
| A | V2 versioning + baseline | ✅ Complete |
| B | V2 public data bridge | Pending |
| C | V2 public production readiness | Pending |
| D | V2 Admin architecture | Pending |
| E | V2 Admin feature migration | Pending |
| F | V2 Vendor/business feature migration | Pending |
| G | V2 full production cutover | Pending |
| H | V1 dependency audit | Pending |
| I | V1 deprecation / retirement | Pending |
