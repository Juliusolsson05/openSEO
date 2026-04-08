---
name: element-engine
description: How to build the element rendering engine — component mapper, fallback rendering, HTML sanitization, image URL resolution, and legacy field handling. Use when implementing the blog's content rendering layer.
user-invocable: false
---

# Element Rendering Engine

The core of the blog. Takes an element's `element_type` and `content` object, returns the right UI component.

## Architecture

Build a single mapping from element type string to render function. Every element in a post passes through this mapper.

```typescript
// components/elements/index.ts

import { Paragraph } from './Paragraph'
import { ListParagraph } from './ListParagraph'
import { NumberedListParagraph } from './NumberedListParagraph'
import { ImageElement } from './ImageElement'
import { Quote } from './Quote'
import { FeaturedSnippet } from './FeaturedSnippet'
import { Faq } from './Faq'
import { Conclusion } from './Conclusion'
import { Introduction } from './Introduction'
import { CallToAction } from './CallToAction'
import { Glossary } from './Glossary'
import { Versus } from './Versus'
import { DataTable } from './DataTable'
import { ProsAndCons } from './ProsAndCons'
import { CaseStudy } from './CaseStudy'
import { Checklist } from './Checklist'
import { Statistic } from './Statistic'
import { Timeline } from './Timeline'
import { BarChart } from './BarChart'
import { ToolRecommendation } from './ToolRecommendation'
import { CodeCluster } from './CodeCluster'
import { ProductRecommendations } from './ProductRecommendations'

const elementMap: Record<string, React.ComponentType<{ content: any }>> = {
  paragraph: Paragraph,
  list_paragraph: ListParagraph,
  numbered_list_paragraph: NumberedListParagraph,
  image: ImageElement,
  quote: Quote,
  featured_snippet_block: FeaturedSnippet,
  faq: Faq,
  conclusion: Conclusion,
  introduction: Introduction,
  call_to_action: CallToAction,
  glossary: Glossary,
  versus: Versus,
  table: DataTable,
  pros_and_cons: ProsAndCons,
  case_study: CaseStudy,
  checklist: Checklist,
  statistic: Statistic,
  timeline: Timeline,
  bar_chart: BarChart,
  tool_recommendation: ToolRecommendation,
  code_cluster: CodeCluster,
  product_recommendations: ProductRecommendations,
}

export function renderElement(element: { element_type: string; content: any }) {
  const Component = elementMap[element.element_type]

  if (!Component) {
    // Fallback: render title + text if they exist
    return <FallbackElement content={element.content} />
  }

  return <Component content={element.content} />
}
```

## Rendering a post

Loop through elements sorted by `order`. Each element is independent — no element depends on another.

```tsx
// components/PostBody.tsx

export function PostBody({ elements }: { elements: Element[] }) {
  const sorted = [...elements].sort((a, b) => a.order - b.order)

  return (
    <article>
      {sorted.map((element) => (
        <section key={element.id}>
          {renderElement(element)}
        </section>
      ))}
    </article>
  )
}
```

## Fallback rendering

New element types may be added. Always include a fallback that renders `content.title` as a heading and `content.text` as a paragraph. This prevents blank gaps if the blog encounters an unknown type.

```tsx
function FallbackElement({ content }: { content: any }) {
  return (
    <div>
      {content.title && <h2>{content.title}</h2>}
      {content.text && <div dangerouslySetInnerHTML={{ __html: sanitize(content.text) }} />}
    </div>
  )
}
```

## HTML sanitization

Text fields may contain basic HTML (bold, italic, links). Always sanitize before rendering with `dangerouslySetInnerHTML`.

Use DOMPurify:

```typescript
import DOMPurify from 'isomorphic-dompurify'

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  })
}
```

Apply `sanitize()` to every text field before rendering it as HTML. Fields that are plain text (labels, dates, values) can be rendered directly.

## Image URL resolution

Image elements and cover images may have different URL formats. Resolve them:

```typescript
function resolveImageUrl(url: string, baseUrl?: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url // absolute — use as-is
  }
  if (url.startsWith('/')) {
    return `${baseUrl || ''}${url}` // relative to base
  }
  return `${baseUrl || ''}/media/${url}` // bare filename
}
```

## Legacy field handling

Some element types have field aliases from older content versions. Handle these in the component:

**Call to Action:**
- Button URL: use `content.button_href ?? content.target_url ?? content.link`
- Image: use `content.image_url ?? content.image`

**FAQ:**
- Content may be a bare array instead of `{ title, items }`. Normalize:
```typescript
function normalizeFaq(content: any) {
  if (Array.isArray(content)) {
    return { title: 'FAQ', items: content }
  }
  return content
}
```

## Component guidelines

Each component receives `content` typed to its specific shape. Refer to the `element-shapes` skill for the exact fields of each element type.

General rules:
- All `title` fields render as `<h2>` (section headings within the post)
- Text fields that support HTML use `dangerouslySetInnerHTML` with sanitization
- Optional fields should be conditionally rendered — do not show empty sections
- List items in arrays (`list_items`, `pros`, `cons`, `results`, etc.) map to `<li>` elements
- The `hyperlink` field on elements contains dictionary match data — see the `dictionary-hyperlinking` skill for how to render these

## Non-React frameworks

The same pattern applies in any framework:

- **Astro:** Use a `switch` or object map in a `.astro` component
- **Vue:** Use a dynamic `<component :is="...">` with a type-to-component map
- **Svelte:** Use `{#if}` / `{:else if}` blocks or a `<svelte:component>` with a map
- **Plain HTML/JS:** Use a function that returns an HTML string per type, then set `innerHTML`

The key concept is the same everywhere: element type → component lookup → render content.
