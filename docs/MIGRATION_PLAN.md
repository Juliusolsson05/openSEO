# Aurora Dashboard — Next.js Rewrite Plan

## Overview
Rewrite `aurora_dashboard` (Nuxt 3 + Vue 3 + Vuetify 3) → **Next.js 15 + React 19 + shadcn/ui + Tailwind CSS**.

Source: `../aurora_dashboard` (262 Vue components, 22 pages, 9 stores)

---

## Tech Stack

| Layer | Old | New |
|---|---|---|
| Framework | Nuxt 3 | Next.js 15 (App Router) |
| UI | Vue 3 | React 19 |
| Component lib | Vuetify 3 | shadcn/ui + Radix + Tailwind |
| State | Pinia | Zustand |
| Auth | @sidebase/nuxt-auth (NextAuth) | NextAuth.js v5 (native) |
| Rich text editor | Tiptap (Vue) | Tiptap (React) |
| Charts | ApexCharts / ECharts / Chart.js | Recharts (unified) |
| Markdown | `marked` + DOMPurify | `marked` + DOMPurify (same) |
| HTTP | Nuxt `$fetch` / `useApi` | `fetch` wrapper / React Query |
| i18n | vue-i18n | next-intl |
| Icons | @iconify | lucide-react |
| CSS | Vuetify SCSS + custom | Tailwind CSS + CSS modules |
| Types | TypeScript | TypeScript |

---

## Phase 1 — Scaffold & Core Infra (Day 1-2)

- [x] Create repo `aurora-dashboard-next`
- [ ] `npx create-next-app@latest` with App Router, TypeScript, Tailwind, ESLint
- [ ] Install: shadcn/ui, zustand, next-auth@5, @tanstack/react-query, marked, dompurify, recharts, lucide-react, tiptap react
- [ ] Set up folder structure:
  ```
  app/
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (auth)/forgot-password/page.tsx
    (dashboard)/layout.tsx        ← sidebar + topbar
    (dashboard)/page.tsx          ← analytics
    (dashboard)/blog/page.tsx
    (dashboard)/blog/[id]/page.tsx
    (dashboard)/blog/[id]/preview/page.tsx
    (dashboard)/blog/titles/page.tsx
    (dashboard)/blog/scheduling/page.tsx
    (dashboard)/blog/cta/page.tsx
    (dashboard)/dictionary/page.tsx
    (dashboard)/dictionary/[id]/page.tsx
    (dashboard)/dictionary/[id]/[wordid]/page.tsx
    (dashboard)/dictionary/generate/page.tsx
    (dashboard)/dictionary/generate/keywords/page.tsx
    (dashboard)/elements/page.tsx
    (dashboard)/publishing/page.tsx
    (dashboard)/company-profile/page.tsx
    (dashboard)/settings/page.tsx
  lib/
    api.ts                        ← useApi equivalent (fetch + Company-ID header)
    auth.ts                       ← NextAuth config
    markdown.ts                   ← renderMarkdown / renderMarkdownInline
  stores/
    auth-store.ts
    blog-store.ts
    titles-store.ts
    autopilot-store.ts
    elements-store.ts
    dictionary-store.ts
    cta-store.ts
    analytics-store.ts
    permissions-store.ts
  components/
    ui/                           ← shadcn/ui components
    layout/                       ← sidebar, topbar, nav
    blog/
      elements/                   ← all 25+ blog element components
      titles/
      QuilloChatInterface.tsx
      PostInfoSidepanel.tsx
    dictionary/
    shared/                       ← loading skeletons, error boundaries
  hooks/
    use-api.ts                    ← React Query wrapper
    use-blocked-features.ts
    use-secure-cookie.ts
  ```
- [ ] Configure env vars (same as current `.env.example`)
- [ ] Set up NextAuth with credentials provider (port `server/api/auth/[...].ts`)
- [ ] Auth middleware (port `middleware/auth.global.ts`)
- [ ] API client (`lib/api.ts`) — port `useApi` to fetch + Company-ID header logic

## Phase 2 — Layout & Navigation (Day 2-3)

- [ ] Port `layouts/default.vue` → `(dashboard)/layout.tsx` with sidebar + topbar
- [ ] Port navigation config (`navigation/`)
- [ ] Port `@core` theme config → Tailwind theme
- [ ] Auth layout (`(auth)/layout.tsx`) — port `layouts/blank.vue`
- [ ] Loading skeletons (port 145 `v-skeleton-loader` usages to shadcn Skeleton)
- [ ] Error boundary + not-authorized page

## Phase 3 — Auth & Stores (Day 3-4)

- [ ] Port `stores/auth.ts` → Zustand `auth-store.ts` (login/logout/fetchMe)
- [ ] Port `stores/blog/blogStore.ts` → `blog-store.ts`
- [ ] Port `stores/blog/titlesStore.ts` → `titles-store.ts`
- [ ] Port `stores/blog/autopilotStore.ts` → `autopilot-store.ts`
- [ ] Port `stores/elements/elementsStore.ts` → `elements-store.ts`
- [ ] Port `stores/dictionary/dictionaryStore.ts` → `dictionary-store.ts`
- [ ] Port `stores/cta/ctaStore.ts` → `cta-store.ts`
- [ ] Port `stores/analytics/analyticsStore.ts` → `analytics-store.ts`
- [ ] Port `stores/users/permissionsStore.ts` → `permissions-store.ts`
- [ ] Port CASL ability rules (`@layouts/plugins/casl`)

## Phase 4 — Blog Elements (Day 4-7) ← Biggest chunk

Port all `views/apps/blog/elements/` — each gets a React component + Preview variant:

