#!/usr/bin/env bash
#
# OpenSEO — One-command installer
# https://github.com/Juliusolsson05/openSEO
#
# Usage:
#   ./install.sh              Install with defaults (port 4720)
#   ./install.sh --port 8080  Use a specific port
#   ./install.sh --no-open    Don't open browser after install
#   ./install.sh --reset      Tear down everything and start fresh
#

set -euo pipefail

# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"
EXAMPLE_ENV="$ROOT_DIR/.env.example"
DEFAULT_PORT=4720

# ──────────────────────────────────────────────
# Output helpers
# ──────────────────────────────────────────────

bold()    { printf '\033[1m%s\033[0m' "$*"; }
dim()     { printf '\033[2m%s\033[0m' "$*"; }
green()   { printf '\033[32m%s\033[0m' "$*"; }
yellow()  { printf '\033[33m%s\033[0m' "$*"; }
red()     { printf '\033[31m%s\033[0m' "$*"; }

info()    { printf '  %s\n' "$*"; }
success() { printf '  %s %s\n' "$(green "✓")" "$*"; }
warn()    { printf '  %s %s\n' "$(yellow "!")" "$*"; }
fail()    { printf '  %s %s\n' "$(red "✗")" "$*" >&2; }

phase() {
  printf '\n\033[1m[%s] %s\033[0m\n' "$1" "$2"
}

header() {
  printf '\n'
  printf '\033[1m'
  cat <<'ART'
  ██████╗ ██████╗ ███████╗███╗   ██╗    ███████╗███████╗ ██████╗
 ██╔═══██╗██╔══██╗██╔════╝████╗  ██║    ██╔════╝██╔════╝██╔═══██╗
 ██║   ██║██████╔╝█████╗  ██╔██╗ ██║    ███████╗█████╗  ██║   ██║
 ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║    ╚════██║██╔══╝  ██║   ██║
 ╚██████╔╝██║     ███████╗██║ ╚████║    ███████║███████╗╚██████╔╝
  ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝    ╚══════╝╚══════╝ ╚═════╝
ART
  printf '\033[0m'
  printf '  %s\n\n' "$(dim "Open-source AI content platform — self-hosted installer")"
}

# ──────────────────────────────────────────────
# Utilities
# ──────────────────────────────────────────────

generate_secret() {
  openssl rand -base64 "$1" 2>/dev/null | tr -d '\n'
}

env_set() {
  local key="$1" value="$2"
  python3 - "$ENV_FILE" "$key" "$value" <<'PY'
from pathlib import Path
import sys

env_path = Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]

lines = env_path.read_text().splitlines()
updated = False
for i, line in enumerate(lines):
    if line.startswith(f"{key}="):
        lines[i] = f"{key}={value}"
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
import socket, sys
s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
try:
    s.bind(("0.0.0.0", int(sys.argv[1])))
except OSError:
    sys.exit(1)
finally:
    s.close()
PY
}

find_free_port() {
  local port="$1"
  while ! port_is_free "$port"; do
    port=$((port + 1))
    if [ "$port" -gt 65535 ]; then
      fail "No free port found starting from $1"
      exit 1
    fi
  done
  printf '%s' "$port"
}

wait_for_health() {
  local url="$1" max_wait=180 elapsed=0

  while [ "$elapsed" -lt "$max_wait" ]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done

  return 1
}

open_browser() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || true
  fi
}

# ──────────────────────────────────────────────
# Parse arguments
# ──────────────────────────────────────────────

ARG_PORT=""
ARG_NO_OPEN=0
ARG_RESET=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      ARG_PORT="$2"
      shift 2
      ;;
    --no-open)
      ARG_NO_OPEN=1
      shift
      ;;
    --reset)
      ARG_RESET=1
      shift
      ;;
    --help|-h)
      printf 'Usage: ./install.sh [OPTIONS]\n\n'
      printf 'Options:\n'
      printf '  --port PORT   Use a specific port (default: %s)\n' "$DEFAULT_PORT"
      printf '  --no-open     Do not open browser after install\n'
      printf '  --reset       Remove all containers, volumes, and .env, then reinstall\n'
      printf '  --help        Show this help message\n'
      exit 0
      ;;
    *)
      fail "Unknown option: $1"
      printf '  Run ./install.sh --help for usage.\n' >&2
      exit 1
      ;;
  esac
done

# ──────────────────────────────────────────────
# Reset mode
# ──────────────────────────────────────────────

if [ "$ARG_RESET" = 1 ]; then
  header
  phase "1/1" "Resetting OpenSEO"

  info "Stopping containers and removing volumes..."
  docker compose down -v --remove-orphans 2>/dev/null || true

  if [ -f "$ENV_FILE" ]; then
    rm "$ENV_FILE"
    info "Removed .env"
  fi

  success "Reset complete. Run ./install.sh to reinstall."
  printf '\n'
  exit 0
