# OpenSEO

OpenSEO is a self-hostable AI-powered SEO content platform for generating, editing, analyzing, and publishing long-form content.

## What is included

- AI-assisted blog generation workflow
- Block-based editor with rich content elements
- Dictionary and glossary generation
- Publishing API and public content rendering
- Company-scoped workspaces, analytics, scheduling, and CTA management

## Local development

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Start infrastructure with `docker compose up -d postgres redis`
4. Run Prisma migrations with `npx prisma migrate dev`
5. Start the app with `npm run dev`
6. Open `http://localhost:4720`
7. Finish first-run onboarding at `/setup`

If you prefer to run the app entirely in containers, `docker compose up --build` now starts the app, Postgres, and Redis together.

## One-command install

For a guided local install, run:

```bash
./install.sh
```

The script creates `.env`, starts Docker services, runs Prisma migrations, waits for the app to become healthy, and then sends you to `/setup` for the first admin account.

## Environment variables

The project currently supports provider configuration through environment variables. The next OSS step is moving provider secrets into an encrypted in-app vault.

Start from `.env.example` and configure at minimum:

- `AUTH_SECRET`
- `OPENSEO_ENCRYPTION_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `FRONTEND_URL`
- `NEXT_PUBLIC_SITE_URL`

AI and media provider keys are only required for the features you use.

## Roadmap to public OSS launch

- Replace environment-based provider secrets with an encrypted settings vault
- Add a first-run `/setup` onboarding flow
- Add `install.sh` for one-command setup
- Finalize license, CI, and public docs

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - build for production
- `npm run start` - run the production server
- `npm run lint` - run ESLint
