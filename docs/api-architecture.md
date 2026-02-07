# API Architecture (Bird's-Eye)

## Current Principles

1. **Compatibility layer**
   - `/api/aurora/*`
   - Mirrors old Django paths and payloads.

2. **Canonical layer**
   - `/api/v1/*`
   - Clean, normalized contracts for future development.

3. **Platform/auth layer**
   - `/api/auth/*`
   - NextAuth + session endpoints.

4. **System/ops layer (transitional)**
   - `/api/health/*`, `/api/task-status/*`, etc.

## Recommended Structure

```text
/api
  /v1             # canonical product API
    /blog
    /dictionary
    /analytics
    /products
    /company
  /legacy
    /aurora       # compatibility shims/aliases
  /auth           # auth/session
  /internal       # task queues, diagnostics, non-public ops
```

## Contract Rules

- New feature endpoints: **only under `/api/v1/*`**
- Legacy-compatible endpoints: **under `/api/aurora/*`** (or `/api/legacy/aurora/*` when adopted)
- `/api/v1/*` must use standardized success/error envelopes.
- All API responses should include `X-Request-Id` header.

## Migration Plan (Safe)

1. Keep `/api/aurora/*` behavior stable.
2. Build/keep canonical routes under `/api/v1/*`.
3. Add deprecation headers on legacy routes before retirement.
4. Migrate frontend clients module-by-module to `/api/v1/*`.
5. Retire legacy endpoints only after traffic confirms zero consumers.

## Why this is industry-standard

- Clear separation between **legacy** and **canonical** APIs.
- Explicit versioning for contract evolution.
- Traceability via request IDs.
- Predictable error taxonomy and envelopes.