fi

# ══════════════════════════════════════════════
# Main install flow
# ══════════════════════════════════════════════

header

# ──────────────────────────────────────────────
# [1/4] Checking prerequisites
# ──────────────────────────────────────────────

phase "1/4" "Checking prerequisites"

MISSING=0

for cmd in docker openssl curl python3; do
  if command -v "$cmd" >/dev/null 2>&1; then
    success "$cmd"
  else
    fail "$cmd not found"
    MISSING=1
  fi
done

if docker compose version >/dev/null 2>&1; then
  success "docker compose"
else
  fail "docker compose not available"
  MISSING=1
fi

if [ "$MISSING" = 1 ]; then
  printf '\n'
  fail "Install the missing tools above and re-run ./install.sh"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  fail "Docker daemon is not running. Start Docker and try again."
  exit 1
fi

# ──────────────────────────────────────────────
# [2/4] Preparing environment
# ──────────────────────────────────────────────

phase "2/4" "Preparing environment"

# Determine port
if [ -n "$ARG_PORT" ]; then
  APP_PORT="$ARG_PORT"
  if ! port_is_free "$APP_PORT"; then
    fail "Port $APP_PORT is already in use."
    exit 1
  fi
  success "Using requested port $APP_PORT"
else
  APP_PORT="$(find_free_port "$DEFAULT_PORT")"
  if [ "$APP_PORT" != "$DEFAULT_PORT" ]; then
    warn "Port $DEFAULT_PORT is busy — using $APP_PORT instead"
  else
    success "Port $APP_PORT is available"
  fi
fi

APP_URL="http://localhost:${APP_PORT}"

# Create or reuse .env
FRESH_INSTALL=0
if [ ! -f "$ENV_FILE" ]; then
  if [ ! -f "$EXAMPLE_ENV" ]; then
    fail ".env.example not found — is this the right directory?"
    exit 1
  fi
  cp "$EXAMPLE_ENV" "$ENV_FILE"
  FRESH_INSTALL=1
  success "Created .env from template"
else
  info "Using existing .env"
fi

# Write configuration
env_set PORT "$APP_PORT"
env_set NEXT_PUBLIC_SITE_URL "$APP_URL"
env_set FRONTEND_URL "$APP_URL"
env_set AUTH_TRUST_HOST "true"

# Generate secrets only on fresh install
if [ "$FRESH_INSTALL" = 1 ]; then
  env_set APP_IMAGE "openseo"
  env_set AUTH_SECRET "$(generate_secret 32)"
  env_set OPENSEO_ENCRYPTION_KEY "$(generate_secret 32)"
  env_set DB_PASSWORD "$(generate_secret 32 | tr -dc 'a-zA-Z0-9' | head -c 24)"
  success "Generated encryption keys"
else
  info "Keeping existing secrets"
fi

# ──────────────────────────────────────────────
# [3/4] Building and starting services
# ──────────────────────────────────────────────

phase "3/4" "Building and starting services"

# Clean slate on first install
if [ "$FRESH_INSTALL" = 1 ]; then
  docker compose down -v --remove-orphans >/dev/null 2>&1 || true
fi

info "This may take a few minutes on first run..."
printf '\n'
if docker compose build; then
  printf '\n'
  success "Build complete"
else
  printf '\n'
  fail "Build failed. Check the output above."
  exit 1
fi

info "Starting services..."
docker compose up -d --remove-orphans >/dev/null 2>&1

# ──────────────────────────────────────────────
# [4/4] Waiting for health
# ──────────────────────────────────────────────

phase "4/4" "Waiting for application"

info "Checking $APP_URL ..."
if wait_for_health "$APP_URL/api/health"; then
  success "Application is healthy"
else
  fail "Application did not become healthy within 3 minutes."
  printf '\n'
  info "Debug with:"
  info "  docker compose logs app"
  info "  docker compose ps"
  exit 1
fi

# ──────────────────────────────────────────────
# Success
# ──────────────────────────────────────────────

if [ "$ARG_NO_OPEN" = 0 ]; then
  open_browser "$APP_URL/setup"
fi

printf '\n'
printf '  %s\n' "$(green "$(bold "OpenSEO is running!")")"
printf '\n'
printf '  App:     %s\n' "$APP_URL"
printf '  Setup:   %s\n' "$APP_URL/setup"
printf '\n'
printf '  %s\n' "$(dim "Commands:")"
printf '  Stop:    docker compose down\n'
printf '  Start:   docker compose up -d\n'
printf '  Logs:    docker compose logs -f app\n'
printf '  Reset:   ./install.sh --reset\n'
printf '\n'
printf '  %s\n' "$(dim "Debug (expose DB/Redis to host):")"
printf '  docker compose -f compose.yml -f compose.dev.yml up -d\n'
printf '\n'
