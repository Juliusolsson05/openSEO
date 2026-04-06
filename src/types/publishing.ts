/**
 * Publishing inbound types — shared across all v1 publishing inbound routes.
 */

/** Base envelope shape for all inbound publishing events. */
export interface InboundEnvelope<P = Record<string, unknown>> {
  contract_version?: string
  event?: string
  event_id?: string
  payload?: P
}

// ─── Payload shapes per route ────────────────────────────

export interface InboundPostRef { id?: number; remote_id?: string; slug?: string }

export interface InboundPostPayload {
  post?: InboundPostRef & {
    title_text?: string; seo_title?: string; focus_keyword?: string
    excerpt?: string; meta_description?: string
    cover_image?: { url?: string; description?: string }
    categories?: string[]
    status?: 'TO_BE_GENERATED' | 'APPROVED' | 'REJECTED' | 'GENERATED' | 'PUBLISHED'
  }
  elements?: RawElement[]
}

export interface InboundPostDeletePayload { post?: InboundPostRef }

export interface InboundDictionaryRef { id?: number; title?: string }

export interface InboundDictionaryPayload {
  dictionary?: InboundDictionaryRef & {
    subject?: string; language?: string; num_words?: number
    current_letter?: string
    status?: 'IN_PROGRESS' | 'KEYWORD_GENERATION' | 'DEFINITION_GENERATION' | 'COMPLETED'
  }
}

export interface InboundDictionaryDeletePayload { dictionary?: InboundDictionaryRef }

export interface InboundTermRef { id?: number; keyword?: string }

export interface InboundTermPayload {
  dictionary?: InboundDictionaryRef
  term?: InboundTermRef & {
    letter?: string; description?: string
    priority?: 'HIGH' | 'LOW'; focus_keyword?: string
    definition?: {
      title?: string; featured_google_snippet?: string
      meta_description?: string; seo_title?: string
      synonyms?: unknown; antonyms?: unknown
      usage_examples?: unknown; related_keywords?: unknown; faqs?: unknown
    }
  }
}

export interface InboundTermDeletePayload {
  dictionary?: InboundDictionaryRef
  term?: InboundTermRef
}

/** Raw element as received from inbound sync APIs. */
export interface RawElement {
  id: number | string
  order: number
  element_type: string
  content: Record<string, unknown> | string
}

/** Extract inbound API key from Authorization header or x-aurora-inbound-key. */
export function readInboundKey(headers: Headers): string {
  const auth = headers.get('authorization') ?? ''
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim()
  return headers.get('x-aurora-inbound-key')?.trim() ?? ''
}
