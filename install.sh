#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"
EXAMPLE_ENV_FILE="$ROOT_DIR/.env.example"
DEFAULT_PORT=4720
INTERNAL_DATABASE_URL="postgresql://openseo:openseo@postgres:5432/openseo"
INTERNAL_REDIS_URL="redis://redis:6379"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

generate_secret() {
  openssl rand -base64 "$1" | tr -d '\n'
}

replace_or_append() {
  local key="$1"
  local value="$2"

  python3 - "$ENV_FILE" "$key" "$value" <<'PY'
from pathlib import Path
import sys

env_path = Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]

lines = env_path.read_text().splitlines()
updated = False
for index, line in enumerate(lines):
    if line.startswith(f"{key}="):
        lines[index] = f"{key}={value}"
        updated = True
        break

if not updated:
    if lines and lines[-1] != "":
        lines.append("")
    lines.append(f"{key}={value}")

env_path.write_text("\n".join(lines) + "\n")
PY
}

port_is_free() {
  python3 - "$1" <<'PY'
import socket
import sys

port = int(sys.argv[1])
sock = socket.socket()
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
try:
    sock.bind(("0.0.0.0", port))
except OSError:
    sys.exit(1)
finally:
    sock.close()
PY
}

find_free_port() {
  local port="$1"
  while ! port_is_free "$port"; do
    port=$((port + 1))
  done
  printf '%s\n' "$port"
}

wait_for_health() {
  local url="$1"
  local attempts=90

  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done

  printf 'Timed out waiting for %s\n' "$url" >&2
  exit 1
}

open_browser() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || true
  fi
}

require_command docker
require_command openssl
require_command curl
require_command perl
require_command python3

if ! docker compose version >/dev/null 2>&1; then
  printf 'Docker Compose is required but not available.\n' >&2
  exit 1
fi

if [ ! -f "$EXAMPLE_ENV_FILE" ]; then
  printf 'Missing %s\n' "$EXAMPLE_ENV_FILE" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  cp "$EXAMPLE_ENV_FILE" "$ENV_FILE"
  CREATED_ENV=1
  printf 'Created .env from .env.example\n'
else
  CREATED_ENV=0
  printf 'Using existing .env\n'
fi

SUGGESTED_PORT="$(find_free_port "$DEFAULT_PORT")"
if [ "$SUGGESTED_PORT" != "$DEFAULT_PORT" ]; then
  printf 'Port %s is busy. Suggested free port: %s\n' "$DEFAULT_PORT" "$SUGGESTED_PORT"
fi

read -r -p "Default port [${SUGGESTED_PORT}]: " APP_PORT
APP_PORT="${APP_PORT:-$SUGGESTED_PORT}"

if ! port_is_free "$APP_PORT"; then
  printf 'Port %s is already in use. Please rerun and choose a free port.\n' "$APP_PORT" >&2
  exit 1
fi

read -r -p "App URL [http://localhost:${APP_PORT}]: " APP_URL
APP_URL="${APP_URL:-http://localhost:${APP_PORT}}"

replace_or_append AUTH_SECRET "$(generate_secret 32)"
replace_or_append OPENSEO_ENCRYPTION_KEY "$(generate_secret 32)"
replace_or_append PORT "$APP_PORT"
replace_or_append NEXT_PUBLIC_API_BASE_URL ""
replace_or_append NEXT_PUBLIC_SITE_URL "$APP_URL"
replace_or_append FRONTEND_URL "$APP_URL"
replace_or_append DATABASE_URL "$INTERNAL_DATABASE_URL"
replace_or_append REDIS_URL "$INTERNAL_REDIS_URL"

printf 'Building containers...\n'
docker compose build

if [ "$CREATED_ENV" = "1" ]; then
  printf 'Resetting any stale containers and volumes for a clean first install...\n'
  docker compose down -v --remove-orphans >/dev/null 2>&1 || true
fi

printf 'Starting internal services...\n'
docker compose up -d --remove-orphans postgres redis

printf 'Running database migrations...\n'
docker compose run --rm app npx prisma migrate deploy

printf 'Starting application...\n'
docker compose up -d --remove-orphans app

printf 'Waiting for app healthcheck...\n'
wait_for_health "$APP_URL/api/health"

open_browser "$APP_URL/setup"

printf '\nOpenSEO is running at %s\n' "$APP_URL"
printf 'Open %s/setup to create the first admin account.\n' "$APP_URL"
printf 'Postgres and Redis stay internal by default.\n'
printf 'For host debugging ports, run: docker compose -f docker-compose.yml -f docker-compose.debug.yml up -d\n'
