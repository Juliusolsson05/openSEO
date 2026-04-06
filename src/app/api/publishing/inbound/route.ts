import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  upsertSyncedPost,
  deleteSyncedPost,
  upsertSyncedDictionary,
  deleteSyncedDictionary,
} from '@/server/public-content/store'
import type { PublicDictionary, PublicPost, PublicWord } from '@/server/public-content/types'
import { resolvePublicCompanyId } from '@/server/public-content/company'

const envelopeSchema = z.object({
  event: z.string(),
  payload: z.unknown().optional(),
})

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

function authenticate(req: NextRequest): boolean {
  const expected = process.env.PUBLIC_CONTENT_INBOUND_KEY ?? process.env.EXAMPLE_INBOUND_KEY
  if (!expected) return false

  const auth = req.headers.get('authorization') ?? ''
  if (!auth.toLowerCase().startsWith('bearer ')) return false
  return auth.slice(7).trim() === expected
}

/**
 * Resolve the target tenant for an inbound publish event.
 *
 * Order: `x-company-id` header, then `?company_id=` query, then
 * `PUBLIC_CONTENT_COMPANY_ID` env (via resolvePublicCompanyId). Returns null if
 * none are provided — we refuse to silently default to company 1, because
 * that caused cross-tenant writes to the public-content tables.
 */
function resolveInboundCompanyId(req: NextRequest): number | null {
  const header = req.headers.get('x-company-id')
  if (header) return resolvePublicCompanyId(header)

  const query = req.nextUrl.searchParams.get('company_id')
  if (query) return resolvePublicCompanyId(query)

  return resolvePublicCompanyId()
}

import type { RawElement } from '@/types/publishing'

function extractElements(source: Record<string, unknown>): RawElement[] {
  const pc = source.processed_content as Record<string, unknown> | undefined
  if (pc?.elements && Array.isArray(pc.elements)) return pc.elements as RawElement[]
  if (pc && typeof pc === 'object' && 'id' in pc) {
    const elements = (pc as Record<string, unknown>).elements
    if (Array.isArray(elements)) return elements as RawElement[]
  }
  if (source.elements && Array.isArray(source.elements)) return source.elements as RawElement[]
  return []
}

function extractPost(source: Record<string, unknown>): Record<string, unknown> | null {
  if (source.post && typeof source.post === 'object') return source.post as Record<string, unknown>
  if (source.title_text && source.slug) return source
  return null
}

function toPublicPost(payload: Record<string, unknown>): { post: PublicPost; auroraId?: number } | null {
  const post = extractPost(payload)
  if (!post?.slug || !post?.title_text) return null

  const rawElements = extractElements(payload)
  const elements = rawElements.map((el) => ({
    id: String(el.id),
    order: el.order,
    element_type: el.element_type,
    content: typeof el.content === 'string' ? (() => { try { return JSON.parse(el.content as string) } catch { return {} } })() : (el.content as Record<string, unknown>),
  }))

  const coverImage = post.cover_image as { url?: unknown } | undefined
  const coverImageUrl =
    typeof coverImage?.url === 'string' ? coverImage.url : ''

  return {
    auroraId: post.id as number | undefined,
    post: {
      id: `synced-${post.id ?? post.slug}`,
      slug: String(post.slug),
      title: String(post.title_text),
      excerpt: String(post.excerpt ?? post.meta_description ?? ''),
      cover_image_url: coverImageUrl,
      published_at: new Date().toISOString().slice(0, 10),
      elements,
    },
  }
}

function toPublicDictionary(payload: Record<string, unknown>): { dict: PublicDictionary; auroraId?: number } | null {
  const dict = payload.dictionary as Record<string, unknown> | undefined
  if (!dict) return null

  const terms = (payload.terms ?? []) as Record<string, unknown>[]
  const words: PublicWord[] = terms.map((t) => {
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

export async function POST(req: NextRequest) {
  if (!authenticate(req)) return json({ error: 'Unauthorized' }, 401)

  const companyId = resolveInboundCompanyId(req)
  if (companyId === null) {
    return json(
      {
        error:
          'Missing tenant: provide x-company-id header, ?company_id= query, or set PUBLIC_CONTENT_COMPANY_ID.',
      },
      400,
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const parsed = envelopeSchema.safeParse(raw)
  if (!parsed.success) return json({ error: 'Invalid payload envelope' }, 400)

  const body = parsed.data as { event: string; payload?: unknown }
  const event = body.event

  const envelope = (body.payload ?? body) as Record<string, unknown>
  const innerPayload = (envelope.payload ?? envelope) as Record<string, unknown>
  const eventId = String(envelope.event_id ?? `${Date.now()}`)

  switch (event) {
    case 'post.upsert':
    case 'blog.post.upload':
    case 'blog.post.export': {
      const result = toPublicPost(innerPayload)
      if (!result) return json({ error: 'Invalid post payload' }, 400)
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

    case 'dictionary.upsert': {
      const result = toPublicDictionary(innerPayload)
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
