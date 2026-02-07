# API Route Manifest (Phase II)

This is a bird's-eye classification of current API surfaces.

## Canonical (preferred)
- `/api/v1/blog/*`
- `/api/v1/dictionary/*`
- `/api/v1/analytics/*`
- `/api/v1/products/*`
- `/api/v1/search/*`
- `/api/v1/notifications/*`
- `/api/v1/health`

## Legacy compatibility
- `/api/aurora/*` (active compatibility surface)
- `/api/legacy/aurora/*` (rewrite alias to `/api/aurora/*`)
- `/api/nordtools/*` (legacy catch-all)

## Platform / auth
- `/api/auth/*`

## System / ops (transitional)
- `/api/health`
- `/api/health/celery`
- `/api/task-status/*`

## Policy
1. New endpoints should be created under `/api/v1/*`.
2. Existing app behavior depending on `/api/aurora/*` must remain intact.
3. Legacy endpoints include deprecation headers and request IDs.
4. No endpoint removals until traffic confirms no active consumers.
