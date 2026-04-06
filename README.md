# OpenSEO

OpenSEO is a self-hostable AI-powered SEO content platform for generating, editing, analyzing, and publishing long-form content.

## Features

- AI-assisted blog generation workflow
- Block-based editor with rich content elements
- Dictionary and glossary generation
- Publishing API and public content rendering
- Company-scoped workspaces, analytics, scheduling, and CTA management

## Quick start (self-hosted)

```bash
./install.sh
```

The script generates secrets, starts Docker services (migrations run automatically on first container start), and opens the setup wizard. See `./install.sh --help` for options.

## Local development

1. Copy `.env.example` to `.env` and fill in the required secrets (or run `./install.sh` and use the generated `.env`)
2. Install dependencies: `npm install`
3. Start infrastructure: `docker compose -f compose.yml -f compose.dev.yml up -d postgres redis`
4. Run migrations: `npx prisma migrate dev`
5. Start the dev server: `npm run dev`
6. Open `http://localhost:4720` and complete setup at `/setup`

## Upgrading

```bash
./upgrade.sh
```

The upgrade script backs up your `.env`, merges any new configuration options, rebuilds the image, and restarts. Migrations run automatically on container start.

Use `./upgrade.sh --dry-run` to preview changes without applying them.

## Production with dedicated worker

By default, the background job worker runs inline with the web server. For production, use a dedicated worker process:

```bash
# Start app + worker
DISABLE_INLINE_WORKER=1 docker compose --profile worker up -d
```

## Docker Compose files

| File | Purpose | Committed |
|------|---------|-----------|
| `compose.yml` | Production base — do not edit | Yes |
| `compose.dev.yml` | Development overrides (exposes DB/Redis ports) | Yes |
| `compose.override.yml` | Your customizations (ports, extra services) | No (gitignored) |

## Environment variables

Start from `.env.example`. Required variables:

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Session signing key (generate: `openssl rand -base64 32`) |
| `OPENSEO_ENCRYPTION_KEY` | AES-256 vault key (generate: `openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | Public URL (e.g., `https://seo.example.com`) |

AI and media provider keys are optional — configure only the providers you use. Keys can also be set in the app UI under Settings > Integrations.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run worker` | Standalone background worker |
| `npm run lint` | Run ESLint |
