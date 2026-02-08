# Settings Migration Plan (next-rewrite)

## Decision

- Frontend settings UI stays **explicit/hardcoded** for product clarity.
- Backend settings stays **protocol-driven and typed** for validation, migrations, and compatibility.

## Goals

1. Remove fragile dynamic UI composition.
2. Keep a typed, versioned backend contract.
3. Preserve compatibility while migrating from `/api/nordtools/*` to `/api/v1/settings/*`.
4. Keep all high-stakes flows backwards-compatible until fully switched.

## Current State (summary)

- Settings UI is split across multiple pages (`/settings`, `/publishing`, `/company-profile`, `/elements`).
- Legacy catch-all route `/api/nordtools/[...slug]` handles many unrelated settings paths.
- Some settings are persisted in `company.settings` JSON; some are top-level company columns.
- API shapes are mixed (`raw` + wrapped `success`).

## Target State

### API

- `GET /api/v1/settings` → full typed snapshot.
- `GET /api/v1/settings/:domain` → one domain.
- `PATCH /api/v1/settings/:domain` → validated patch per domain.

### Domains

- `general`
- `generation`
- `publishing`
- `integrations`
- `quillo`

### Service Layer

`SettingsService` handles:
- normalization/defaults
- per-domain validation
- domain patching
- versioned snapshots

## Migration Phases

### Phase 1 (now)

- Add `SettingsService` and `/api/v1/settings/*` routes.
- Keep `/api/nordtools/*` intact for compatibility.
- Start switching high-value callers one-by-one.

### Phase 2

- Move each settings page to v1 endpoints.
- Keep UI hardcoded; no schema-rendering.
- Normalize response wrappers on frontend API usage.

### Phase 3

- Make `/api/nordtools/*` settings routes wrappers or deprecate.
- Remove dead legacy branches after usage drops to zero.
- Add deprecation headers + sunset date.

## Safety Checklist

- All domain patches are schema-validated.
- Empty patches rejected.
- Company scoping enforced in API handler.
- No destructive migrations without rollback path.
- Legacy endpoints kept until each UI path is verified in prod-like env.

## Verification Checklist

- [ ] GET snapshot returns expected domains.
- [ ] PATCH each domain persists and re-reads correctly.
- [ ] Generation settings still affect post generation behavior.
- [ ] Publishing credentials still used by sync services.
- [ ] Admin company switching still scopes settings correctly.
- [ ] Existing `/api/nordtools/*` pages still work during migration.
