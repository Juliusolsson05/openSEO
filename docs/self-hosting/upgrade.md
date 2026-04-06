# Upgrading

## Quick upgrade

```bash
./upgrade.sh
```

What this does, step by step:

1. **Backs up `.env`** to `.backups/.env-<timestamp>`.
2. **Merges new env vars** -- compares `.env.example` with your `.env` and appends any new variables with their defaults.
3. **Pulls latest code** via `git pull --ff-only` (if this is a git repo).
4. **Rebuilds** the Docker image with `docker compose build`.
5. **Restarts** containers. If the worker profile was running, it restarts that too.

Migrations run automatically when the app container starts.

## Dry run

```bash
./upgrade.sh --dry-run
```

Shows which new env vars would be added, without changing anything. Useful to see what's new before committing to the upgrade.

## Caveats

- **Only `.env` is backed up.** The database and uploads are not backed up by `upgrade.sh`. Back those up yourself before upgrading (see [operations](operations.md#backups)).
- **If this isn't a git repo, the code pull is skipped.** You'll need to update the files manually (download a new release, copy them in, etc.). The script will warn you.
- **Migrations run automatically** on container restart. There's no separate migration step and no way to preview migrations before they run (short of reading the migration files in `prisma/migrations/`).
- **If the build fails, your old containers keep running.** Nothing gets restarted until the build succeeds. The script tells you how to restore your `.env` if needed.

## Manual upgrade

If you don't want to use `upgrade.sh`:

```bash
git pull
docker compose build
docker compose up -d
```

If you're running the dedicated worker:

```bash
git pull
docker compose build
docker compose --profile worker up -d
```

Check `.env.example` for new variables after pulling -- you may need to add them to your `.env` manually.

## Rollback

If something goes wrong after upgrading:

1. Restore your `.env` backup:
   ```bash
   cp .backups/.env-<timestamp> .env
   ```
2. Check out the previous code version (if using git):
   ```bash
   git log --oneline -5   # find the previous commit
   git checkout <commit>
   ```
3. Rebuild and restart:
   ```bash
   docker compose build
   docker compose up -d
   ```

**Caveat:** This doesn't roll back database migrations. If a migration changed your schema, you may need to restore from a database backup.
