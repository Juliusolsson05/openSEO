import type { ElementDocs } from '@/components/blog/elements/docs-types'

/**
 * Serializes the entire publishing API documentation to markdown.
 * Used by the copy button and raw view toggle.
 */
export function buildFullMarkdown(
  elementDocs: Array<{ type: string; docs: ElementDocs }>,
  payloads: {
    outboundPost: unknown
    outboundDictionary: unknown
    inboundPostUpsert: unknown
    inboundPostDelete: unknown
    inboundDictionaryUpsert: unknown
    inboundTermUpsert: unknown
    inboundTermDelete: unknown
    inboundDictionaryDelete: unknown
    jobStatus: unknown
    errorResponse: unknown
    receiverExample: string
  },
): string {
  const j = (data: unknown) => '```json\n' + JSON.stringify(data, null, 2) + '\n```'
  const lines: string[] = []

  lines.push('# OpenSEO Publishing API Documentation', '')

  // 1. Overview
  lines.push('## 1. Overview', '')
  lines.push('OpenSEO supports bidirectional content sync between your CMS/frontend and OpenSEO through JSON webhooks.', '')
  lines.push('- **Outbound (OpenSEO → Your system):** OpenSEO pushes content to your configured endpoint when you trigger a sync.')
  lines.push('- **Inbound (Your system → OpenSEO):** Your system sends content updates to OpenSEO\'s inbound endpoints using an API key.')
  lines.push('- **Jobs:** Bulk sync operations run asynchronously. You receive a `job_id` and can poll for status.', '')

  // 2. Auth
  lines.push('## 2. Authentication', '')
  lines.push('**Outbound key:** Configured in Settings → API Configuration. Sent as `Authorization: Bearer <key>` to your endpoint.', '')
  lines.push('**Inbound key:** Generated in Settings → Inbound API Keys. Send as `Authorization: Bearer <key>` or `X-Aurora-Inbound-Key: <key>`.', '')

  // 3. Envelope
  lines.push('## 3. Envelope Format', '')
  lines.push('| Field | Type | Required | Description |')
  lines.push('|-------|------|----------|-------------|')
  lines.push('| `contract_version` | string | yes | Currently "2026-02-1" |')
  lines.push('| `event` | string | yes | Event type (e.g. "post.upsert") |')
  lines.push('| `event_id` | string | yes | Unique event ID for idempotency |')
  lines.push('| `sent_at` | ISO 8601 | yes | Timestamp |')
  lines.push('| `payload` | object | yes | Event-specific payload |', '')

  // 4. Idempotency
  lines.push('## 4. Idempotency', '')
  lines.push('Every inbound request requires a unique `event_id`. Duplicates return:', '')
  lines.push(j({ status: 'duplicate_ignored', event_id: 'my-system-evt-001' }), '')

  // 5. Outbound post
  lines.push('## 5. Outbound: Post Sync', '')
  lines.push('`POST /api/v1/publishing/sync/posts/all` (session auth)', '')
  lines.push('Envelope delivered per post:', '')
  lines.push(j(payloads.outboundPost), '')

  // 6. Outbound dictionary
  lines.push('## 6. Outbound: Dictionary Sync', '')
  lines.push('`POST /api/v1/publishing/sync/dictionaries/all` (session auth)', '')
  lines.push(j(payloads.outboundDictionary), '')

  // 7. Jobs
  lines.push('## 7. Sync Jobs', '')
  lines.push('`GET /api/v1/publishing/jobs/{jobId}`', '')
  lines.push('Lifecycle: `accepted` → `running` → `completed` or `failed`', '')
  lines.push(j(payloads.jobStatus), '')

  // 8-13. Inbound endpoints
  const inboundEndpoints = [
    { title: '8. Inbound: Post Upsert', method: 'POST', path: '/api/v1/publishing/inbound/post/upsert', body: payloads.inboundPostUpsert, notes: 'Matching: post.id → slug → create new. Only present fields are updated.' },
    { title: '9. Inbound: Post Delete', method: 'POST', path: '/api/v1/publishing/inbound/post/delete', body: payloads.inboundPostDelete, notes: 'Matching: post.id → remote_id → slug.' },
    { title: '10. Inbound: Dictionary Upsert', method: 'POST', path: '/api/v1/publishing/inbound/dictionary/upsert', body: payloads.inboundDictionaryUpsert, notes: 'Matching: dictionary.id → title.' },
    { title: '11. Inbound: Dictionary Delete', method: 'POST', path: '/api/v1/publishing/inbound/dictionary/delete', body: payloads.inboundDictionaryDelete, notes: '' },
    { title: '12. Inbound: Term Upsert', method: 'POST', path: '/api/v1/publishing/inbound/dictionary/term/upsert', body: payloads.inboundTermUpsert, notes: 'Dictionary matched by id or title. Term matched by id or keyword.' },
    { title: '13. Inbound: Term Delete', method: 'POST', path: '/api/v1/publishing/inbound/dictionary/term/delete', body: payloads.inboundTermDelete, notes: '' },
  ]
  for (const ep of inboundEndpoints) {
    lines.push(`## ${ep.title}`, '')
    lines.push(`\`${ep.method} ${ep.path}\` (inbound API key)`, '')
    if (ep.notes) lines.push(ep.notes, '')
    lines.push(j(ep.body), '')
  }

  // 14. Field schemas
  lines.push('## 14. Field Schemas', '')
  const schemas = [
    { name: 'Post', fields: [
      ['id', 'number', 'no', 'OpenSEO post ID'],
      ['title_text', 'string', 'yes', 'Post title'],
      ['slug', 'string', 'no', 'URL-safe slug'],
      ['seo_title', 'string', 'no', 'SEO title'],
      ['focus_keyword', 'string', 'no', 'Target keyword'],
      ['excerpt', 'string', 'no', 'Short summary'],
      ['meta_description', 'string', 'no', 'Meta description'],
      ['status', 'string', 'no', 'DRAFT, GENERATED, PUBLISHED'],
      ['categories', 'string[]', 'no', 'Category names'],
    ]},
    { name: 'Element', fields: [
      ['id', 'number', 'no', 'Element ID'],
      ['order', 'number', 'yes', 'Display order (0-indexed)'],
      ['element_type', 'string', 'yes', 'Type identifier'],
      ['content', 'object', 'yes', 'Shape depends on element_type'],
    ]},
    { name: 'Dictionary', fields: [
      ['id', 'number', 'no', 'Dictionary ID'],
      ['title', 'string', 'yes', 'Dictionary title'],
      ['subject', 'string', 'yes', 'Subject area'],
      ['language', 'string', 'yes', 'Language code'],
      ['num_words', 'number', 'no', 'Total terms'],
      ['status', 'string', 'no', 'IN_PROGRESS, COMPLETED, etc.'],
    ]},
    { name: 'Term', fields: [
      ['keyword', 'string', 'yes', 'The term keyword'],
      ['letter', 'string', 'no', 'Alphabetical letter'],
      ['description', 'string', 'yes', 'Short description'],
      ['priority', 'string', 'no', 'HIGH or LOW'],
      ['definition', 'object', 'no', 'Full definition (see below)'],
    ]},
    { name: 'Definition', fields: [
      ['title', 'string', 'no', 'Definition page title'],
      ['featured_google_snippet', 'string', 'no', 'Optimized snippet text'],
      ['meta_description', 'string', 'no', 'Meta description'],
      ['seo_title', 'string', 'no', 'SEO title'],
      ['synonyms', 'string[]', 'no', 'Synonyms'],
      ['antonyms', 'string[]', 'no', 'Antonyms'],
      ['usage_examples', 'string[]', 'no', 'Example sentences'],
      ['related_keywords', 'string[]', 'no', 'Related keywords'],
      ['faqs', 'Array<{question,answer}>', 'no', 'FAQ pairs'],
    ]},
  ]
  for (const s of schemas) {
    lines.push(`### ${s.name} Fields`, '')
    lines.push('| Field | Type | Required | Description |')
    lines.push('|-------|------|----------|-------------|')
    for (const [name, type, req, desc] of s.fields) {
      lines.push(`| \`${name}\` | ${type} | ${req} | ${desc} |`)
    }
    lines.push('')
  }

  // 15. Errors
  lines.push('## 15. Errors', '')
  lines.push('| Status | Meaning |')
  lines.push('|--------|---------|')
  lines.push('| 200 | OK |')
  lines.push('| 202 | Accepted (job queued) |')
  lines.push('| 400 | Bad request |')
  lines.push('| 401 | Unauthorized |')
  lines.push('| 404 | Not found |')
  lines.push('| 500 | Internal error (retry safe) |', '')
  lines.push(j(payloads.errorResponse), '')

  // 16. Receiver
  lines.push('## 16. Reference Receiver', '')
  lines.push('```typescript')
  lines.push(payloads.receiverExample)
  lines.push('```', '')

  // 17. Versioning
  lines.push('## 17. Versioning', '')
  lines.push('- `contract_version` tracks the schema version')
  lines.push('- Additive changes ship without a version bump')
  lines.push('- Breaking changes trigger a version bump with deprecation notice', '')

  // === ELEMENT CONTENT SHAPES ===
  lines.push('---', '')
  lines.push('# Element Content Shapes', '')
  lines.push('Each element in `processed_content.elements[]` has an `element_type` and a `content` object. Below is every type.', '')

  for (const { type, docs } of elementDocs) {
    lines.push(`## \`${type}\` — ${docs.label}`, '')
    lines.push(docs.description, '')
    lines.push('| Field | Type | Required | Description |')
    lines.push('|-------|------|----------|-------------|')
    for (const f of docs.fields) {
      lines.push(`| \`${f.name}\` | ${f.type} | ${f.required ? 'yes' : 'no'} | ${f.description} |`)
    }
    lines.push('')
    lines.push('**Example:**')
    lines.push(j(docs.example), '')
    if (docs.hyperlinkFields?.length) {
      lines.push(`**Hyperlink-capable fields:** ${docs.hyperlinkFields.map(f => `\`${f}\``).join(', ')}`, '')
    }
    if (docs.legacyNotes) {
      lines.push(`> **Legacy note:** ${docs.legacyNotes}`, '')
    }
  }

  // === HYPERLINKS ===
  lines.push('---', '')
  lines.push('# Dictionary Hyperlinks', '')
  lines.push('OpenSEO matches dictionary keywords within post content and stores character-offset-based matches per text field.', '')
  lines.push('### HyperlinkMatch', '')
  lines.push(j({ keyword: 'A/B testing', description: 'A method of comparing...', matched_positions: [[45, 55]] }), '')
  lines.push('`matched_positions` is an array of `[start, end)` character offset tuples.', '')
  lines.push('### Standard elements', '')
  lines.push('`element.hyperlink.matched_keywords` is keyed by field name:', '')
  lines.push(j({ title: [{ keyword: 'conversion rate', description: '...', matched_positions: [[18, 33]] }], text: [{ keyword: 'A/B testing', description: '...', matched_positions: [[0, 11]] }] }), '')
  lines.push('### FAQ elements (per-item)', '')
  lines.push(j({ items: [{ question: [{ keyword: 'SEO', description: '...', matched_positions: [[8, 11]] }], answer: [] }] }), '')
  lines.push('### Rendering hyperlinked text', '')
  lines.push('```javascript')
  lines.push(`function renderHyperlinkedText(text, matches) {
  if (!matches?.length) return text
  const spans = matches
    .flatMap(m => (m.matched_positions || []).map(([s, e]) => ({ s, e, ...m })))
    .sort((a, b) => a.s - b.s)
  const parts = []
  let cursor = 0
  for (const { s, e, keyword, description } of spans) {
    if (s < cursor) continue
    if (s > cursor) parts.push(text.slice(cursor, s))
    parts.push(\`<a href="/dictionary/\${encodeURIComponent(keyword)}" title="\${description}">\${text.slice(s, e)}</a>\`)
    cursor = e
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return parts.join('')
}`)
  lines.push('```', '')

  // === CONSIDERATIONS ===
  lines.push('---', '')
  lines.push('# Integration Considerations', '')
  lines.push('- **Element ordering:** Always sort by `order` (ascending, 0-indexed)')
  lines.push('- **HTML in text fields:** Sanitize with DOMPurify before using dangerouslySetInnerHTML')
  lines.push('- **Image URL resolution:** Absolute → as-is. `/path` → prefix API base URL. Bare filename → `{base}/media/{name}`')
  lines.push('- **Cover image:** `payload.post.cover_image` is `{url, description}`. Separate from inline image elements.')
  lines.push('- **Unknown element types:** Render `content.title` + `content.text` as fallback')
  lines.push('- **Elements upsert:** Sending `elements` does replace-all. Omitting leaves untouched. `elements: []` clears.')
  lines.push('- **Legacy CTA fields:** `image_url`/`image`, `button_href`/`target_url`/`link` — check canonical first, fall back to alias')
  lines.push('')

  return lines.join('\n')
}
