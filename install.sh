#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"
EXAMPLE_ENV_FILE="$ROOT_DIR/.env.example"

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

  if grep -q "^${key}=" "$ENV_FILE"; then
    perl -0pi -e "s#^${key}=.*#${key}=${value}#m" "$ENV_FILE"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

wait_for_health() {
  local url="$1"
  local attempts=60

  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done

  printf 'Timed out waiting for %s\n' "$url" >&2
  exit 1
}

require_command docker
require_command openssl
require_command curl
require_command perl

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
  printf 'Created .env from .env.example\n'
else
  printf 'Using existing .env\n'
fi

read -r -p 'App URL [http://localhost:4720]: ' APP_URL
APP_URL="${APP_URL:-http://localhost:4720}"

read -r -p 'Default port [4720]: ' APP_PORT
APP_PORT="${APP_PORT:-4720}"

replace_or_append AUTH_SECRET "$(generate_secret 32)"
replace_or_append OPENSEO_ENCRYPTION_KEY "$(generate_secret 32)"
replace_or_append PORT "$APP_PORT"
replace_or_append FRONTEND_URL "$APP_URL"
replace_or_append NEXT_PUBLIC_SITE_URL "$APP_URL"

printf 'Building containers...\n'
docker compose build

printf 'Starting Postgres and Redis...\n'
docker compose up -d postgres redis

printf 'Running database migrations...\n'
docker compose run --rm app npx prisma migrate deploy

printf 'Starting application...\n'
docker compose up -d app

printf 'Waiting for app healthcheck...\n'
wait_for_health "$APP_URL/api/health"

printf '\nOpenSEO is running at %s\n' "$APP_URL"
printf 'Next step: open %s/setup to create the first admin account.\n' "$APP_URL"
