---
name: setup-blog
description: Set up a blog from scratch using OpenSEO's structured content system. Use when the user wants to build a blog, create a blog, or add a blog to their project. Guides through database schema, routes, element rendering engine, SEO metadata, and optional dictionary pages.
---

# Setup Blog

You are helping the user build a blog from scratch. The blog uses a structured content system — posts are not free-form HTML. Instead, each post is made up of ordered **elements** (paragraph, faq, checklist, table, etc.), each with a typed `content` object.

## What you're building

A blog with:

1. **A database** to store posts and their elements
2. **Routes** for listing posts and rendering individual posts
3. **An element rendering engine** that maps element types to UI components
4. **SEO infrastructure** — meta tags, Open Graph, structured data
5. **Dictionary/glossary pages** (optional) with automatic hyperlinking

## How to approach this

Work through the related skills in order. Each one covers a distinct piece of the blog. Adapt everything to the user's existing stack — these are recommendations, not requirements.

- If the user already has a framework, use it. If not, recommend Next.js (App Router).
- If the user already has a database, add tables/models to it. If not, recommend SQLite with Prisma for simplicity.
- If the user has an existing design system or CSS framework, use it. If not, use Tailwind or plain CSS.

## Implementation order

Work through these skills in order:

1. **`database-schema`** — Recommended tables/models for posts, elements, categories. Adapt to the user's ORM/stack.
2. **`routes`** — Blog listing, post detail, category filter, optional webhook receiver.
3. **`element-engine`** — Component mapper, fallback rendering, HTML sanitization, image URL resolution, legacy field handling.
4. **`seo-metadata`** — Meta tags, Open Graph, JSON-LD structured data, sitemap, cover images.
5. **`dictionary-pages`** — Dictionary/glossary routes (optional).

Use the **`element-shapes`** skill as reference when building element components — it has the exact content shape for all 20+ element types.

## Before writing any posts

The blog infrastructure must be in place before content creation begins. Do not skip ahead to writing posts until:

- The database schema is set up and migrations have run
- At least the post listing and post detail routes exist
- The element rendering engine handles all element types
- SEO meta tags are wired up

Once the infrastructure is ready, use the **`writing-posts`** skill for content creation.

## Content model at a glance

```
Post
├── title_text        (display title)
├── slug              (URL path)
├── seo_title         (search engine title)
├── meta_description
├── excerpt
├── focus_keyword
├── status            (DRAFT / GENERATED / PUBLISHED)
├── categories[]
├── cover_image       { url, description }
└── elements[]
    ├── order         (display position, 1-indexed)
    ├── element_type  (paragraph, faq, checklist, etc.)
    └── content       (shape depends on element_type)
```

Each element is self-contained. The rendering engine's job is: given an element type and its content object, return the right UI.
