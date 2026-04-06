# OpenSEO Agents

Agentic tooling for using OpenSEO with AI coding assistants like Claude Code.

## What this is

OpenSEO's AI generation is good at structured SEO tasks — keyword research, dictionary generation, element planning. But general-purpose LLMs like Claude are better writers. Instead of fighting this, we lean into it: Claude Code becomes the primary writing interface, and OpenSEO becomes the management, SEO optimization, and publishing platform.

This directory contains everything needed to use OpenSEO agentically:

```
agents/
├── mcp/          # MCP server — exposes OpenSEO's API as tools Claude Code can call
│   └── src/
│       ├── index.ts
│       └── tools/
└── skills/       # Skill/instruction files — teach Claude Code how to use OpenSEO
```

## MCP Server

A Model Context Protocol server that bridges Claude Code and OpenSEO. Authenticated via the existing inbound API key system. Runs as a stdio subprocess spawned by Claude Code.

**What it exposes:**

- **Post management** — list, read, create, update, delete blog posts
- **Element CRUD** — read and write structured content elements (paragraph, faq, checklist, etc.)
- **Dictionary access** — read dictionaries and terms so Claude can naturally incorporate keywords while writing
- **Categories** — list and manage post categories
- **Publishing** — trigger sync to external systems, check job status
- **Specialized AI tools** — humanize, enhance, etc. These return *suggestions* back to Claude, not final writes. Claude decides what to keep and what to rework.

**What it does NOT do:**

- Dictionary/term generation — that stays server-side using OpenSEO's own AI pipeline
- Direct database access — the MCP server hits the OpenSEO HTTP API, it never touches Prisma directly

## Skills

Markdown instruction files that Claude Code loads as context. They make Claude an OpenSEO expert for two use cases:

### Content creation
- How to write blog posts using OpenSEO's element system
- All 22 element types with their JSON content shapes
- When to use which element type (e.g. use `faq` for question/answer, `checklist` for actionable lists)
- How to structure a post (introduction → body elements → conclusion)
- How to read dictionary terms and naturally weave keywords into content
- How to use the humanize/enhance suggestion tools and when to accept vs. override

### Website integration
- How to consume the publishing API on a frontend
- How to render each element type (code examples per framework)
- How to implement dictionary hyperlinking with `matched_positions`
- How to handle image URL resolution, cover images, legacy field aliases
- The full envelope format, authentication, idempotency, and error handling

## The workflow

1. User opens Claude Code in their project
2. Claude Code connects to the OpenSEO MCP server (configured in `.claude/settings.json`)
3. User says "write a blog post about conversion rate optimization"
4. Claude reads the company's dictionary terms via MCP (for keyword context)
5. Claude writes the post as structured elements, guided by the skills
6. Claude posts the elements back to OpenSEO via MCP
7. OpenSEO applies dictionary hyperlinking, SEO analysis, and stores the post
8. User reviews, edits, and publishes from the OpenSEO dashboard

## Auth

Uses the existing inbound API key system. Generate a key in Settings → Inbound API Keys, then configure it in the MCP server's environment:

```json
{
  "mcpServers": {
    "openseo": {
      "command": "node",
      "args": ["./agents/mcp/dist/index.js"],
      "env": {
        "OPENSEO_API_URL": "http://localhost:3000",
        "OPENSEO_API_KEY": "<your-inbound-api-key>"
      }
    }
  }
}
```
