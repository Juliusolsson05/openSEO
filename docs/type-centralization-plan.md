# Type Centralization Plan

## Current State: 506 type definitions across 167 directories

### Problem Summary

Types are scattered everywhere — redefined in page components, duplicated between Edit/Preview pairs, copy-pasted across features, and mixed between server/client boundaries. The same concepts (`BlogTitle`, `Category`, `FAQItem`, `Dictionary`, `SaveStatus`, `ChatMessage`) are defined 3–8 times each with subtly different shapes.

---

## Proposed Structure: `src/types/`

```
src/types/
├── index.ts              # barrel re-export (import from '@/types')
├── api.ts                # API client types (ApiOptions, ApiResponse, ApiMeta, ApiProblem)
├── auth.ts               # AuthUser, UserType, SessionUser
├── blog.ts               # BlogPost, BlogPostElement, BlogTitle, CoverImage, LinkedPost, Category
├── content-elements.ts   # ALL element content shapes (single source of truth)
├── compare.ts            # Comparison tool/page types
├── dictionary.ts         # Dictionary, Word, WordDefinition, FAQ
├── analytics.ts          # Analytics response shapes, metric types
├── publishing.ts         # InboundEnvelope, PublishingApiKey, sync types
├── quillo.ts             # ChatMessage, QuilloMessage, AutopilotLog, AutopilotOperation
├── image.ts              # ImageStudioProvider, HistoryEntry, GenerateResult
├── search.ts             # GlobalSearchItem, NotificationFeedItem
├── settings.ts           # SettingsDomain, GenerationSettings
├── schedule.ts           # BulkSchedule, scheduling types
├── tasks.ts              # TaskStatus, TaskLog, TaskRecord
├── common.ts             # SaveStatus, SortKey, SortDir, Rarity, shared primitives
└── next-auth.d.ts        # (stays — module augmentation)
```

---

## Migration: 7 Phases

### Phase 1: Foundation — `common.ts` + `auth.ts` + `api.ts`
**Kill 3x duplicate `SaveStatus`, centralize `AuthUser`, unify API types.**

| Move from | Move to | Types |
|---|---|---|
| `hooks/use-auto-save.ts` | `common.ts` | `SaveStatus` |
| `hooks/use-element-save.ts` | `common.ts` | _(remove, import)_ |
| `elements/inline/InlineEditorShell.tsx` | `common.ts` | _(remove, import)_ |
| `stores/auth-store.ts` | `auth.ts` | `AuthUser`, `UserType`, `USER_TYPES` |
| `server/api/handler.ts` | `auth.ts` | `SessionUser`, `HandlerContext` |
| `server/api/response.ts` | `api.ts` | `ApiMeta`, `ApiSuccessResponse`, `ApiProblem`, `ApiErrorResponse` |
| `lib/api.ts` | `api.ts` | `ApiOptions`, `ApiResponse` |

**Effort:** Small. ~15 files updated.

---

### Phase 2: Blog Core — `blog.ts`
**Kill 8x `BlogTitle`, 3x `Dictionary`, 4x `Category`.**

| Move from | Move to | Types |
|---|---|---|
| `stores/types.ts` | `blog.ts` | `BlogPost`, `BlogPostElement`, `BlogTitle`, `LinkedPost`, `Category`, `CoverImage`, `HyperlinkData` |
| `stores/analytics-store.ts` | _(remove inline BlogTitle)_ | Import from `blog.ts` |
| `(dashboard)/blog/page.tsx` | _(remove inline)_ | Import from `blog.ts` |
| `(dashboard)/blog/scheduling/page.tsx` | _(remove inline BlogTitle, Category)_ | Import from `blog.ts` |
| `components/analytics/*.tsx` | _(remove 6 local BlogTitle variants)_ | Import from `blog.ts` |
| `components/blog/BlogCategoriesTable.tsx` | _(remove inline)_ | Import from `blog.ts` |
| `server/ai/categories/categorize-titles.ts` | _(remove inline)_ | Import from `blog.ts` |

