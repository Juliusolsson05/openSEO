# OpenSEO

Self-hostable AI-powered SEO content platform. Generate, edit, analyze, and publish long-form blog posts and keyword dictionaries.

## What you can do today

- Generate blog titles and full posts with AI (OpenAI, Anthropic, or Gemini)
- Edit posts in a block-based editor with 22+ structured element types
- Build keyword dictionaries and glossaries with AI-assisted definitions
- Analyze content for SEO readability, keyword density, and structure
- Publish content to external systems via documented webhook APIs
- Render published content on built-in public pages
- Share draft posts via secure token links
- Manage multiple companies in isolated workspaces
- Schedule posts and manage CTA campaigns
- Self-host with Docker Compose — one command to install

## Quickstart (self-hosted)

Requires Docker, `openssl`, `curl`, and `python3`.

```bash
./install.sh
```

This generates secrets, starts Postgres/Redis/app containers, runs database migrations, and opens the setup wizard. You'll need at least one AI provider API key (OpenAI, Anthropic, or Gemini) to complete setup.

See `./install.sh --help` for options. Use `./install.sh --reset` to start fresh.

## Local development

```bash
cp .env.example .env          # fill in AUTH_SECRET and OPENSEO_ENCRYPTION_KEY
npm install
docker compose -f compose.yml -f compose.dev.yml up -d postgres redis
npx prisma migrate dev
npm run dev
```

Open `http://localhost:4720/setup` to create the first admin account.

Requires Node 22 and Docker.

## Documentation

| Topic | Link |
|-------|------|
| Self-hosting quickstart | [docs/self-hosting/quickstart.md](docs/self-hosting/quickstart.md) |
| Configuration reference | [docs/self-hosting/configuration.md](docs/self-hosting/configuration.md) |
| Docker Compose topology | [docs/self-hosting/docker-compose.md](docs/self-hosting/docker-compose.md) |
| Operations and backups | [docs/self-hosting/operations.md](docs/self-hosting/operations.md) |
| Upgrading | [docs/self-hosting/upgrade.md](docs/self-hosting/upgrade.md) |
| Development setup | [docs/development/getting-started.md](docs/development/getting-started.md) |
| Architecture overview | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Contributing | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Security policy | [SECURITY.md](SECURITY.md) |
| API docs (interactive) | `http://localhost:4720/api/docs` (when running) |

## What OpenSEO is not

- Not a general-purpose CMS or website builder.
- Not fully autonomous — AI assists content creation, humans review and publish.
- The agent/MCP integration described in `agents/` is documented but not yet shipped as working code.
- There is no test suite yet. CI runs lint and build only.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run worker` | Standalone background worker |
| `npm run lint` | ESLint |

## License

[GPL-3.0-only](LICENSE)
