#!/bin/sh
set -e

if [ "${SKIP_MIGRATIONS:-0}" != "1" ]; then
  echo "[entrypoint] Running database migrations..."
  npx prisma migrate deploy --config prisma/prisma.config.ts
  echo "[entrypoint] Migrations complete."
else
  echo "[entrypoint] Skipping migrations (SKIP_MIGRATIONS=1)."
fi

echo "[entrypoint] Starting application..."
exec "$@"
