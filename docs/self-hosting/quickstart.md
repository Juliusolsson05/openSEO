# Self-Hosting Quickstart

Get OpenSEO running on your own machine in under 5 minutes.

## Prerequisites

You need these installed and working:

- **Docker** (daemon must be running)
- **docker compose** (v2, the `docker compose` subcommand)
- **openssl**
- **curl**
- **python3**

Node.js is **not** needed for self-hosting. The app runs inside Docker.

## Install

```bash
./install.sh
```

What this does:

1. Checks that all prerequisites are installed and Docker is running.
2. Copies `.env.example` to `.env` and generates random secrets (`AUTH_SECRET`, `OPENSEO_ENCRYPTION_KEY`, `DB_PASSWORD`).
3. Picks port 4720 (or the next free port if 4720 is busy).
4. Builds the Docker image and starts all containers (Postgres, Redis, app).
5. Waits up to 3 minutes for the health check to pass.
6. Opens `http://localhost:4720/setup` in your browser.

## First-run setup

After install, go to the URL printed in your terminal (usually `http://localhost:4720/setup`).

1. Create your admin account.
2. Enter at least one AI provider API key (OpenAI, Anthropic, or Gemini).

**Caveat:** Setup requires a working AI key to complete. You can't skip this step.

## Options

| Flag | What it does |
|------|-------------|
| `--port 8080` | Use a specific port instead of 4720 |
| `--no-open` | Don't open the browser after install |
| `--help` | Show usage info |

```bash
# Example: run on port 9000 without opening the browser
./install.sh --port 9000 --no-open
```

## Reset

```bash
./install.sh --reset
```

**Warning: this destroys all data.** It stops all containers, removes all Docker volumes (database, uploads, Redis), and deletes `.env`. You'll start from scratch.

## Next steps

- [Configuration reference](configuration.md) -- all environment variables explained.
- [Docker Compose topology](docker-compose.md) -- services, volumes, customization.
- [Operations](operations.md) -- logs, health checks, backups.
- [Upgrading](upgrade.md) -- how to pull new versions safely.
