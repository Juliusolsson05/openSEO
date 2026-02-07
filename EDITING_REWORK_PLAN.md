# Element Editing System — Rework Plan

## Current State (What's Broken)

### Architecture
```
BaseElement (hover actions) → BaseEdit (modal dialog) → EditFieldRenderer → Field components
```

### Problems

1. **Complex field types are JSON textarea fallbacks**: `table`, `dynamic-table`, `faq`, `pros-cons`, `versus` all render as raw JSON textareas — users have to edit JSON by hand. The OG Vue had specialized components for each (TableField.vue, FaqField.vue, VersusField.vue, ProsConsField.vue, DynamicTableField.vue, ArrayObjectField.vue — 1,713 lines total). We only ported 5 of 17 field types.

2. **Missing field components** (not ported from Vue):
   - `FaqField` — should render question/answer pairs with add/remove
   - `TableField` — should render header editor + dynamic row editor
   - `DynamicTableField` — should render editable table grid from column schema
   - `ProsConsField` — should render two-column pros/cons lists
   - `VersusField` — should render side-by-side item comparison editor
   - `ArrayObjectField` — should render array of objects with sub-field forms
   - `NestedArrayField` — should render nested arrays
   - `RichTextField` — should render a rich text editor (not just a textarea)
   - `ObjectField` — should render grouped sub-fields
   - `PercentageField` — should render slider/input with 0-100 constraint

3. **Modal-only editing is clunky**: Every edit requires: hover → click pencil → modal opens → find field → edit → save → modal closes → page refetches. Too many clicks for simple text changes.

4. **No validation feedback**: Schemas define validation rules (`required`, `min`, `max`, `minLength`, etc.) but the UI never shows validation errors.

5. **No autosave / debounce**: Every save requires explicit button click + full post refetch.

