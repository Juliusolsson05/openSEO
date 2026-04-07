#!/usr/bin/env bash
#
# OpenSEO — Upgrade script
# Safely upgrades to the latest version while preserving configuration.
#
# Usage:
#   ./upgrade.sh              Upgrade to latest
#   ./upgrade.sh --dry-run    Show what would change without applying
#

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"
EXAMPLE_ENV="$ROOT_DIR/.env.example"
BACKUP_DIR="$ROOT_DIR/.backups"

# ──────────────────────────────────────────────
# Output helpers
# ──────────────────────────────────────────────

bold()    { printf '\033[1m%s\033[0m' "$*"; }
green()   { printf '\033[32m%s\033[0m' "$*"; }
yellow()  { printf '\033[33m%s\033[0m' "$*"; }
red()     { printf '\033[31m%s\033[0m' "$*"; }
dim()     { printf '\033[2m%s\033[0m' "$*"; }

info()    { printf '  %s\n' "$*"; }
success() { printf '  %s %s\n' "$(green "✓")" "$*"; }
warn()    { printf '  %s %s\n' "$(yellow "!")" "$*"; }
fail()    { printf '  %s %s\n' "$(red "✗")" "$*" >&2; }

phase() {
  printf '\n\033[1m[%s] %s\033[0m\n' "$1" "$2"
}

# ──────────────────────────────────────────────
# Parse arguments
# ──────────────────────────────────────────────

DRY_RUN=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --help|-h)
      printf 'Usage: ./upgrade.sh [OPTIONS]\n\n'
      printf 'Options:\n'
      printf '  --dry-run   Show what would change without applying\n'
      printf '  --help      Show this help message\n'
      exit 0
      ;;
    *) fail "Unknown option: $1"; exit 1 ;;
  esac
done

printf '\n  %s\n' "$(bold "OpenSEO Upgrade")"

# ──────────────────────────────────────────────
# [1/4] Backup current .env
# ──────────────────────────────────────────────

phase "1/4" "Backing up configuration"

if [ ! -f "$ENV_FILE" ]; then
  fail "No .env file found. Run ./install.sh first."
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

if [ "$DRY_RUN" = 0 ]; then
  mkdir -p "$BACKUP_DIR"
  BACKUP_FILE="$BACKUP_DIR/.env-$TIMESTAMP"
  cp "$ENV_FILE" "$BACKUP_FILE"
  success "Backed up .env to .backups/.env-$TIMESTAMP"
else
  BACKUP_FILE=""
  info "(dry run — skipping backup)"
fi

# ──────────────────────────────────────────────
# [2/4] Merge new environment variables
# ──────────────────────────────────────────────

phase "2/4" "Checking for new configuration options"

if [ -f "$EXAMPLE_ENV" ]; then
  # Find keys in .env.example that are missing from .env
  NEW_KEYS=()
  while IFS= read -r line; do
    # Skip comments and blank lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    # Extract key
    key="${line%%=*}"
    if ! grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
      NEW_KEYS+=("$line")
    fi
  done < "$EXAMPLE_ENV"

  if [ ${#NEW_KEYS[@]} -gt 0 ]; then
    info "New configuration options found:"
    for entry in "${NEW_KEYS[@]}"; do
      key="${entry%%=*}"
      info "  + $key"
    done

    if [ "$DRY_RUN" = 0 ]; then
      printf '\n# Added by upgrade.sh on %s\n' "$TIMESTAMP" >> "$ENV_FILE"
      for entry in "${NEW_KEYS[@]}"; do
        printf '%s\n' "$entry" >> "$ENV_FILE"
      done
      success "Added ${#NEW_KEYS[@]} new variable(s) to .env"
    else
      info "(dry run — not applied)"
    fi
  else
    success "No new configuration options"
  fi
else
  warn ".env.example not found, skipping env merge"
fi

if [ "$DRY_RUN" = 1 ]; then
  printf '\n  %s\n\n' "$(dim "Dry run complete. No changes applied.")"
  exit 0
fi

# ──────────────────────────────────────────────
# [3/4] Pull latest version
# ──────────────────────────────────────────────

phase "3/4" "Pulling latest version"

if [ -d "$ROOT_DIR/.git" ]; then
  # Git-based install: pull code + rebuild
  BEFORE="$(git -C "$ROOT_DIR" rev-parse HEAD)"
  if git -C "$ROOT_DIR" pull --ff-only; then
    AFTER="$(git -C "$ROOT_DIR" rev-parse HEAD)"
    if [ "$BEFORE" = "$AFTER" ]; then
      success "Already up to date"
    else
      success "Updated $(git -C "$ROOT_DIR" log --oneline "$BEFORE".."$AFTER" | wc -l | tr -d ' ') commit(s)"
    fi
  else
    fail "git pull failed. Resolve conflicts manually, then re-run."
    exit 1
  fi

  # Ensure git-based installs use local image name
  if ! grep -q "^APP_IMAGE=" "$ENV_FILE" 2>/dev/null; then
    printf '%s\n' 'APP_IMAGE=openseo' >> "$ENV_FILE"
    info "Set APP_IMAGE=openseo for local builds"
  fi

  info "Building new image..."
  if docker compose build; then
    success "Build complete"
  else
    fail "Build failed. Your previous version is still running."
    if [ -n "${BACKUP_FILE:-}" ]; then
      fail "Restore with: cp $BACKUP_FILE .env"
    fi
    exit 1
  fi
else
  # Image-based install: just pull the latest image
  info "Pulling latest images..."
  if docker compose pull; then
    success "Images updated"
  else
    fail "Image pull failed. Check your network connection."
    exit 1
  fi
fi

# ──────────────────────────────────────────────
# [4/4] Restart services
# ──────────────────────────────────────────────

phase "4/4" "Restarting services"

info "Restarting containers (migrations run automatically)..."

# Detect if worker profile was active before restart
WORKER_RUNNING=0
if docker compose ps worker 2>/dev/null | grep -q "running"; then
  WORKER_RUNNING=1
fi

if [ "$WORKER_RUNNING" = 1 ]; then
  docker compose --profile worker up -d --remove-orphans
  success "App and worker restarted"
else
  docker compose up -d --remove-orphans
  success "App restarted"
fi

printf '\n'
printf '  %s\n' "$(green "$(bold "Upgrade complete!")")"
printf '\n'
if [ -n "${BACKUP_FILE:-}" ]; then
  printf '  %s\n' "$(dim "Backup: $BACKUP_FILE")"
fi
printf '  %s\n' "$(dim "Logs:   docker compose logs -f app")"
printf '\n'
