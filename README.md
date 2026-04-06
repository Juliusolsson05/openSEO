<p align="center">
  <h1 align="center">OpenSEO</h1>
  <p align="center">
    The open-source AI content engine for SEO.
    <br />
    Generate structured blog posts and keyword dictionaries. Edit, analyze, publish — self-hosted.
  </p>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-blue" alt="License" /></a>
  <a href="https://github.com/Juliusolsson05/openSEO"><img src="https://img.shields.io/github/stars/Juliusolsson05/openSEO?style=social" alt="GitHub stars" /></a>
</p>

<p align="center">
  <a href="docs/self-hosting/quickstart.md">Self-Host</a> · <a href="docs/development/getting-started.md">Develop</a> · <a href="ARCHITECTURE.md">Architecture</a> · <a href="CONTRIBUTING.md">Contribute</a> · <a href="SECURITY.md">Security</a>
</p>

<!-- TODO: Add hero screenshot here once available -->
<!-- <p align="center"><img src="public/screenshots/editor.png" alt="OpenSEO editor" width="800" /></p> -->

---

## How it works

**1. Tell it about your business.** OpenSEO scrapes your website and builds a structured company profile — industry, audience, tone, terminology, differentiators. Every piece of content it generates is aware of your business.

**2. Generate titles.** Specify your industry and how many titles you want. AI generates SEO-optimized titles with focus keywords following Yoast guidelines. Duplicates are filtered automatically.

**3. Schedule and generate posts.** Drag titles onto a calendar. When you're ready, AI generates full blog posts in two phases: first it plans the article structure (which element types in what order), then it fills each block with content. No single-prompt blob of markdown — structured, typed content blocks.

**4. Edit with a block-based editor.** Posts are composed of 28+ element types: paragraphs, FAQs, comparison tables, timelines, case studies, checklists, statistics, code clusters, product recommendations, and more. Each element can be individually regenerated, enhanced, or rewritten.

**5. Analyze with Quillo.** An AI analysis panel scores your post, identifies weaknesses, and suggests specific SEO and content improvements. Autopilot mode can apply improvements, add missing elements, and generate images — all with real-time visual feedback.

**6. Publish anywhere.** Webhook-based publishing sends structured JSON to any CMS endpoint. Two-way sync via inbound API. Or render content on the built-in public pages.

---

## What makes it different

**Structured content, not HTML blobs.** Posts aren't flat markdown. They're ordered, typed JSON blocks — each with a schema, editor, and preview. Your frontend gets clean structured data, not a string to parse.

**Anti-AI-slop generation.** The writing system has a hardcoded banned-word list ("crucial", "leverage", "dive into", "seamlessly", "game-changer"...), requires real company names and statistics, enforces minimum paragraph lengths, and forbids generic introductions. The output reads like a person wrote it.

**Per-element AI operations.** Regenerate one FAQ answer without touching the rest. Enhance a single paragraph for readability. Add a new element at any position with a free-text prompt. The AI has context from surrounding elements.

**Provider-agnostic.** Switch between OpenAI, Anthropic, and Gemini without changing anything. LangChain abstraction under the hood.

**Self-hosted, one command.** `./install.sh` — generates secrets, starts containers, runs migrations, opens setup. No SaaS dependency. Your data stays on your server.

---

## Quickstart

```bash
./install.sh
```

Requires Docker, `openssl`, `curl`, and `python3`. The script starts Postgres, Redis, and the app, then opens the setup wizard where you create an admin account and enter an AI provider key.

See `./install.sh --help` for options.

## Local development

```bash
cp .env.example .env          # set AUTH_SECRET and OPENSEO_ENCRYPTION_KEY
npm install
docker compose -f compose.yml -f compose.dev.yml up -d postgres redis
npx prisma migrate dev
npm run dev
```

Open `http://localhost:4720/setup`. Requires Node 22 and Docker.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Database | Postgres 16 via Prisma |
| AI | LangChain — OpenAI, Anthropic, Gemini |
| Editor | 28+ custom element types with inline editing |
| Rich text | TipTap (ProseMirror) |
| UI | Radix UI, Tailwind CSS 4, Framer Motion |
| Auth | NextAuth v5 (Auth.js) with JWT |
| Storage | Flydrive (local FS or S3), sharp (WebP) |
| Images | Ideogram (AI generation), Pexels (stock) |
| Calendar | FullCalendar (drag-and-drop scheduling) |
| API docs | Scalar (interactive OpenAPI explorer) |
| Deploy | Docker Compose |

---

## Documentation

| Topic | Link |
|-------|------|
| Self-hosting quickstart | [docs/self-hosting/quickstart.md](docs/self-hosting/quickstart.md) |
| Configuration reference | [docs/self-hosting/configuration.md](docs/self-hosting/configuration.md) |
| Docker Compose topology | [docs/self-hosting/docker-compose.md](docs/self-hosting/docker-compose.md) |
| Operations and backups | [docs/self-hosting/operations.md](docs/self-hosting/operations.md) |
| Upgrading | [docs/self-hosting/upgrade.md](docs/self-hosting/upgrade.md) |
| Development setup | [docs/development/getting-started.md](docs/development/getting-started.md) |
| Runtime model | [docs/development/runtime-model.md](docs/development/runtime-model.md) |
| Troubleshooting | [docs/development/troubleshooting.md](docs/development/troubleshooting.md) |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Contributing | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Security | [SECURITY.md](SECURITY.md) |
| API docs | `http://localhost:4720/api/docs` (when running) |

## What OpenSEO is not

- Not a general-purpose CMS or website builder.
- Not fully autonomous — AI assists, humans review and publish.
- The agent/MCP integration in `agents/` is documented but not yet shipped as working code.
- There is no test suite yet. CI runs lint and build only.

## License

[GPL-3.0-only](LICENSE)
