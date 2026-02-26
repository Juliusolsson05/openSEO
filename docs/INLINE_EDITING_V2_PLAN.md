# Inline Editing V2 Plan (Per-Element Custom Editors)

Owner: Engineering
Status: Draft for review
Scope: Blog post editor (`/blog/[id]`)

---

## Goal

Deliver stable inline editing for **all complex element types** using **custom editor components per element**, with explicit control of save/cancel behavior and no accidental instant-save.

This replaces the fragile generic inline behavior.

---

## Product Requirements (agreed)

1. Inline editing is required for complex elements (table, faq, timeline, etc.)
2. Each complex element uses a dedicated inline editor (no generic JSON fallback)
3. Admin menu has an **Edit Mode switch** controlling whether inline editing is active
4. Editing must be predictable:
   - no save on first click/focus
   - explicit Save/Cancel for complex elements
   - optional autosave only for simple text elements

---

## Current Issues (why V1 failed)

1. Generic inline logic reused across incompatible data models
2. Save logic tied to focus/blur, causing instant save
3. Missing per-element edit state machine
4. Complex editors need domain-specific UX (table grid, faq blocks, timeline cards)

---

## Design Decisions for V2

### A) Two edit modes by complexity

- **Simple elements** (paragraph/introduction/conclusion/quote/statistic):
  - inline text/rich text
  - autosave allowed (debounced)

- **Complex elements** (table/faq/timeline/pros-cons/versus/list/checklist/recommendations):
  - inline custom editor UI
  - explicit Save + Cancel required
  - no blur-save

### B) Edit mode gate from Admin Menu switch

Single source of truth:
- `isEditModeEnabled` (global for the open post page)
- If false: all elements render view-only + existing action buttons
- If true: elements are clickable for inline edit

### C) Save contract

- Save only if `isDirty === true`
- Save payload always normalized to server shape per element
- On success: commit draft as baseline
- On failure: keep draft, show inline error

---

## Architecture

## 1) Global edit mode + active element context

**Files**
- `src/stores/editor-ui-store.ts` (new)
- `src/components/blog/elements/inline/InlineEditProvider.tsx` (extend)

**State**
- `isEditModeEnabled: boolean`
- `activeElementId: number | null`
- `setEditMode(enabled)`
- `startEditing(elementId)`
- `stopEditing()`

## 2) Per-element draft state

**Files**
- `src/hooks/use-element-draft.ts` (new)

**Responsibilities**
- deep clone initial content
- patch updates
- dirty diff (`isDirty`)
- `reset()` for cancel
- schema-aware normalizers (optional helper)

## 3) Save pipeline

**Files**
- `src/hooks/use-element-save.ts` (new)
- reuse `useElementsStore().updateElement`

**Responsibilities**
- `save(draft)`
- `status: idle | saving | saved | error`
- error message
- optimistic hooks (optional)

---

## Component Plan (per element custom editors)

## Core wrappers

- `src/components/blog/elements/inline/InlineEditorShell.tsx` (new)
  - header actions: Save, Cancel
  - status chip (Saving/Saved/Error)
  - shared keyboard handling (Esc cancel)

- `src/components/blog/elements/inline/InlineActions.tsx` (new)
  - consistent button row

## Complex editors

- `InlineTableEditor.tsx` (new)
  - edit headers
  - add/remove row
  - add/remove column
  - cell editing + tab navigation

- `InlineFAQEditor.tsx` (new)
  - add/remove/reorder FAQ blocks
  - question text + answer rich text

- `InlineTimelineEditor.tsx` (new)
  - add/remove timeline events
  - per-event date/title/description fields

- `InlineProsConsEditor.tsx` (new)
  - managed pros/cons arrays

- `InlineVersusEditor.tsx` (new)
  - side-by-side model editing

- `InlineListBlockEditor.tsx` (new)
  - for list_paragraph + numbered_list_paragraph

