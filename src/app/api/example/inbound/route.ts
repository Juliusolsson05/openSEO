/**
 * Example site inbound webhook endpoint.
 *
 * This is the endpoint you configure as your company's `api_endpoint` in
 * Aurora settings. When you hit "Sync All Posts" or "Sync All Dictionaries"
 * in the Aurora dashboard, it pushes each item here via webhook.
 *
 * Envelope format (sent by Aurora's webhook-delivery.service):
 * {
 *   event: "post.upsert" | "post.delete" | "dictionary.upsert" | "dictionary.delete",
 *   timestamp: "ISO-8601",
 *   payload: {
 *     contract_version, event, event_id, sent_at,
 *     payload: { post, processed_content } | { dictionary, terms }
 *   }
 * }
 *
 * Auth: Bearer token validated against EXAMPLE_INBOUND_KEY env var.
 * If EXAMPLE_INBOUND_KEY is not set, all requests are accepted (dev mode).
 *
 * Storage: SQLite database via Prisma (prisma/example/schema.prisma).
 * Customers: copy this file + _lib/store.ts + _lib/prisma.ts into your
 * own Next.js project and swap SQLite for your production database.
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
  if (!expected) return true // dev mode — accept everything

  const auth = req.headers.get('authorization') ?? ''
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim() === expected
  }
  return false
}

// ─── Transform Aurora envelope → ExamplePost ────────────────────────

type AuroraPostPayload = {
  post?: {
    id?: number
    title_text?: string
    slug?: string
    seo_title?: string
    focus_keyword?: string
    excerpt?: string
    meta_description?: string
    status?: string
    categories?: string[]
  }
  processed_content?: {
    id?: number
    elements?: {
      id: number | string
      order: number
      element_type: string
      content: Record<string, unknown>
    }[]
  }
}

function toExamplePost(payload: AuroraPostPayload): { post: ExamplePost; auroraId?: number } | null {
  const post = payload.post
  const content = payload.processed_content
  if (!post?.slug || !post?.title_text) return null

  return {
    auroraId: post.id,
    post: {
      id: `synced-${post.id ?? post.slug}`,
      slug: post.slug,
      title: post.title_text,
      excerpt: post.excerpt ?? post.meta_description ?? '',
      cover_image_url: '',
      published_at: new Date().toISOString().slice(0, 10),
      elements: (content?.elements ?? []).map((el) => ({
        id: String(el.id),
        order: el.order,
        element_type: el.element_type,
        content: el.content,
      })),
    },
  }
}

// ─── Transform Aurora envelope → ExampleDictionary ──────────────────

type AuroraDictPayload = {
  dictionary?: {
    id?: number
    title?: string
    subject?: string
    language?: string
    status?: string
    num_words?: number
  }
  terms?: {
    id: number | string
    letter?: string
    keyword: string
    description?: string
    focus_keyword?: string
    definition?: {
      featured_google_snippet?: string
      meta_description?: string
      synonyms?: unknown
      antonyms?: unknown
      usage_examples?: unknown
      related_keywords?: unknown
      faqs?: unknown
    } | null
  }[]
}

function toExampleDictionary(payload: AuroraDictPayload): { dict: ExampleDictionary; auroraId?: number } | null {
  const dict = payload.dictionary
  if (!dict) return null

  const words: ExampleWord[] = (payload.terms ?? []).map((t) => ({
    id: String(t.id),
    keyword: t.keyword,
    definition: {
      featured_snippet: t.definition?.featured_google_snippet ?? t.description ?? '',
      paragraph_1: '',
      paragraph_2: '',
      paragraph_3: '',
      synonyms: Array.isArray(t.definition?.synonyms) ? t.definition.synonyms as string[] : [],
      antonyms: Array.isArray(t.definition?.antonyms) ? t.definition.antonyms as string[] : [],
      usage_examples: Array.isArray(t.definition?.usage_examples) ? t.definition.usage_examples as string[] : [],
      related_keywords: Array.isArray(t.definition?.related_keywords) ? t.definition.related_keywords as string[] : [],
      faqs: Array.isArray(t.definition?.faqs) ? t.definition.faqs as { question: string; answer: string }[] : [],
    },
  }))

  return {
    auroraId: dict.id,
    dict: {
      id: `synced-${dict.id ?? 'dict'}`,
      name: dict.title ?? 'Dictionary',
      description: dict.subject ?? '',
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

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const event = (body.event as string) ?? ''
  // The inner payload is wrapped: body.payload is the envelope, body.payload.payload is the actual data
  const envelope = (body.payload ?? body) as Record<string, unknown>
  const innerPayload = (envelope.payload ?? envelope) as Record<string, unknown>
  const eventId = (envelope.event_id as string) ?? `${Date.now()}`

  switch (event) {
    case 'post.upsert': {
      const result = toExamplePost(innerPayload as AuroraPostPayload)
      if (!result) return json({ error: 'Invalid post payload — slug and title_text required' }, 400)
      await upsertSyncedPost(result.post, result.auroraId)
      return json({ status: 'ok', delivery_id: eventId, post_slug: result.post.slug })
    }

    case 'post.delete': {
      const slug = (innerPayload as { post?: { slug?: string } }).post?.slug
      if (!slug) return json({ error: 'Missing post.slug' }, 400)
      const deleted = await deleteSyncedPost(slug)
      return json({ status: deleted ? 'deleted' : 'not_found', delivery_id: eventId })
    }

    case 'dictionary.upsert': {
      const result = toExampleDictionary(innerPayload as AuroraDictPayload)
      if (!result) return json({ error: 'Invalid dictionary payload' }, 400)
      await upsertSyncedDictionary(result.dict, result.auroraId)
      return json({ status: 'ok', delivery_id: eventId, dictionary_id: result.dict.id })
    }

    case 'dictionary.delete': {
      const dictId = (innerPayload as { dictionary?: { id?: number } }).dictionary?.id
      if (!dictId) return json({ error: 'Missing dictionary.id' }, 400)
      const deleted = await deleteSyncedDictionary(`synced-${dictId}`)
      return json({ status: deleted ? 'deleted' : 'not_found', delivery_id: eventId })
    }

    default:
      return json({ error: `Unknown event type: ${event}` }, 400)
  }
}
