# Architecture

OpenSEO is a self-hosted AI content platform that generates SEO blog posts and glossary dictionaries for businesses. It runs as a Next.js app backed by Postgres, with optional S3 storage and multiple AI provider integrations. This document describes the current system shape honestly, including transitional areas.

## Tech Stack

- **Next.js 16** (App Router) with **React 19**
- **Prisma** ORM on **Postgres 16**
- **Tailwind CSS** + **Radix UI** for the dashboard
- **LangChain** for AI provider abstraction (OpenAI, Anthropic, Gemini)
- **Flydrive** for file storage (local FS or S3)
- **NextAuth v5** (Auth.js) with JWT sessions and credentials provider
- **Docker Compose** for production deployment
- **sharp** for image optimization

## Runtime Topology

```
Browser
  │
  ▼
Next.js server ─────┬──▶ Postgres 16
  (dashboard,       │
   API routes,      ├──▶ Storage (local FS or S3 via Flydrive)
   public pages)    │
                    ├──▶ AI providers (OpenAI / Anthropic / Gemini)
                    │
                    └──▶ Inline worker (polls BackgroundJob table)

Optional:
  Standalone worker process ──▶ Postgres (same BackgroundJob table)

Redis is provisioned in compose.yml but not used by application code today.
```

## Multi-Tenancy

`Company` is the tenant root. Every content model (posts, dictionaries, products, etc.) has a `companyId` foreign key.

The middleware (`src/middleware.ts`) resolves the current company for authenticated dashboard requests: it reads `companyId` from the JWT session, or from a `companyId` cookie if the user is an admin (userType 4). It injects a `Company-ID` header into the request. The `apiHandler` (`src/server/api/handler.ts`) reads this header and makes it available as `ctx.companyId`.

Public routes (`/preview/`, `/share/`, `/example`, `/site`) are exempt from header injection and resolve tenant identity differently (e.g. share tokens, inbound API keys, or hard-coded company lookups).

## Application Structure

- **`src/app/(dashboard)/*`** -- Authenticated dashboard. Covers blog management, dictionaries, analytics, publishing, settings, admin, and company profile. Layout in `src/app/(dashboard)/layout.tsx`.
- **`src/app/api/*`** -- API route handlers. Split across `/api/aurora/*` (legacy), `/api/v1/*` (newer), `/api/auth/*`, `/api/publishing/*`, `/api/media/*`, `/api/admin/*`, `/api/setup/*`, and `/api/health`.
- **`src/app/site/*`** -- Public-facing content rendering (blog posts, dictionary pages) served from the `ExamplePost`/`ExampleDictionary` projection tables.
- **`src/app/share/*`** -- Token-gated share links for previewing blog posts without authentication.
- **`src/app/example/*`** -- Older copy of the public site renderer (legacy naming, same projection tables).
- **`src/app/preview/*`** -- Blog post preview.

## API Layer

All API routes use `apiHandler()` from `src/server/api/handler.ts`. It wraps every route with auth checks (JWT session validation), body parsing (JSON, form data, multipart), error handling (typed `AppError` subclasses map to HTTP status codes), and request-ID propagation.

Legacy `/api/aurora/*` routes get deprecation headers (`Sunset: 2026-12-31`). Newer routes live under `/api/v1/*` (publishing, settings, search, notifications, company). Both sets use the same `apiHandler` and service layer; the split is organizational, not architectural.

## Core Domain

Key Prisma models (`prisma/schema.prisma`):

- **Company** -- Tenant root. Holds business metadata, API endpoint/key for outbound publishing, feature flags (`aurora_enabled`, `pulse_enabled`, `echo_enabled`), and an AI-extracted company profile.
- **Title** -- A planned blog post topic with SEO metadata, scheduling, and status tracking. Can link to a generated `BlogPost`.
- **BlogPost** -- A flattened copy of Title fields plus generated content metadata (cover image, excerpt, meta description). Status flows from `TO_BE_GENERATED` through `GENERATED` to `PUBLISHED`.
- **BlogPostElement** -- Ordered content blocks within a post. `element_type` is a free string (paragraph, heading, image, FAQ, CTA, checklist, etc.). Content stored as JSON.
- **Dictionary** / **Word** / **DictionaryDefinition** -- SEO glossaries. A dictionary contains words, each with a structured definition (snippets, synonyms, FAQs, etc.).
- **Product** / **ProductVariant** / **ProductImage** -- E-commerce catalog imported from external sources (e.g. Shopify).
- **Campaign** / **CTA** -- Call-to-action blocks that can be injected into blog content.
- **ShareLink** -- Token-based share links for unauthenticated post preview. One per post.
- **BackgroundJob** -- Generic durable job queue row (see Async Execution below).
- **ExamplePost** / **ExampleDictionary** -- Projection tables for public site rendering (see Publishing and Sync).
- **PublishingApiKey** -- API keys for inbound publishing (hashed, revocable).
- **ComparisonTool** / **Comparison** -- Versus/comparison page data.