**Effort:** Medium. ~20 files. Some shapes are slightly different (e.g. `BlogTitle` in analytics has fewer fields) — use `Pick<BlogTitle, 'id' | 'title_text'>` at usage site.

---

### Phase 3: Element Content Types — `content-elements.ts`
**The biggest win. Kill ~50 duplicate content type definitions.**

Every element type (FAQ, Table, Timeline, Checklist, ProsAndCons, Versus, BarChart, Quiz, Poll, etc.) has its content shape defined separately in both the Edit component and the Preview component. Unify into one file:

```ts
// src/types/content-elements.ts

export interface FAQItem { question: string; answer: string }
export interface FAQContent { title?: string; items: FAQItem[] }

export interface ChecklistItem { text?: string; action?: string; checked?: boolean }
export interface ChecklistContent { title?: string; items?: ChecklistItem[] }

export interface TimelineEvent { title: string; description: string }
export interface TimelineContent { title?: string; items: TimelineEvent[] }

export interface GlossaryTerm { term: string; definition: string }
export interface GlossaryContent { title?: string; items: GlossaryTerm[] }

export interface VersusCriterion { /* ... */ }
export interface VersusContent { /* ... */ }

export interface BarItem { label: string; value: number }
export interface BarChartContent { title?: string; description?: string; items: BarItem[]; datasets?: /* ... */ }

export interface QuizQuestion { /* ... */ }
export interface QuizContent { /* ... */ }

export interface PollContent { /* ... */ }

export interface TableContent { title?: string; headers: string[]; rows: string[][] }

export interface ProsAndConsContent { title?: string; pros: string[]; cons: string[] }

export interface CaseStudyContent { title: string; problem?: string; solution?: string; result?: string }

export interface ToolRecommendationContent { name: string; description: string; use_case?: string; url?: string }

export interface ProductRecommendation { /* ... */ }
export interface ProductRecommendationsContent { title?: string; introduction?: string; products: ProductRecommendation[] }

export interface InteractiveCalculatorContent { /* ... */ }

// Master union for element content
export type ElementContent =
  | FAQContent
  | ChecklistContent
  | TimelineContent
  | TableContent
  | ProsAndConsContent
  | VersusContent
  | BarChartContent
  // ... etc
```

Also move from `components/blog/elements/types.ts`:
- `ElementType` (union of element type strings)
- `EditFieldType`, `EditField`, `EditSchema`, `ValidationRule`

**Files touched:** ~40 element components (remove local type, add import).

**Effort:** Large but mechanical. Search-and-replace with one import line.

---

### Phase 4: Dictionary + Public Content — `dictionary.ts`
**Kill the `Public*` / `Example*` duplication.**

`src/server/public-content/types.ts` and `src/app/example/_lib/types.ts` are identical except for the prefix. Unify:

```ts
// src/types/dictionary.ts

export interface ContentElement {
  id: string
  order: number
  element_type: string
  content: Record<string, any>
}

export interface ContentPost {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image_url: string
  published_at: string
  elements: ContentElement[]
}

export interface FAQ { question: string; answer: string }

export interface WordDefinition {
  featured_snippet: string
  paragraph_1: string
  paragraph_2: string
  paragraph_3: string
  synonyms: string[]
  antonyms: string[]
  usage_examples: string[]
  related_keywords: string[]
  faqs: FAQ[]
}

export interface Word {
  id: string
  keyword: string
  definition: WordDefinition
}

export interface DictionaryData {
  id: string
  name: string
  description: string
  word_count: number
  words: Word[]
}
```

Delete both `public-content/types.ts` and `example/_lib/types.ts`. Update ~12 imports.

**Effort:** Small. Direct 1:1 replacement.

---

### Phase 5: AI + Server Types — `quillo.ts` + `publishing.ts` + `tasks.ts`
**Kill 7x `ChatMessage`/`Message` and 6x `InboundEnvelope`.**

