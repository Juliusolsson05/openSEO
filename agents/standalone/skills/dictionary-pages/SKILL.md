---
name: dictionary-pages
description: How to build dictionary/glossary pages — term definition routes, listing pages, and DefinedTerm structured data. Use when adding dictionary or glossary features to the blog.
user-invocable: false
---

# Dictionary Pages

Optional but powerful. If the user's blog includes a glossary/dictionary, this covers how to build dictionary pages.

## What this is

OpenSEO's content system supports **dictionary hyperlinking** — when a blog post contains terms that match dictionary keywords, character-offset-based match data is stored on each element. The blog can use this data to turn keyword mentions into links to dictionary definition pages.

This creates an internal linking network that benefits both SEO (topical authority, crawl depth) and user experience (inline definitions).

## Routes

| Route | Purpose |
|-------|---------|
| `/dictionary` | List all dictionaries |
| `/dictionary/[keyword]` | Individual term definition page |

Alternatively, use `/glossary` if that fits the user's brand better.

## Term definition page — `/dictionary/[keyword]`

**Data:** Look up the term by keyword (URL-decoded). Include the full `definition` object.

**Page structure:**
- Term keyword as the page title
- Short description
- Full definition body (if `definition` exists):
  - `definition.title` — page heading
  - `definition.featured_google_snippet` — highlighted answer block
  - `definition.usage_examples` — example sentences
  - `definition.synonyms` / `definition.antonyms` — displayed as tag lists
  - `definition.related_keywords` — links to other term pages
  - `definition.faqs` — FAQ section for the term

**SEO:**
- Title: `definition.seo_title` or fall back to keyword
- Description: `definition.meta_description` or fall back to `description`
- Add DefinedTerm structured data:

```typescript
function termJsonLd(term: Term) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.keyword,
    description: term.description,
  }
}
```

## Dictionary listing page — `/dictionary`

List all terms grouped by letter. Each letter is a section with terms listed alphabetically. Link each term to its definition page.

## Hyperlink rendering

For the full hyperlink rendering implementation (match data structure, rendering function, applying to components), see the `dictionary-hyperlinking` skill.

## Without a dictionary

If the user's blog does not use dictionaries, skip this entirely. The element rendering engine works without hyperlinks — text fields render normally. Dictionary support can be added later without changing existing components.
