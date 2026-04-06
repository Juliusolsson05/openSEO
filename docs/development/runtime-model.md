# Runtime Model

How OpenSEO boots, runs background work, and validates its environment.

## Boot sequence

Next.js calls `instrumentation.ts` exactly once per server process at startup. It does two things in order:

1. **Env validation** — imports `src/lib/env.ts` and calls `assertServerEnv()`. If required secrets are missing or malformed, the process exits immediately.
2. **Inline worker** — unless `DISABLE_INLINE_WORKER=1` is set, it imports the job worker and starts the poll loop in-process (fire-and-forget, does not block boot).

This only runs under the Node.js runtime — edge/middleware imports are skipped.

## Inline worker (default)

By default, `npm run dev` and `npm start` boot both the HTTP server and the background job consumer in the same process. The worker polls the `BackgroundJob` table every second and dispatches to registered handlers.

This is the simplest setup. One process, no extra config.

Disable it by setting `DISABLE_INLINE_WORKER=1` in `.env` — you'd do this when running a dedicated worker process instead.

## Standalone worker

For production or if you want the worker isolated:

```bash
# Local dev
npm run worker

# Docker Compose
docker compose --profile worker up
```

Same codebase, separate process. Uses `src/server/jobs/standalone-worker.ts` as the entrypoint.

## Migrations

In Docker, `docker-entrypoint.sh` runs `npx prisma migrate deploy` before starting the app. Skip with `SKIP_MIGRATIONS=1`.

In local dev, use:

```bash
npx prisma migrate dev
```

This is the Prisma dev command — it creates new migration files and applies them. Don't use `migrate deploy` locally.

## Current async model (transitional)

This is honest about where things stand:

- A **durable Postgres-backed job queue** exists. The `BackgroundJob` table stores jobs, and `src/server/jobs/queue.ts` handles claiming, completing, and failing them. The worker loop in `src/server/jobs/worker.ts` polls and dispatches.

- **No concrete handlers are registered yet.** `src/server/jobs/handlers.ts` has `registerAllHandlers()` but the body is empty — it has comments showing where website-analyzer, publishing-sync, and autopilot handlers will be wired.

- **Most real async work still uses the older in-memory task runtime** at `src/server/tasks/runtime.ts`. This is a simple `Map<string, TaskRecord>` — tasks are created, tracked by status (accepted/running/completed/failed), and logged, but everything lives in process memory. If the process restarts, in-flight tasks are lost.

- This is intentionally transitional. The plan is to migrate each task type onto the durable queue as separate sub-plans.

## Env validation

`assertServerEnv()` in `src/lib/env.ts` refuses to start without:

- **`AUTH_SECRET`** — must be set, must not be the Dockerfile build-time placeholder, and must be at least 32 chars in production.
- **`OPENSEO_ENCRYPTION_KEY`** — must be valid base64 that decodes to exactly 32 bytes (AES-256-GCM key). In production, it also rejects keys where all bytes are identical.

If either check fails, the process prints a clear error and exits with code 1. No silent fallbacks.
