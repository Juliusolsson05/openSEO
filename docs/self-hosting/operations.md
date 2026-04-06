# Operations

## Start / stop

```bash
# Start all services (detached)
docker compose up -d

# Stop all services (keeps data)
docker compose down

# Stop and destroy all data
docker compose down -v
```

## Logs

```bash
# Follow app logs
docker compose logs -f app

# Follow worker logs (if running dedicated worker)
docker compose logs -f worker

# All services
docker compose logs -f
```

## Health check

```bash
curl http://localhost:4720/api/health
```

Returns JSON like:

```json
{
  "status": "ok",
  "checks": {
    "database": { "status": "ok", "latencyMs": 2 }
  }
}
```

- Returns **200** when healthy, **503** when the database is unreachable.
- The check runs a `SELECT 1` against Postgres and reports latency.
- It does **not** check Redis, storage, AI providers, or the worker. If you need to verify those, you'll have to check manually for now.

## Backups

`upgrade.sh` only backs up `.env`. You're responsible for backing up everything else.

What to back up:

| What | How |
|------|-----|
| **Postgres data** | `docker compose exec postgres pg_dump -U openseo openseo > backup.sql` or back up the `postgres_data` volume directly. |
| **Uploads** (if `STORAGE_DRIVER=local`) | Back up the `uploads_data` Docker volume. |
| **`.env`** | Copy it somewhere safe. Contains your secrets. |

To restore a database dump:

```bash
cat backup.sql | docker compose exec -T postgres psql -U openseo openseo
```

## Migrations

Migrations run automatically on every container start via `docker-entrypoint.sh`. It calls `npx prisma migrate deploy`.

To skip migrations (e.g., if you manage them separately):

```bash
SKIP_MIGRATIONS=1 docker compose up -d
```

The dedicated worker container always skips migrations (`SKIP_MIGRATIONS=1` is set in `compose.yml`).

## Monitoring

The `/api/health` endpoint is the only built-in monitoring hook. There is no metrics or Prometheus endpoint currently.

For basic uptime monitoring, poll the health endpoint and alert on non-200 responses.
