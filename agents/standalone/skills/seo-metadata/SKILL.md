---
name: seo-metadata
description: SEO meta tags, Open Graph, JSON-LD structured data, sitemap, and cover image handling for blog posts. Use when implementing SEO infrastructure, meta tags, or structured data.
user-invocable: false
---

# SEO & Metadata

How to wire up meta tags, Open Graph, structured data, and cover images for blog posts.

## Meta tags per post

Each post has dedicated SEO fields. Use them in the page `<head>`:

| Post field | Maps to |
|-----------|---------|
| `seoTitle` (fallback: `titleText`) | `<title>` and `og:title` |
| `metaDescription` | `<meta name="description">` and `og:description` |
| `coverImageUrl` | `og:image` and `twitter:image` |
| `slug` | Canonical URL: `{baseUrl}/blog/{slug}` |
| `focusKeyword` | Not rendered — informational for the writer |

### Next.js example

```typescript
// app/blog/[slug]/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  return {
    title: post.seoTitle || post.titleText,
    description: post.metaDescription,
    openGraph: {
      title: post.seoTitle || post.titleText,
      description: post.metaDescription,
      type: 'article',
      url: `${baseUrl}/blog/${post.slug}`,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : [],
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: {
      card: post.coverImageUrl ? 'summary_large_image' : 'summary',
      title: post.seoTitle || post.titleText,
      description: post.metaDescription,
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
  }
}
```

## Cover image

The cover image is post-level metadata, not an inline element. It has two fields:

- `coverImageUrl` — the image URL
- `coverImageDesc` — alt text / description

Render it between the post header (title, categories, date) and the element body. Also use it as the Open Graph image.

## Slug rules

Slugs are URL-safe identifiers. When creating posts locally:

- Lowercase, hyphen-separated: `how-to-improve-conversion-rate`
- No special characters, no trailing slashes
- Must be unique across all posts
- Do not change a slug after publishing — it breaks links and SEO

## Structured data (JSON-LD)

Add Article structured data for each post. This helps search engines understand the content.

```typescript
function articleJsonLd(post: Post, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seoTitle || post.titleText,
    description: post.metaDescription,
    image: post.coverImageUrl || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    url: `${baseUrl}/blog/${post.slug}`,
    author: {
      '@type': 'Organization',
      name: 'COMPANY_NAME', // replace with the user's company
    },
  }
}
```

Render as a `<script type="application/ld+json">` tag in the page head.

### FAQ structured data

If a post contains an `faq` element, add FAQPage structured data. Search engines may show these as rich results.

```typescript
function faqJsonLd(faqContent: { items: { question: string; answer: string }[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqContent.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
```

## Blog listing page SEO

The `/blog` index page should have its own static meta tags:

```typescript
export const metadata: Metadata = {
  title: 'Blog — COMPANY_NAME',
  description: 'Articles about TOPIC_AREA.',
  openGraph: {
    title: 'Blog — COMPANY_NAME',
    description: 'Articles about TOPIC_AREA.',
    type: 'website',
  },
}
```

Replace `COMPANY_NAME` and `TOPIC_AREA` with the user's values.

## Sitemap

Generate a sitemap that includes all published post URLs. In Next.js:

```typescript
// app/sitemap.ts
export default async function sitemap() {
  const posts = await getAllPublishedPosts()

  return [
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ]
}
```

## Robots

Ensure blog pages are crawlable. Do not add `noindex` to published posts. Draft posts should not have public URLs — filter them out at the route level, not with robots tags.