```ts
// src/types/quillo.ts
export interface ChatMessage { role: 'user' | 'assistant' | 'system'; content: string }
export type { AutopilotStage, AutopilotLogType, AutopilotLog, AutopilotLogData,
  AutopilotOperation, RecommendationSummary, ImprovementSummary, ImageSummary } // from stores/types.ts

// src/types/publishing.ts
export interface InboundEnvelope { company_id: number; /* ... */ }
export interface RawElement { id: unknown; order: number; element_type: string; content: unknown }

// src/types/tasks.ts
export type TaskStatus = 'accepted' | 'running' | 'completed' | 'failed'
export interface TaskLog { stage: string; type: string; timestamp: string; data?: Record<string, unknown> }
```

**Effort:** Medium. ~15 files.

---

### Phase 6: Compare + Analytics + Settings — remaining modules
**Clean up remaining isolated type clusters.**

- `compare.ts`: Move from `landing/compare/_lib/types.ts` (already well-organized, just relocate)
- `analytics.ts`: Consolidate from `stores/analytics-store.ts` + `components/analytics/*.tsx`
- `settings.ts`: From dashboard settings pages + `services/settings.service.ts`
- `image.ts`: From `ImageStudio/types.ts` + `server/ai/image/*.ts`
- `search.ts`: From `services/global-search.service.ts` + `services/notification-feed.service.ts` + `components/layout/topbar.tsx`
- `schedule.ts`: From `stores/types.ts` + scheduling page + service/repo

**Effort:** Medium. ~25 files.

---

### Phase 7: Cleanup + Icon type
**The 23 identical `IconProps` copies.**

Every element has its own `Icon.tsx` with:
```ts
type IconProps = Pick<SVGProps<SVGSVGElement>, 'className'> & { size?: number }
```

Add to `common.ts`:
```ts
export type IconProps = Pick<SVGProps<SVGSVGElement>, 'className'> & { size?: number }
```

Update 23 Icon files to import it.

Also: remove the now-empty `stores/types.ts`, `server/public-content/types.ts`, `example/_lib/types.ts`.

**Effort:** Small but tedious. 23 files.

---

## Migration Rules

1. **Component `Props` types stay local** — `interface Props { ... }` in a component file is fine and idiomatic React. Don't centralize these.

2. **Validator-inferred types stay in validators** — The `z.infer<>` exports in `server/validators/*.ts` are co-located with their schemas. This is correct. Don't move them.

3. **Repository arg types stay in repos** — `CreateElementArgs`, `FindManyFilters` etc. are tightly coupled to their Prisma queries. Keep them.

4. **Service payload types stay in services** — `UpdateCategoryPayload`, `CreateBulkSchedulePayload` etc. are internal API contracts. Keep them.

5. **Only move types that are SHARED** — If a type is used in >1 file or represents a domain concept, centralize it. If it's only used in the file it's defined in, leave it.

---

## What NOT to centralize (65 `Props` + ~80 local-only types)

- Component `Props`/`interface Props` — 65 instances, all local. Leave them.
- Repository/service/validator types — internal contracts, co-located correctly.
- Route-specific `PageProps`, `RouteParams` — local to their route file.
- One-off local types used only within their file.

---

## Estimated Impact

| Metric | Before | After |
|---|---|---|
| Type definition locations | 506 across ~100 files | ~200 local + ~130 centralized |
| Duplicate type names | ~50 pairs | 0 |
| Files with duplicate shapes | ~80 | 0 |
| Import clarity | scattered | `import { BlogTitle, Category } from '@/types'` |

---

## Execution Order (recommended)

```
Phase 1 (foundation)     → commit → verify tsc
Phase 2 (blog core)      → commit → verify tsc
Phase 3 (content elements)→ commit → verify tsc
Phase 4 (dictionary)     → commit → verify tsc
Phase 5 (AI/server)      → commit → verify tsc
Phase 6 (remaining)      → commit → verify tsc
Phase 7 (icons + cleanup)→ commit → verify tsc → push
```

Each phase is independently safe. If anything breaks, the scope is small enough to bisect.

**Total estimated effort:** ~150 files touched, ~3-4 hours of mechanical refactoring. Zero business logic changes — pure type moves and import updates.
