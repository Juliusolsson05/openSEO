---
name: routes
description: Blog route structure — listing page, post detail, category filter, and optional webhook receiver. Use when setting up routes, pages, or API endpoints for the blog.
user-invocable: false
---

# Routes

The blog needs three core routes and one optional API route. Examples use Next.js App Router, but the pattern applies to any framework.

## Core routes

### Blog listing — `/blog`

Displays all published posts, sorted by publish date (newest first).

**Data:** Query all posts where `status = 'PUBLISHED'`. Return `titleText`, `slug`, `excerpt`, `coverImageUrl`, `categories`, `publishedAt`. Do not load elements — they're not needed for the listing.

**Page structure:**
- Page title and optional intro text
- Grid or list of post cards, each showing:
  - Cover image (if present)
  - Categories as tags/badges
  - Post title (linked to `/blog/[slug]`)
  - Excerpt
  - Publish date

**SEO:** Set a static meta title and description for the blog index page.

### Post detail — `/blog/[slug]`

Renders a single post with all its elements.

**Data:** Query the post by `slug`. Include all elements, sorted by `order` ascending. 404 if not found or not published.

**Page structure:**
- Post metadata header: categories, publish date
- Post title (`titleText`)
- Cover image (if `coverImageUrl` is set)
- Element rendering: loop through `elements` and pass each to the element rendering engine (see the `element-engine` skill)

**SEO:** Use post-level fields for meta tags:
- `<title>`: `seoTitle` if set, otherwise `titleText`
- `<meta name="description">`: `metaDescription`
- Open Graph image: `coverImageUrl`

### Category filter — `/blog/category/[category]`

Same as the blog listing, but filtered to posts with a specific category. Reuse the listing component.

## Optional: Webhook receiver — `/api/openseo`

If the user wants to receive posts from OpenSEO Cloud later, add an API route that accepts the publishing webhook. This is optional for standalone mode but makes the migration path to cloud mode seamless.

**Implementation:**

```typescript
// Next.js: app/api/openseo/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Verify the outbound key
  const apiKey = req.headers.get('authorization')?.replace('Bearer ', '')
  if (apiKey !== process.env.OPENSEO_OUTBOUND_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { event, event_id, payload } = body

  switch (event) {
    case 'post.upsert': {
      const { post, processed_content } = payload

      // Upsert the post
      await db.post.upsert({
        where: { slug: post.slug },
        create: {
          titleText: post.title_text,
          slug: post.slug,
          seoTitle: post.seo_title,
          metaDescription: post.meta_description,
          excerpt: post.excerpt,
          focusKeyword: post.focus_keyword,
          status: post.status,
          coverImageUrl: post.cover_image?.url,
          coverImageDesc: post.cover_image?.description,
        },
        update: {
          titleText: post.title_text,
          seoTitle: post.seo_title,
          metaDescription: post.meta_description,
          excerpt: post.excerpt,
          focusKeyword: post.focus_keyword,
          status: post.status,
        },
      })

      // Replace elements
      if (processed_content?.elements) {
        await db.element.deleteMany({ where: { post: { slug: post.slug } } })
        await db.element.createMany({
          data: processed_content.elements.map((el) => ({
            postId: dbPost.id,
            order: el.order,
            elementType: el.element_type,
            content: el.content,
          })),
        })
      }

      return NextResponse.json({
        delivery_id: event_id,
        remote_id: post.slug,
      })
    }

    case 'post.delete': {
      await db.post.delete({ where: { slug: payload.post.slug } })
      return NextResponse.json({ status: 'deleted' })
    }

    default:
      return NextResponse.json({ status: 'ignored' })
  }
}
```

This is a starting point — adapt the database calls to match the user's ORM and schema.

## Route summary

| Route | Purpose | Data |
|-------|---------|------|
| `/blog` | List all published posts | Posts (no elements) |
| `/blog/[slug]` | Render a single post | Post + elements |
| `/blog/category/[category]` | Filter by category | Posts filtered by category |
| `/api/openseo` | Receive webhook (optional) | Incoming JSON envelope |

## Static generation

If the user's framework supports static site generation (Next.js, Astro, etc.), generate post pages at build time using `generateStaticParams` (Next.js) or equivalent. This gives the best performance and SEO. Add on-demand revalidation when posts are created or updated via the webhook.