## Content Generation

Titles represent planned topics. When a title is approved, the system generates a `BlogPost` with ordered `BlogPostElement` rows. Elements can be individually regenerated. AI calls go through LangChain with configurable providers (OpenAI, Anthropic, Gemini -- keys set per-deployment, not per-tenant).

Image generation and sourcing uses Ideogram and Pexels APIs. All uploaded/generated images are optimized to WebP via sharp and stored through the Flydrive storage layer (`src/server/storage/upload.ts`).

## Publishing and Sync

**Outbound (push to external CMS):** `PublishingService` (`src/server/services/publishing.service.ts`) sends posts to the company's configured `api_endpoint` as JSON webhooks (event types: `post.publish`, `post.unpublish`). `PublishingSyncService` (`src/server/services/publishing-sync.service.ts`) handles bulk sync (`post.upsert`, `dictionary.upsert`) with per-item delivery tracking via `BlogPublish` rows. Bulk operations use the in-memory task runtime for progress tracking.

**Inbound (external CMS pushes to OpenSEO):** Routes under `/api/v1/publishing/inbound/*` and `/api/publishing/inbound/` accept content via API-key auth (`PublishingApiKey`). Inbound content is written to the projection tables (`ExamplePost`, `ExampleElement`, `ExampleDictionary`, `ExampleWord`) via `src/server/public-content/store.ts`.

**Public content rendering:** The `ExamplePost`/`ExampleDictionary` tables (mapped to `example_posts`/`example_dictionaries` in Postgres) hold projected content that the `/site/*` and `/example/*` routes read directly. This is a separate copy from the canonical `BlogPost`/`Dictionary` tables -- the projection is not automatic; it flows through the sync/inbound APIs.

## Storage and Media

Storage uses Flydrive (`src/server/storage/index.ts`) with two drivers: local filesystem (default, writes to `./uploads`) or S3. The driver is selected by `STORAGE_DRIVER` env var.

All stored URLs are absolute. Local files are served via `/api/media/[...path]`. S3 files use the bucket endpoint or a configured `STORAGE_PUBLIC_URL`. Images are converted to WebP with thumbnails on upload (`src/server/storage/upload.ts`). Storage layout: `{companyId}/{folder}/{id}.webp`.

SSRF protection blocks uploads from private/local addresses.

## Async Execution

There are two systems, and that's a known transitional area:

1. **Durable Postgres queue** (`src/server/jobs/queue.ts`, `src/server/jobs/worker.ts`) -- Uses `BackgroundJob` table with `SELECT ... FOR UPDATE SKIP LOCKED` for atomic multi-worker claims. Supports retries with linear backoff, structured log appending, and status polling. Worker handlers are registered via `registerHandler()` in `src/server/jobs/worker.ts`.

2. **In-memory task runtime** (`src/server/tasks/runtime.ts`) -- A simple `Map<string, TaskRecord>` that tracks status/logs in process memory. Used by the bulk publishing sync operations today. State is lost on restart.

The inline worker starts automatically at boot (see Boot Sequence). Set `DISABLE_INLINE_WORKER=1` to run a standalone worker instead via `npm run worker` (or the `worker` service in `compose.yml`, activated with `--profile worker`).

## Boot Sequence

1. `instrumentation.ts` runs once per Next.js server process.
2. Calls `assertServerEnv()` (`src/lib/env.ts`) which validates `AUTH_SECRET` and `OPENSEO_ENCRYPTION_KEY`. Exits the process if either is missing, a placeholder, or too short in production.
3. Unless `DISABLE_INLINE_WORKER=1`, imports and registers all job handlers, then starts `runForever()` as a fire-and-forget background loop.
4. On container start, `docker-entrypoint.sh` runs `prisma migrate deploy` (skipped with `SKIP_MIGRATIONS=1`), then execs the main command.

## Known Transitional Areas

- **Legacy `/api/aurora/*` routes coexist with newer `/api/v1/*`.** Both work, aurora routes emit deprecation headers. No hard removal date enforced yet (sunset set to 2026-12-31).
- **Most real async work still uses the in-memory task runtime** (`src/server/tasks/runtime.ts`) rather than the durable `BackgroundJob` queue. The queue infrastructure is built but handler migration is incomplete.
- **Redis is provisioned in `compose.yml` but unused by application code.** It's there for future use (caching, rate limiting, etc.).
- **`ExamplePost`/`ExampleDictionary` naming vs `/site` routes.** The Prisma models and DB tables use the `example_` prefix (legacy), but the newer route group is `/site`. Both `/example/*` and `/site/*` route groups exist and render the same projection tables.
- **Agent/MCP capabilities are described in docs but not shipped in application code.**