- `InlineChecklistEditor.tsx` (new)
  - checklist items with check state + text

- `InlineRecommendationsEditor.tsx` (new)
  - for recommendation-style elements (sectioned item cards)

## Existing simple editors retained/improved

- `InlineText.tsx`
- `InlineRichText.tsx`
- `FloatingToolbar.tsx`
- `SaveIndicator.tsx`

---

## Element-to-editor mapping

- paragraph -> `InlineText + InlineRichText`
- introduction -> `InlineText + InlineRichText`
- conclusion -> `InlineText + InlineRichText`
- list_paragraph -> `InlineListBlockEditor`
- numbered_list_paragraph -> `InlineListBlockEditor`
- faq -> `InlineFAQEditor`
- table -> `InlineTableEditor`
- quote -> `InlineText`
- checklist -> `InlineChecklistEditor`
- statistic -> `InlineText/number inline`
- pros_and_cons -> `InlineProsConsEditor`
- versus -> `InlineVersusEditor`
- timeline -> `InlineTimelineEditor`
- featured_snippet_block -> `InlineText + InlineRichText`
- case_study -> custom section editor (Phase 2)
- tool_recommendation -> custom recommendation editor (Phase 2)
- product_recommendations -> custom recommendation editor (Phase 2)
- affiliate_recommendations -> custom recommendation editor (Phase 2)

---

## Admin Menu switch integration

## UX

Add switch row in Admin Menu:
- Label: `Edit mode`
- Description: `Enable inline editing for elements`
- Control: shadcn `Switch`

## Files

- `src/components/blog/AdminMenu.tsx`
  - add `Switch` import
  - wire to editor-ui store

- `src/stores/editor-ui-store.ts` (new)
  - persisted state optional (`localStorage` keyed by postId)

- `src/app/(dashboard)/blog/[id]/page.tsx`
  - pass edit-mode state via provider

---

## Rollout Plan

## Phase 1 (stability + control)

1. Add `editor-ui-store` and Admin Menu switch
2. Disable all implicit blur saves for complex elements
3. Introduce `InlineEditorShell` with explicit Save/Cancel
4. Standardize dirty check before save

Deliverable: no instant-save bug, predictable editing session

## Phase 2 (complex editors)

1. Table editor
2. FAQ editor
3. Timeline editor
4. Pros/Cons + Versus editors
5. List/checklist editors hardening

Deliverable: each complex element has purpose-built inline UI

## Phase 3 (advanced types)

1. Case study inline sections
2. Tool/product/affiliate recommendation editors
3. Additional keyboard UX, validation polish

Deliverable: near-complete per-element inline parity

---

## QA Checklist (must pass per element)

1. Click enters edit state (only when Edit mode switch is ON)
2. No API call on enter-edit
3. Change data -> dirty indicator appears
4. Save sends exactly one update request
5. Cancel restores baseline data exactly
6. Re-open editor shows saved data
7. Add/remove nested rows/items persists correctly
8. Validation blocks invalid save where required
9. API error shows inline message without losing draft

---

## Risks + Mitigations

1. **Data shape mismatch**
   - Mitigation: per-element normalizer + serializer tests

2. **Performance on large tables/FAQs**
   - Mitigation: local draft updates only; save on action

3. **Concurrent edits while AI regen actions run**
   - Mitigation: lock element while regeneration/enhance/humanize active

4. **Switch confusion**
   - Mitigation: clear ON/OFF indicator and tooltip in Admin Menu

---

## Suggested first implementation ticket sequence

1. `editor-ui-store` + Admin Menu switch
2. `InlineEditorShell` + `use-element-draft` + `use-element-save`
3. Replace current table inline with `InlineTableEditor`
4. Replace current FAQ inline with `InlineFAQEditor`
5. Replace current timeline inline with `InlineTimelineEditor`

This gives immediate high-value fixes on the most brittle complex editors.