6. **Content structure mismatch**: Some elements store content differently than the edit schema expects (e.g., FAQ uses `passthrough: true` to pass entire content array, but the renderer doesn't handle all passthrough cases correctly).

---

## Proposed Rework — 3 Layers

### Layer 1: Fix the Modal Editor (required, do first)

Port all missing specialized field components. This makes the existing modal editor functional for all element types.

| Component | Vue Source | Lines | Priority |
|---|---|---|---|
| `FaqField.tsx` | `FaqField.vue` | 116 | HIGH — FAQ is one of the most used elements |
| `TableField.tsx` | `TableField.vue` | 146 | HIGH — tables are common |
| `DynamicTableField.tsx` | `DynamicTableField.vue` | 165 | HIGH — used by TableField |
| `ProsConsField.tsx` | `ProsConsField.vue` | 192 | MEDIUM |
| `VersusField.tsx` | `VersusField.vue` | 182 | MEDIUM |
| `ArrayObjectField.tsx` | `ArrayObjectField.vue` | 156 | HIGH — used by FAQ, timeline, etc. |
| `NestedArrayField.tsx` | `NestedArrayField.vue` | 142 | LOW |
| `ObjectField.tsx` | `ObjectField.vue` | 78 | MEDIUM — recursive sub-fields |
| `PercentageField.tsx` | `PercentageField.vue` | 54 | LOW |
| `RichTextField.tsx` | `RichTextField.vue` | 65 | HIGH — needs TipTap or similar |

**Total: ~1,296 lines to port.**

Also fix:
- Wire validation display (red borders, error messages under fields)
- Fix passthrough content handling for FAQ, table, etc.
- Add loading states during save

### Layer 2: Inline Editing (the Google Docs experience)

Make elements directly editable on the page — click text to edit it in place.

#### How it works:

1. **Element enters edit mode on click** — instead of opening a modal, the element itself becomes editable
2. **Text fields become contentEditable** — click on a paragraph title/text → it becomes an editable area with a subtle border
3. **Structured fields get inline editors** — click on a FAQ item → inline expand with question/answer inputs
4. **Auto-save with debounce** — changes save automatically after 1.5s of inactivity (like Google Docs)
5. **Toolbar appears on selection** — bold, italic, link actions for rich text
6. **Escape to cancel, blur to save**

#### Architecture:

```
InlineEditProvider (context)
├── useInlineEdit(elementId, content)  — hook managing edit state
├── InlineText — click-to-edit text/textarea replacement
├── InlineRichText — TipTap-powered rich text with floating toolbar
├── InlineList — click to edit list items, +/- buttons
├── InlineFAQ — expandable Q&A pairs
├── InlineTable — spreadsheet-like cell editing
└── InlineSave — auto-save indicator ("Saving..." / "Saved ✓")
```

#### Per-element inline edit components:

| Element | Inline behavior |
|---|---|
| `paragraph` | Title = InlineText, text = InlineRichText |
| `introduction` | Same as paragraph |
| `conclusion` | Same as paragraph |
| `list_paragraph` | Title + InlineList for items |
| `numbered_list_paragraph` | Same with numbered styling |
| `faq` | Title + expandable InlineFAQ items |
| `table` | Title + InlineTable (spreadsheet cells) |
| `quote` | Quote text = InlineText, author = InlineText |
| `checklist` | Title + InlineList with checkboxes |
| `statistic` | Number + label + source inline inputs |
| `pros_and_cons` | Two InlineLists side by side |
| `versus` | Two-column inline comparison |
| `timeline` | Expandable event cards with inline fields |
| `bar_chart` | Not inline-editable (use modal) |
| `case_study` | Expandable sections with inline text |
| `tool_recommendation` | Complex — modal only |
| `product_recommendations` | Complex — modal only |
| `image` | Keep Image Studio (already good) |

#### Key dependency: Rich text editor

Need **TipTap** (headless, React-native, used by Notion/Linear):
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
```

TipTap gives us:
- ContentEditable with React integration
- Floating toolbar on selection
- Markdown-like shortcuts (## for heading, ** for bold)
- HTML input/output (our content is HTML)
- Collaborative editing ready (future)

### Layer 3: Polish & Advanced Features (future)

- **Drag-to-reorder elements** — drag handle on hover
- **Undo/redo** — Ctrl+Z across element edits
- **Collaborative cursors** — if multi-user editing is needed
- **Element templates** — save an element as a reusable template
- **Keyboard shortcuts** — Tab to next element, Shift+Tab to previous

---

## Implementation Order

### Phase A — Fix Modal Editor (2-3 hours, parallelizable)
1. Port `ArrayObjectField.tsx` (used by many)
2. Port `FaqField.tsx` (uses ArrayObjectField)
3. Port `DynamicTableField.tsx`
4. Port `TableField.tsx` (uses ArrayField + DynamicTableField)
5. Port `ProsConsField.tsx`
6. Port `VersusField.tsx`
7. Port `ObjectField.tsx`
8. Port `NestedArrayField.tsx`
9. Port `PercentageField.tsx`
10. Add validation display to all fields
11. Fix passthrough content handling
12. Wire into EditFieldRenderer switch cases

### Phase B — Inline Editing Foundation (3-4 hours)
1. Install TipTap
2. Create `InlineEditProvider` context (manages which element is in edit mode)
3. Create `InlineText` component
4. Create `InlineRichText` component (TipTap)
5. Create auto-save hook (`useAutoSave`)
6. Wire into `paragraph`, `introduction`, `conclusion` elements
7. Create floating toolbar for rich text

### Phase C — Inline Editing for Complex Elements (3-4 hours)
1. Create `InlineList` component
2. Create `InlineFAQ` component
3. Create `InlineTable` component (spreadsheet-like)
4. Wire into remaining element types
5. Add visual indicators (edit mode border, save status)

### Phase D — UX Polish (1-2 hours)
1. Keyboard navigation (Tab between elements)
2. Click-outside to save and deselect
3. Loading/error states during save
4. Smooth transitions between view/edit modes
5. Mobile-friendly touch targets

---

## Files to Create/Modify

### New files:
```
src/components/blog/elements/edit/fields/FaqField.tsx
src/components/blog/elements/edit/fields/TableField.tsx
src/components/blog/elements/edit/fields/DynamicTableField.tsx
src/components/blog/elements/edit/fields/ProsConsField.tsx
src/components/blog/elements/edit/fields/VersusField.tsx
src/components/blog/elements/edit/fields/ArrayObjectField.tsx
src/components/blog/elements/edit/fields/NestedArrayField.tsx
src/components/blog/elements/edit/fields/ObjectField.tsx
src/components/blog/elements/edit/fields/PercentageField.tsx
src/components/blog/elements/edit/fields/RichTextField.tsx
src/components/blog/elements/inline/InlineEditProvider.tsx
src/components/blog/elements/inline/InlineText.tsx
src/components/blog/elements/inline/InlineRichText.tsx
src/components/blog/elements/inline/InlineList.tsx
src/components/blog/elements/inline/InlineFAQ.tsx
src/components/blog/elements/inline/InlineTable.tsx
src/components/blog/elements/inline/FloatingToolbar.tsx
src/hooks/use-auto-save.ts
```

### Modified files:
```
src/components/blog/elements/edit/EditFieldRenderer.tsx — add missing cases
src/components/blog/elements/BaseElement.tsx — add inline edit mode
src/components/blog/elements/BaseEdit.tsx — add validation display
src/components/blog/elements/paragraph/Paragraph.tsx — add inline editing
src/components/blog/elements/introduction/Introduction.tsx — add inline editing
src/components/blog/elements/conclusion/Conclusion.tsx — add inline editing
src/components/blog/elements/faq/FAQ.tsx — add inline editing
src/components/blog/elements/table/Table.tsx — add inline editing
(+ all other element components)
src/stores/elements-store.ts — add debounced update method
```

---

## Decision Points

1. **TipTap vs Slate vs Lexical** — Recommend TipTap (best DX, headless, lightweight)
2. **Auto-save strategy** — Debounce 1.5s after last keystroke, show "Saving..." indicator
3. **Concurrent edits** — For now, last-write-wins; collaborative editing is Layer 3
4. **Which elements stay modal-only** — `bar_chart`, `tool_recommendation`, `product_recommendations` (too complex for inline)
5. **Rich text scope** — Bold, italic, links, lists. No images/embeds inside elements (those are separate element types)
