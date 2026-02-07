# API Protocol (Industry-Standard Baseline)

## Goals
- Keep **legacy compatibility** for `/api/aurora/*`.
- Make `/api/v1/*` the clean, canonical contract.
- Standardize observability and error handling.

## Surfaces

### 1) Legacy Compatibility Surface
- Path: `/api/aurora/*`
- Contract: Django-compatible payloads (unchanged)
- Purpose: avoid frontend breakage during migration

### 2) Canonical Surface
- Path: `/api/v1/*`
- Contract: standardized envelope + typed errors
- Purpose: future-facing APIs for new features

## Standard Response Shapes

### Success (v1)
```json
{
  "success": true,
  "data": { "...": "..." },
  "meta": {
    "requestId": "req_xxx",
    "timestamp": "2026-02-07T14:00:00.000Z"
  }
}
```

### Error (v1, RFC 7807-aligned)
```json
{
  "success": false,
  "error": {
    "type": "https://docs.openclaw.ai/problems/validation-error",
    "title": "Validation error",
    "status": 400,
    "code": "VALIDATION_ERROR",
    "detail": "post_id is required",
    "requestId": "req_xxx"
  }
}
```

## Required Headers
- `X-Request-Id`: unique ID per request (all API responses)
- `Content-Type: application/json`

## Error Code Baseline
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`
- `INTERNAL_ERROR`

## Pagination (v1)
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "total": 0,
      "page": 1,
      "pageSize": 20,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  },
  "meta": { "requestId": "req_xxx", "timestamp": "..." }
}
```

## Migration Rules
1. New endpoints must be added under `/api/v1/*`.
2. `/api/aurora/*` should only be used for backward compatibility.
3. Legacy routes may return old shapes; v1 routes must use standardized shape.
4. Deprecation headers should be added before retiring legacy endpoints.

## Non-Goals
- No breaking changes to existing legacy consumers.
- No full rewrite of all response payloads in one PR.
