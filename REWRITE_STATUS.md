# Aurora Dashboard Rewrite — Master Plan & Progress

## Goal
Rewrite Aurora Dashboard from **Nuxt 3 + Vue 3 + Vuetify** to **Next.js + React + Tailwind/shadcn** while keeping API behavior and core product flows intact.

---

## Source / Target
- **Source app:** `aurora_dashboard` (Vue/Nuxt)
- **Rewrite app:** `aurora-dashboard-next` (React/Next)

---

## Planned Phases

## Phase 1 — Scaffold & Core Infrastructure
**Scope**
- Bootstrap Next.js project
- Set up core dependencies
- Port auth foundation
- Port API client behavior
- Port core store primitives
- Create initial route skeletons

**Status:** ✅ Completed

**Implemented**
- Next.js app scaffolded with TS + Tailwind + ESLint
- Core libs added: zustand, next-auth, react-query, marked, dompurify, recharts, lucide
- TipTap React deps installed
- Env setup (`.env.example`, `.env.local`)
- NextAuth credentials provider wired to backend login endpoint
- API client (`src/lib/api.ts`) implemented with:
  - `credentials: include`
  - `Company-ID` header support
  - query params + JSON/form helpers
- Route skeleton parity established for all key app areas:
  - auth, blog, analytics, dictionary, elements, publishing, settings
- Core Zustand stores added:
  - `auth-store`, `blog-store`, `titles-store`, `analytics-store`, `permissions-store`
  - plus missing stores added later: `autopilot-store`, `elements-store`, `cta-store`, `dictionary-store`
- Shared type layer added (`src/stores/types.ts`)
- Markdown utility ported (`renderMarkdown`, `renderMarkdownInline`)
- Basic UI layer created (`button`, `card`, `input`, `skeleton`)
- Hook layer added:
  - `use-api`, `use-blocked-features`, `use-secure-cookie`
- Proxy/auth gate added (`src/proxy.ts`)

**Validation**
- `npm run lint` ✅
- `next build` ✅

---

## Phase 2 — Layout & Navigation Foundation
**Scope**
- Port layout shell and navigation model
- Add shared loading/error surfaces
- Add not-authorized flow
- Align theme/navigation config layer

**Status:** ✅ Foundation Completed

**Implemented**
- Dashboard shell in place:
  - sidebar + topbar + app frame
- Navigation centralized in `src/lib/navigation.ts`
  - ported from production vertical nav model
- Theme config module introduced (`src/lib/theme.ts`)
- Shared UX states introduced:
  - `PageSkeleton`
  - `ErrorState`
- Added `/not-authorized` page
- Wired shared loading/error states into key pages (analytics + blog post page)
- Next config improved:
  - `turbopack.root` set
  - remote image config
  - migrated to `proxy.ts` convention

**Validation**
- `npm run lint` ✅
- `next build` ✅

---

## Phase 3 — Auth/ACL + Store Maturation
**Scope**
- Complete parity for auth flow behavior
- Improve permission/ACL checks
- Mature stores to feature-complete versions

**Status:** 🟡 In Progress

**Done so far**
- Credentials auth/login/logout base flow works at infrastructure level
- Permissions store and blocked-feature hook exist

**Remaining**
- Route-level ACL parity with current Vue/CASL behavior
- Full auth session parity (cookie/session edge cases)
- Complete behavior parity for all store actions and optimistic flows

---

## Phase 4 — Blog Elements Migration (Largest Phase)
**Scope**
- Port all blog element components + previews
- Port edit schema/field system
- Port element registry, mapping, icons, examples

**Status:** ⏳ Not Started (structure prepared)

**Remaining**
- BaseElement, BasePreview
- All element components (`paragraph`, `table`, `faq`, `timeline`, etc.)
- Edit modal system and field components
- Element resolver layer parity (`elements.ts` equivalent)

---

## Phase 5 — Feature Pages Parity
**Scope**
- Port production page logic from placeholders to real behavior

**Status:** 🟡 Started (skeleton routes exist)

**Remaining**
- Blog list and filters
- Blog post editor/preview complete behavior
- Titles/scheduling workflow
- Dictionary generation/review workflow
- Publishing/settings/company profile parity

---

## Phase 6 — Advanced Features
**Scope**
- Quillo chat
- Autopilot UX
- LinkedIn conversion flow
- Tiptap editor integration at production parity

**Status:** 🟡 Very Early (stubs only)

**Done so far**
- Stub components created for Quillo/PostInfo sidepanel
- Autopilot store scaffold exists

---

## Phase 7 — QA, Hardening & Polish
**Scope**
- Comprehensive QA
- Responsive and UX polish
- Performance checks
- Regression checklist against old app

**Status:** ⏳ Not Started

---

## Current Snapshot
- Rewrite repo has a stable, buildable foundation.
- Infra is ready for heavy component/page migration.
- Next priority should be **Phase 3 completion + Phase 4 element migration**.

---

## Recommended Next Execution Order
1. Finish Phase 3 auth/ACL parity
2. Port element registry + BaseElement/Preview
3. Migrate top 8 highest-usage elements first (paragraph/table/faq/introduction/conclusion/list/quote/image)
4. Wire blog post page to real element renderer
5. Expand to remaining elements + edit schemas

---

## Commands Used for Validation
- `npm run lint`
- `npx next build`

Both currently pass.
