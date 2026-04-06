# Getting Started

How to get OpenSEO running on your machine for development.

## Prerequisites

- **Node.js 22** (check with `node -v`)
- **Docker** — for Postgres and Redis
- **npm** — comes with Node

## Setup

```bash
# 1. Clone the repo and cd into it

# 2. Copy env and generate secrets
cp .env.example .env
# Edit .env — at minimum set these two:
#   AUTH_SECRET=<paste output of: openssl rand -base64 32>
#   OPENSEO_ENCRYPTION_KEY=<paste output of: openssl rand -base64 32>

# 3. Install dependencies
npm install

# 4. Start Postgres and Redis (exposes ports to localhost)
docker compose -f compose.yml -f compose.dev.yml up -d postgres redis

# 5. Run database migrations
npx prisma migrate dev

# 6. Start the dev server
npm run dev
```

The app starts on **http://localhost:4720** by default. Change `PORT` in `.env` if that conflicts.

## First run

1. Open **http://localhost:4720/setup**
2. Create your admin account
3. Enter at least one AI provider API key (OpenAI, Anthropic, or Gemini) — the setup wizard tests it over the network before saving

After that you're in.

## Common commands

| Command | What it does |
|---|---|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run worker` | Start a standalone background job worker |
| `npx prisma migrate dev` | Create/apply migrations in dev |
| `npx prisma studio` | Visual database browser at localhost:5555 |

## Project structure

```
src/
  app/          Next.js App Router — pages, layouts, API routes
  server/       Server-only code — jobs, tasks, services
  lib/          Shared utilities, env validation, helpers
  components/   React components (UI primitives + feature components)
  hooks/        Custom React hooks
  store/        Redux store and slices
  types/        Shared TypeScript types
prisma/         Schema and migrations
public/         Static assets
docs/           Documentation
```