- [ ] `base.vue` → `BaseElement.tsx` (edit/delete/regenerate wrapper)
- [ ] `BasePreview.vue` → `BasePreview.tsx`
- [ ] `paragraph/` (Paragraph + ParagraphPreview)
- [ ] `introduction/` (Introduction + IntroductionPreview)
- [ ] `conclusion/` (Conclusion + ConclusionPreview)
- [ ] `list_paragraph/` (ListParagraph + ListParagraphPreview)
- [ ] `numbered_list_paragraph/`
- [ ] `table/` (Table + TablePreview)
- [ ] `faq/` (FAQ + FAQPreview)
- [ ] `quote/` (Quote + QuotePreview)
- [ ] `checklist/` (Checklist + ChecklistPreview)
- [ ] `statistic/` (Statistic + StatisticPreview)
- [ ] `pros_and_cons/` (ProsAndCons + ProsAndConsPreview)
- [ ] `versus/` (Versus + VersusPreview)
- [ ] `timeline/` (Timeline + TimelinePreview)
- [ ] `bar_chart/` (BarChart + BarChartPreview)
- [ ] `code_cluster/` (CodeCluster)
- [ ] `snippet_block/` (SnippetBlock + SnippetBlockPreview)
- [ ] `list_snippet_block/`
- [ ] `case_study/` (CaseStudy + CaseStudyPreview)
- [ ] `tool_recommendation/` (ToolRecommendation + ToolRecommendationPreview)
- [ ] `product_recommendations/` (ProductRecommendations + ProductRecommendationsPreview)
- [ ] `call_to_action/` (CallToAction + CallToActionPreview)
- [ ] `image/` (Image)
- [ ] `glossary/` (Glossary + GlossaryPreview)
- [ ] `context/` (Context — table of contents)
- [ ] `poll/` (PollPreview)
- [ ] `quiz/` (QuizPreview)
- [ ] `interactive_calculator/` (InteractiveCalculatorPreview)
- [ ] Edit modal system (`edit/` subfolder — field types: TextField, TextareaField, ArrayField, TableField, ObjectArrayField)
- [ ] Element selection modal
- [ ] `markdown.ts` utility (renderMarkdown + renderMarkdownInline)

## Phase 5 — Pages (Day 7-9)

- [ ] Blog list page (`pages/blog.vue`)
- [ ] Blog post editor (`pages/apps/blog/post/[id].vue`) — the main complex page
- [ ] Blog post preview (`pages/apps/blog/preview/[id].vue`)
- [ ] Blog titles (`pages/blog-titles.vue`)
- [ ] Blog scheduling (`pages/blog-scheduling.vue`)
- [ ] CTA page (`pages/apps/blog/cta.vue`)
- [ ] Dictionary pages (list, detail, word definition, generate, keywords)
- [ ] Elements page
- [ ] Publishing page
- [ ] Analytics dashboard
- [ ] Company profile page
- [ ] Settings page
- [ ] Login / Register / Forgot password

## Phase 6 — Advanced Features (Day 9-11)

- [ ] Quillo chat interface (port `QuilloChatInterface.vue`)
- [ ] LinkedIn post converter + viewer
- [ ] Tiptap editor (port `@core/components/TiptapEditor`)
- [ ] Autopilot orchestration (polling + skeleton loaders)
- [ ] Blog post SEO sidepanel (`PostInfoSidepanel.vue`)
- [ ] Feature blocking system (`useBlockedFeatureModal`)
- [ ] Element drag/reorder

## Phase 7 — Polish & Testing (Day 11-14)

- [ ] Responsive layout (all breakpoints)
- [ ] Loading states and error handling
- [ ] Dark/light theme support
- [ ] i18n (if needed — currently minimal: 13 files)
- [ ] Smoke test all pages
- [ ] Env parity with production

---

## Key Mapping Decisions

### Vuetify → shadcn/ui mapping
| Vuetify | shadcn/ui |
|---|---|
| `v-btn` | `<Button>` |
| `v-card` | `<Card>` |
| `v-dialog` | `<Dialog>` |
| `v-text-field` | `<Input>` |
| `v-textarea` | `<Textarea>` |
| `v-select` | `<Select>` |
| `v-checkbox` | `<Checkbox>` |
| `v-expansion-panels` | `<Accordion>` |
| `v-list` / `v-list-item` | Custom or `<Command>` items |
| `v-data-table` | `<Table>` + `@tanstack/react-table` |
| `v-skeleton-loader` | `<Skeleton>` |
| `v-progress-circular` | `<Spinner>` or custom |
| `v-snackbar` | `<Toast>` (sonner) |
| `v-chip` | `<Badge>` |
| `v-alert` | `<Alert>` |
| `v-tabs` | `<Tabs>` |
| `v-tooltip` | `<Tooltip>` |
| `v-icon` | `lucide-react` icons |

### State: Pinia → Zustand
Same pattern: define store with state + actions. Zustand is simpler (no getters concept — just derive in selectors).

### Auth flow
NextAuth v5 is native to Next.js — the current `@sidebase/nuxt-auth` is a wrapper around it. The credentials provider + JWT callbacks port almost 1:1.

---

## Risks

1. **Tiptap Vue → React**: API is similar but not identical. Editor extensions should work, but custom node views need React rewrite.
2. **SVG charts in BarChart**: Hand-rolled SVG — ports directly to JSX with minor syntax changes.
3. **CASL permissions**: @casl/react exists. Port ability definitions, swap `canNavigate` for React equivalent.
4. **Firebase**: SDK is framework-agnostic. Import paths stay the same.

---

## Estimated Timeline
- Solo dev, focused: **~2-3 weeks**
- With AI-assisted porting of repetitive elements: **~10-14 days**
- MVP (auth + blog + elements working): **~7 days**
