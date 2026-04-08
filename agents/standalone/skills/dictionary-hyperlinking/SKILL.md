---
name: dictionary-hyperlinking
description: How to implement the automatic dictionary hyperlink system for blog posts. Use when rendering hyperlinked text, implementing dictionary term linking, or working with matched_positions data on elements.
user-invocable: false
---

# Dictionary Hyperlinking

How the automatic hyperlink system works and how to implement it. For dictionary page setup, see the `setup-blog` skill's dictionary-pages.md.

## Concept

When a blog post contains words that match dictionary keywords, match data is stored on each element. This data tells you exactly where in the text each keyword appears, using character offsets. Your rendering code uses these offsets to wrap matched text in `<a>` tags that link to dictionary definition pages.

The result: readers can click on terms they don't know and get a definition, and the blog builds an internal linking network that strengthens SEO.

## Match data structure

### Standard elements

Each element may have a `hyperlink` field. Inside it, `matched_keywords` is an object keyed by content field name:

```json
{
  "element_type": "paragraph",
  "content": {
    "title": "Understanding Conversion Rate Optimization",
    "text": "A/B testing is the foundation of any CRO program. By running controlled experiments, you can identify what drives conversions."
  },
  "hyperlink": {
    "matched_keywords": {
      "title": [
        {
          "keyword": "Conversion Rate Optimization",
          "description": "The process of increasing the percentage of visitors who take a desired action.",
          "matched_positions": [[14, 44]]
        }
      ],
      "text": [
        {
          "keyword": "A/B testing",
          "description": "A method of comparing two versions of a page to determine which performs better.",
          "matched_positions": [[0, 11]]
        }
      ]
    }
  }
}
```

`matched_positions` is an array of `[start, end)` tuples — character offsets into the raw text string. `start` is inclusive, `end` is exclusive.

### FAQ elements

FAQ elements use a different structure because they have multiple items. Matches are stored in a parallel array under `matched_keywords.items`, where each entry corresponds to the FAQ item at the same index:

```json
{
  "element_type": "faq",
  "content": {
    "title": "FAQ",
    "items": [
      { "question": "What is SEO?", "answer": "SEO stands for search engine optimization..." },
      { "question": "What is a backlink?", "answer": "A backlink is a link from another website..." }
    ]
  },
  "hyperlink": {
    "matched_keywords": {
      "items": [
        {
          "question": [
            { "keyword": "SEO", "description": "...", "matched_positions": [[8, 11]] }
          ],
          "answer": []
        },
        {
          "question": [],
          "answer": [
            { "keyword": "backlink", "description": "...", "matched_positions": [[2, 10]] }
          ]
        }
      ]
    }
  }
}
```

### Which fields have matches

Not every field supports hyperlinks. Each element type in the `element-shapes` skill lists its **hyperlink-capable fields**. Only check for and apply matches on those fields.

## Rendering function

The core function takes a text string and an array of matches, and returns HTML with `<a>` tags spliced in:

```typescript
interface HyperlinkMatch {
  keyword: string
  description: string
  matched_positions: [number, number][]
}

function renderHyperlinkedText(text: string, matches?: HyperlinkMatch[]): string {
  if (!matches?.length) return text

  // Flatten all match positions and sort by start offset
  const spans = matches
    .flatMap((m) =>
      (m.matched_positions || []).map(([s, e]) => ({
        s,
        e,
        keyword: m.keyword,
        description: m.description,
      }))
    )
    .sort((a, b) => a.s - b.s)

  const parts: string[] = []
  let cursor = 0

  for (const { s, e, keyword, description } of spans) {
    // Skip overlapping matches
    if (s < cursor) continue

    // Add text before this match
    if (s > cursor) {
      parts.push(text.slice(cursor, s))
    }

    // Add the hyperlinked match
    const slug = encodeURIComponent(keyword.toLowerCase())
    const escapedDesc = description.replace(/"/g, '&quot;')
    parts.push(
      `<a href="/dictionary/${slug}" title="${escapedDesc}">${text.slice(s, e)}</a>`
    )

    cursor = e
  }

  // Add remaining text after last match
  if (cursor < text.length) {
    parts.push(text.slice(cursor))
  }

  return parts.join('')
}
```

## Applying to components

### Standard elements

For each hyperlink-capable field, check for matches and apply:

```tsx
function Paragraph({ content, hyperlink }: Props) {
  const mk = hyperlink?.matched_keywords

  const titleHtml = mk?.title
    ? renderHyperlinkedText(sanitize(content.title), mk.title)
    : sanitize(content.title || '')

  const textHtml = mk?.text
    ? renderHyperlinkedText(sanitize(content.text), mk.text)
    : sanitize(content.text)

  return (
    <div>
      {content.title && <h2 dangerouslySetInnerHTML={{ __html: titleHtml }} />}
      <div dangerouslySetInnerHTML={{ __html: textHtml }} />
    </div>
  )
}
```

### Array fields (list items, pros, cons, etc.)

For fields that are arrays of strings, apply matches per item. The match data for array fields uses the same field key, but you need to match the character offsets to the concatenated or individual item strings.

In practice, if hyperlink data is provided per-item, apply it per-item. If it's provided for the whole field, apply to each item's text individually.

### FAQ elements

Map over the items array and apply matches from the parallel `matched_keywords.items` array:

```tsx
function Faq({ content, hyperlink }: Props) {
  const mk = hyperlink?.matched_keywords

  return (
    <div>
      {content.items.map((item, i) => {
        const itemMatches = mk?.items?.[i]

        const questionHtml = itemMatches?.question
          ? renderHyperlinkedText(sanitize(item.question), itemMatches.question)
          : sanitize(item.question)

        const answerHtml = itemMatches?.answer
          ? renderHyperlinkedText(sanitize(item.answer), itemMatches.answer)
          : sanitize(item.answer)

        return (
          <div key={i}>
            <h3 dangerouslySetInnerHTML={{ __html: questionHtml }} />
            <p dangerouslySetInnerHTML={{ __html: answerHtml }} />
          </div>
        )
      })}
    </div>
  )
}
```

## Order of operations

When rendering a text field with both HTML content and hyperlinks:

1. **Sanitize** the HTML first (DOMPurify)
2. **Apply hyperlinks** to the sanitized text
3. **Render** with `dangerouslySetInnerHTML`

This order matters. Sanitizing after hyperlinking would strip the `<a>` tags you just added. If you need to sanitize after, add `'a'` to your allowed tags list.

## Without hyperlink data

If an element has no `hyperlink` field, or `matched_keywords` is empty, render the text normally. The hyperlink system is additive — it never changes the base content, only adds links on top.

## Dictionary URL format

The default URL pattern is `/dictionary/{keyword}` where `keyword` is URL-encoded. If the user's blog uses a different path (e.g. `/glossary/{keyword}`), adjust the `href` in `renderHyperlinkedText` accordingly.
