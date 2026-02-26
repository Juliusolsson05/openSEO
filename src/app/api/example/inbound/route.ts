/**
 * POST /api/example/inbound
 *
 * Inbound webhook endpoint for the example/customer site.
 *
 * Configure Aurora's company `api_endpoint` to point here. Content is pushed
 * here when you:
 *   - Click "Publish" on a single post (event: blog.post.upload)
 *   - Click "Sync all posts" on the Publishing page (event: post.upsert)
 *   - Click "Sync all dictionaries" (event: dictionary.upsert)
 *
 * Auth: Bearer token validated against EXAMPLE_INBOUND_KEY env var.
 *       REQUIRED — requests without a valid token are rejected.
 *
 * Supports event types:
 *   blog.post.upload    — single post publish from AdminMenu
 *   blog.post.export    — third-party export
 *   post.upsert         — bulk sync from Publishing page
 *   post.delete          — delete a post
 *   dictionary.upsert   — bulk dictionary sync
 *   dictionary.delete   — delete a dictionary
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  upsertSyncedPost,
  deleteSyncedPost,
  upsertSyncedDictionary,
  deleteSyncedDictionary,
} from '@/app/example/_lib/store'
import type { ExamplePost, ExampleDictionary, ExampleWord } from '@/app/example/_lib/types'

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

function authenticate(req: NextRequest): boolean {
  const expected = process.env.EXAMPLE_INBOUND_KEY
  if (!expected) {
    console.error('[example/inbound] EXAMPLE_INBOUND_KEY is not set — rejecting request')
    return false
  }

  const auth = req.headers.get('authorization') ?? ''
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim() === expected
  }
  return false
}

function getCompanyId(): number {
  return parseInt(process.env.EXAMPLE_COMPANY_ID ?? '1', 10)
}

// ─── Extract elements from various payload shapes ────────────────────

import type { RawElement } from '@/types/publishing'

function extractElements(source: Record<string, unknown>): RawElement[] {
  // Shape 1: { processed_content: { elements: [...] } } — from pushAllPosts (sync)
  const pc = source.processed_content as Record<string, unknown> | undefined
  if (pc?.elements && Array.isArray(pc.elements)) {
    return pc.elements as RawElement[]
  }

  // Shape 2: { processed_content: { ...blogPost, elements: [...] } } — from uploadPost (publish)
  if (pc && typeof pc === 'object' && 'id' in pc) {
    const elements = (pc as Record<string, unknown>).elements
    if (Array.isArray(elements)) return elements as RawElement[]
  }

  // Shape 3: top-level elements (from exportPost)
  if (source.elements && Array.isArray(source.elements)) {
    return source.elements as RawElement[]
  }

  return []
}

function extractPost(source: Record<string, unknown>): Record<string, unknown> | null {
  // Shape 1: { post: { ... } } — most payloads
  if (source.post && typeof source.post === 'object') {
    return source.post as Record<string, unknown>
  }

  // Shape 2: flat payload IS the post (exportPost sends full post object)
  if (source.title_text && source.slug) return source

  return null
}

function toExamplePost(payload: Record<string, unknown>): { post: ExamplePost; auroraId?: number } | null {
  const post = extractPost(payload)
  if (!post?.slug || !post?.title_text) return null

  const rawElements = extractElements(payload)
  const elements = rawElements.map((el) => ({
    id: String(el.id),
    order: el.order,
    element_type: el.element_type,
    content: typeof el.content === 'string' ? (() => { try { return JSON.parse(el.content as string) } catch { return {} } })() : (el.content as Record<string, unknown>),
  }))

  // Extract cover image from various payload shapes
  let coverImageUrl = ''
  let coverImageAlt = ''
  const rawCover = post.cover_image as Record<string, unknown> | string | undefined
  if (rawCover && typeof rawCover === 'object') {
    coverImageUrl = String(rawCover.url ?? '')
    coverImageAlt = String(rawCover.alt ?? '')
  } else if (typeof rawCover === 'string') {
    try {
      const parsed = JSON.parse(rawCover) as Record<string, unknown>
      coverImageUrl = String(parsed.url ?? '')
      coverImageAlt = String(parsed.alt ?? '')
    } catch {
      coverImageUrl = rawCover
    }
  }

  return {
    auroraId: post.id as number | undefined,
    post: {
      id: `synced-${post.id ?? post.slug}`,
      slug: String(post.slug),
      title: String(post.title_text),
      excerpt: String(post.excerpt ?? post.meta_description ?? ''),
      cover_image_url: coverImageUrl,
      cover_image_alt: coverImageAlt,
      published_at: new Date().toISOString().slice(0, 10),
      elements,
    },
  }
}

// ─── Dictionary transforms ──────────────────────────────────────────

function toExampleDictionary(payload: Record<string, unknown>): { dict: ExampleDictionary; auroraId?: number } | null {
  const dict = payload.dictionary as Record<string, unknown> | undefined
  if (!dict) return null

  const terms = (payload.terms ?? []) as Record<string, unknown>[]
  const words: ExampleWord[] = terms.map((t) => {
    const def = t.definition as Record<string, unknown> | null | undefined
    return {
      id: String(t.id),
      keyword: String(t.keyword),
      definition: {
        featured_snippet: String(def?.featured_google_snippet ?? t.description ?? ''),
        paragraph_1: '',
        paragraph_2: '',
        paragraph_3: '',
        synonyms: Array.isArray(def?.synonyms) ? (def.synonyms as string[]) : [],
        antonyms: Array.isArray(def?.antonyms) ? (def.antonyms as string[]) : [],
        usage_examples: Array.isArray(def?.usage_examples) ? (def.usage_examples as string[]) : [],
        related_keywords: Array.isArray(def?.related_keywords) ? (def.related_keywords as string[]) : [],
        faqs: Array.isArray(def?.faqs) ? (def.faqs as { question: string; answer: string }[]) : [],
      },
    }
  })

  return {
    auroraId: dict.id as number | undefined,
    dict: {
      id: `synced-${dict.id ?? 'dict'}`,
      name: String(dict.title ?? 'Dictionary'),
      description: String(dict.subject ?? ''),
      word_count: words.length,
      words,
    },
  }
}

// ─── Handler ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!authenticate(req)) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const companyId = getCompanyId()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const event = String(body.event ?? '')

  // Unwrap the nested envelope: body.payload → envelope → envelope.payload → actual data
  const envelope = (body.payload ?? body) as Record<string, unknown>
  const innerPayload = (envelope.payload ?? envelope) as Record<string, unknown>
  const eventId = String(envelope.event_id ?? `${Date.now()}`)

  switch (event) {
    // ── Post events ──────────────────────────────────────────────
    case 'post.upsert':
    case 'blog.post.upload':
    case 'blog.post.export': {
      const result = toExamplePost(innerPayload)
      if (!result) return json({ error: 'Invalid post payload — slug and title_text required' }, 400)
      await upsertSyncedPost(companyId, result.post, result.auroraId)
      return json({ status: 'ok', delivery_id: eventId, post_slug: result.post.slug })
    }

    case 'post.delete': {
      const post = extractPost(innerPayload)
      const slug = post?.slug as string | undefined
      if (!slug) return json({ error: 'Missing post.slug' }, 400)
      const deleted = await deleteSyncedPost(companyId, String(slug))
      return json({ status: deleted ? 'deleted' : 'not_found', delivery_id: eventId })
    }

    // ── Dictionary events ────────────────────────────────────────
    case 'dictionary.upsert': {
      const result = toExampleDictionary(innerPayload)
      if (!result) return json({ error: 'Invalid dictionary payload' }, 400)
      await upsertSyncedDictionary(companyId, result.dict, result.auroraId)
      return json({ status: 'ok', delivery_id: eventId, dictionary_id: result.dict.id })
    }

    case 'dictionary.delete': {
      const dict = innerPayload.dictionary as Record<string, unknown> | undefined
      const dictId = dict?.id as number | undefined
      if (!dictId) return json({ error: 'Missing dictionary.id' }, 400)
      const deleted = await deleteSyncedDictionary(companyId, dictId)
      return json({ status: deleted ? 'deleted' : 'not_found', delivery_id: eventId })
    }

    default:
      return json({ error: `Unknown event type: ${event}` }, 400)
  }
}
