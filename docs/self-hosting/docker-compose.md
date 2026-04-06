# Docker Compose Topology

## File layout

| File | Purpose | Committed to git? |
|------|---------|-------------------|
| `compose.yml` | Production base. All services, volumes, healthchecks. | Yes |
| `compose.dev.yml` | Dev overlay. Exposes Postgres (5432) and Redis (6379) to the host. | Yes |
| `compose.override.yml` | Your local customizations. | No (gitignored) |

Docker Compose automatically merges `compose.override.yml` on top of `compose.yml` when you run `docker compose up`. You never need to pass `-f` for it.

## Services

| Service | Image | What it does |
|---------|-------|-------------|
| `postgres` | `postgres:16-alpine` | Primary database. Data in `postgres_data` volume. |
| `redis` | `redis:7-alpine` | Included in the stack for future use. Data in `redis_data` volume. |
| `app` | `openseo` (built locally) | The Next.js application. Runs migrations on start, serves on port 3000 internally, exposed on `$PORT` (default 4720). |
| `worker` | `openseo` (same image) | Dedicated background worker. Only starts with `--profile worker`. |

## Volumes

| Volume | Used by | Contains |
|--------|---------|----------|
| `postgres_data` | postgres | Database files |
| `redis_data` | redis | Redis persistence |
| `uploads_data` | app, worker | Uploaded media (when `STORAGE_DRIVER=local`) |

## Customization

Create `compose.override.yml` in the project root. Docker Compose picks it up automatically.

Example -- change the host port and add a reverse proxy:

```yaml
# compose.override.yml
services:
  app:
    ports:
      - "8080:3000"
```

Example -- use an external Postgres instead of the bundled one:

```yaml
# compose.override.yml
services:
  app:
    depends_on: []
    environment:
      DATABASE_URL: postgresql://user:pass@your-db-host:5432/openseo
  postgres:
    profiles:
      - disabled  # prevents it from starting
```

## Dedicated worker

By default, the app runs background jobs inline (inside the `app` container). For heavier workloads, run a dedicated worker:

```bash
DISABLE_INLINE_WORKER=1 docker compose --profile worker up -d
```

Both parts are needed:

- `DISABLE_INLINE_WORKER=1` tells the app container to stop processing background jobs.
- `--profile worker` starts the worker container, which runs `npm run worker`.

The worker uses the same Docker image as the app. It skips migrations on start (`SKIP_MIGRATIONS=1` is hardcoded in `compose.yml`).

The worker healthcheck writes a timestamp to `/tmp/worker-health` and checks it's less than 60 seconds old.

## Dev usage

To expose Postgres and Redis ports to the host (useful for running the app locally or using database GUIs):

```bash
docker compose -f compose.yml -f compose.dev.yml up -d
```

This maps:
- Postgres to `localhost:5432`
- Redis to `localhost:6379`

## Note on Redis

Redis is included in the stack and required to start (the app depends on it being healthy), but the application does not currently use it. It's there for future features. Don't remove it from the compose file -- the app container won't start without it passing its healthcheck.
