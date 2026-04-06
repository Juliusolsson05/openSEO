import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAllElementDocs } from '@/components/blog/elements/docs-registry'
import { CopyToggleBar } from './CopyToggleBar'
import { buildFullMarkdown } from './PublishingDocsMarkdown'

/* ─── sample payloads ─── */

const outboundPostEnvelope = {
  contract_version: '2026-02-1',
  event: 'post.upsert',
  event_id: 'evt_a1b2c3d4-...',
  sent_at: '2026-02-07T15:00:00.000Z',
  payload: {
    post: {
      id: 123,
      title_text: 'How to Improve Conversion Rate',
      slug: 'how-to-improve-conversion-rate',
      seo_title: 'How to Improve Conversion Rate in 7 Steps',
      focus_keyword: 'conversion rate optimization',
      excerpt: 'A practical guide to improve conversion performance.',
      meta_description: 'Learn 7 practical CRO steps...',
      status: 'GENERATED',
      categories: ['SEO', 'Analytics'],
    },
    processed_content: {
      id: 123,
      elements: [
        { id: 1, order: 1, element_type: 'introduction', content: { text: '...' } },
        { id: 2, order: 2, element_type: 'paragraph', content: { title: '...', text: '...' } },
      ],
    },
  },
}

const outboundDictionaryEnvelope = {
  contract_version: '2026-02-1',
  event: 'dictionary.upsert',
  event_id: 'evt_e5f6g7h8-...',
  sent_at: '2026-02-07T15:00:00.000Z',
  payload: {
    dictionary: {
      id: 42,
      title: 'Marketing Glossary',
      subject: 'Digital Marketing',
      language: 'en',
      status: 'COMPLETED',
      current_letter: 'z',
      num_words: 150,
    },
    terms: [
      {
        id: 501,
        letter: 'a',
        keyword: 'A/B Testing',
        description: 'A method of comparing two versions...',
        priority: 'HIGH',
        focus_keyword: 'ab testing',
        definition: {
          title: 'What is A/B Testing?',
          featured_google_snippet: 'A/B testing is...',
          meta_description: 'Learn about A/B testing...',
          seo_title: 'A/B Testing — Definition & Guide',
          synonyms: ['split testing', 'bucket testing'],
          antonyms: [],
          usage_examples: ['We ran an A/B test on the landing page.'],
          related_keywords: ['multivariate testing', 'conversion optimization'],
          faqs: [{ question: 'How long should an A/B test run?', answer: 'At least 2 weeks...' }],
        },
      },
    ],
  },
}

const inboundPostUpsert = {
  event: 'post.upsert',
  event_id: 'my-system-evt-001',
  payload: {
    post: {
      id: 123,
      title_text: 'Updated Title',
      slug: 'updated-title',
      seo_title: 'Updated SEO Title',
      focus_keyword: 'updated keyword',
      excerpt: 'Updated excerpt.',
      meta_description: 'Updated meta description.',
      status: 'GENERATED',
      categories: ['Marketing'],
    },
    elements: [
      { order: 1, element_type: 'introduction', content: { text: '...' } },
      { order: 2, element_type: 'paragraph', content: { title: '...', text: '...' } },
    ],
  },
}

const inboundPostDelete = {
  event: 'post.delete',
  event_id: 'my-system-evt-002',
  payload: {
    post: { id: 123 },
  },
}

const inboundDictionaryUpsert = {
  event: 'dictionary.upsert',
  event_id: 'my-system-evt-003',
  payload: {
    dictionary: {
      title: 'Marketing Glossary',
      subject: 'Digital Marketing',
      language: 'en',
      num_words: 150,
      status: 'COMPLETED',
    },
  },
}

const inboundTermUpsert = {
  event: 'dictionary.term.upsert',
  event_id: 'my-system-evt-004',
  payload: {
    dictionary: { id: 42 },
    term: {
      keyword: 'A/B Testing',
      letter: 'a',
      description: 'A method of comparing two versions...',
      priority: 'HIGH',
      focus_keyword: 'ab testing',
      definition: {
        title: 'What is A/B Testing?',
        featured_google_snippet: 'A/B testing is a method...',
        meta_description: 'Learn about A/B testing...',
        seo_title: 'A/B Testing — Definition & Guide',
        synonyms: ['split testing'],
        antonyms: [],
        usage_examples: ['We ran an A/B test.'],
        related_keywords: ['multivariate testing'],
        faqs: [{ question: 'How long?', answer: 'At least 2 weeks.' }],
      },
    },
  },
}

const inboundTermDelete = {
  event: 'dictionary.term.delete',
  event_id: 'my-system-evt-005',
  payload: {
    dictionary: { id: 42 },
    term: { keyword: 'A/B Testing' },
  },
}

const inboundDictionaryDelete = {
  event: 'dictionary.delete',
  event_id: 'my-system-evt-006',
  payload: {
    dictionary: { id: 42 },
  },
}

const jobStatusResponse = {
  job_id: 'task_abc123',
  status: 'running',
  logs: [
    { stage: 'posts_push_all', type: 'planned', data: { count: 12 } },
    { stage: 'posts_push_all', type: 'completed_item', data: { post_id: 1, remote_id: 'r-1', http_status: 200 } },
  ],
  error: null,
}

const errorResponse = {
  success: false,
  error: { message: 'payload.post is required', code: 'VALIDATION_ERROR' },
}

const receiverExample = `// Example: Next.js API route receiver
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('authorization')?.replace('Bearer ', '')
  if (apiKey !== process.env.OPENSEO_OUTBOUND_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { event, event_id, payload } = body

  // Idempotency: check if event_id was already processed
  // const existing = await db.events.findUnique({ where: { event_id } })
  // if (existing) return NextResponse.json({ status: 'duplicate' })

  switch (event) {
    case 'post.upsert':
      // Upsert post into your CMS
      // await cms.posts.upsert(payload.post)
      // await cms.content.upsert(payload.processed_content)
      break
    case 'dictionary.upsert':
      // Upsert dictionary + terms
      break
    default:
      console.warn('Unknown event:', event)
  }

  return NextResponse.json({
    delivery_id: event_id,
    remote_id: \`your-system-\${payload.post?.id ?? 'unknown'}\`
  })
}`

/* ─── helpers ─── */

function Json({ data }: { data: unknown }) {
  return (
    <pre className="overflow-auto rounded-sm border border-border bg-secondary/30 p-3 text-xs leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-secondary/40 px-1 py-0.5 text-xs">{children}</code>
}

function FieldTable({ fields }: { fields: Array<{ name: string; type: string; required: boolean; description: string }> }) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-1.5 pr-3 font-medium">Field</th>
            <th className="pb-1.5 pr-3 font-medium">Type</th>
            <th className="pb-1.5 pr-3 font-medium">Req?</th>
            <th className="pb-1.5 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.name} className="border-b border-border/50">
              <td className="py-1 pr-3 font-mono">{f.name}</td>
              <td className="py-1 pr-3 text-muted-foreground">{f.type}</td>
              <td className="py-1 pr-3">{f.required ? <Badge variant="default" className="text-[9px]">yes</Badge> : <span className="text-muted-foreground">no</span>}</td>
              <td className="py-1 text-muted-foreground">{f.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-4 rounded-sm border-border bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4 text-sm">{children}</CardContent>
    </Card>
  )
}

/* ─── field schemas ─── */

const envelopeFields = [
  { name: 'contract_version', type: 'string', required: true, description: 'Semantic version of the contract format. Currently "2026-02-1".' },
  { name: 'event', type: 'string', required: true, description: 'Event type identifier (e.g. "post.upsert", "dictionary.term.delete").' },
  { name: 'event_id', type: 'string', required: true, description: 'Globally unique event ID for idempotency. Must be unique per company.' },
  { name: 'sent_at', type: 'ISO 8601', required: true, description: 'Timestamp of when the event was created.' },
  { name: 'payload', type: 'object', required: true, description: 'Event-specific payload. Structure varies by event type.' },
]

const postFields = [
  { name: 'id', type: 'number', required: false, description: 'OpenSEO post ID. Used for matching on upsert; required for delete if slug/remote_id not given.' },
  { name: 'title_text', type: 'string', required: true, description: 'Post title (plain text).' },
  { name: 'slug', type: 'string', required: false, description: 'URL-safe slug. Used as alternate lookup key.' },
  { name: 'seo_title', type: 'string', required: false, description: 'SEO-optimized title for search engines.' },
  { name: 'focus_keyword', type: 'string', required: false, description: 'Primary target keyword for SEO.' },
  { name: 'excerpt', type: 'string', required: false, description: 'Short summary / excerpt.' },
  { name: 'meta_description', type: 'string', required: false, description: 'Meta description for search engine results.' },
  { name: 'status', type: 'string', required: false, description: 'Post status. Values: DRAFT, GENERATED, PUBLISHED.' },
  { name: 'categories', type: 'string[]', required: false, description: 'List of category names.' },
]

const elementFields = [
  { name: 'id', type: 'number', required: false, description: 'Element ID in OpenSEO.' },
  { name: 'order', type: 'number', required: true, description: 'Display order (1-indexed).' },
  { name: 'element_type', type: 'string', required: true, description: 'Type: introduction, paragraph, conclusion, faq, list, cta, etc.' },
  { name: 'content', type: 'object', required: true, description: 'Content object. Shape depends on element_type. Usually { text } or { title, text }.' },
]

const dictionaryFields = [
  { name: 'id', type: 'number', required: false, description: 'OpenSEO dictionary ID. Used for matching on upsert.' },
  { name: 'title', type: 'string', required: true, description: 'Dictionary title. Used as alternate lookup key.' },
  { name: 'subject', type: 'string', required: true, description: 'Subject area (e.g. "Digital Marketing").' },
  { name: 'language', type: 'string', required: true, description: 'Language code (e.g. "en", "sv").' },
  { name: 'num_words', type: 'number', required: false, description: 'Total number of terms.' },
  { name: 'current_letter', type: 'string', required: false, description: 'Current generation progress letter.' },
  { name: 'status', type: 'string', required: false, description: 'Status: IN_PROGRESS, KEYWORD_GENERATION, DEFINITION_GENERATION, COMPLETED.' },
]

const termFields = [
  { name: 'id', type: 'number', required: false, description: 'OpenSEO term/word ID. Used for matching.' },
  { name: 'keyword', type: 'string', required: true, description: 'The term keyword. Also used as lookup key within dictionary.' },
  { name: 'letter', type: 'string', required: false, description: 'Alphabetical letter. Defaults to first letter of keyword.' },
  { name: 'description', type: 'string', required: true, description: 'Short description of the term.' },
  { name: 'priority', type: 'string', required: false, description: 'Priority: HIGH or LOW. Defaults to LOW.' },
  { name: 'focus_keyword', type: 'string', required: false, description: 'SEO focus keyword for the term.' },
]

const definitionFields = [
  { name: 'title', type: 'string', required: false, description: 'Definition page title.' },
  { name: 'featured_google_snippet', type: 'string', required: false, description: 'Optimized text for Google featured snippets.' },
  { name: 'meta_description', type: 'string', required: false, description: 'Meta description for the definition page.' },
  { name: 'seo_title', type: 'string', required: false, description: 'SEO title for the definition page.' },
  { name: 'synonyms', type: 'string[]', required: false, description: 'List of synonyms.' },
  { name: 'antonyms', type: 'string[]', required: false, description: 'List of antonyms.' },
  { name: 'usage_examples', type: 'string[]', required: false, description: 'Example sentences using the term.' },
  { name: 'related_keywords', type: 'string[]', required: false, description: 'Semantically related keywords.' },
  { name: 'faqs', type: 'Array<{question,answer}>', required: false, description: 'Frequently asked questions with answers. Each item has string "question" and "answer" fields.' },
]

/* ─── page ─── */

export default function PublishingApiDocsPage() {
  const elementDocs = getAllElementDocs()
  const markdown = buildFullMarkdown(elementDocs, {
    outboundPost: outboundPostEnvelope,
    outboundDictionary: outboundDictionaryEnvelope,
    inboundPostUpsert,
    inboundPostDelete,
    inboundDictionaryUpsert,
    inboundTermUpsert,
    inboundTermDelete,
    inboundDictionaryDelete,
    jobStatus: jobStatusResponse,
    errorResponse,
    receiverExample,
  })

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Publishing API Documentation</h1>
        <Link href="/settings" className="text-sm text-primary hover:underline">Back to settings</Link>
      </div>

      <CopyToggleBar markdown={markdown}>

      {/* ─── Table of contents ─── */}
      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Contents</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
            <li><a href="#overview" className="text-primary hover:underline">Overview</a></li>
            <li><a href="#auth" className="text-primary hover:underline">Authentication</a></li>
            <li><a href="#envelope" className="text-primary hover:underline">Envelope format</a></li>
            <li><a href="#idempotency" className="text-primary hover:underline">Idempotency</a></li>
            <li><a href="#outbound-posts" className="text-primary hover:underline">Outbound: Post sync</a></li>
            <li><a href="#outbound-dictionaries" className="text-primary hover:underline">Outbound: Dictionary sync</a></li>
            <li><a href="#jobs" className="text-primary hover:underline">Sync jobs &amp; polling</a></li>
            <li><a href="#inbound-post-upsert" className="text-primary hover:underline">Inbound: Post upsert</a></li>
            <li><a href="#inbound-post-delete" className="text-primary hover:underline">Inbound: Post delete</a></li>
            <li><a href="#inbound-dictionary-upsert" className="text-primary hover:underline">Inbound: Dictionary upsert</a></li>
            <li><a href="#inbound-dictionary-delete" className="text-primary hover:underline">Inbound: Dictionary delete</a></li>
            <li><a href="#inbound-term-upsert" className="text-primary hover:underline">Inbound: Term upsert</a></li>
            <li><a href="#inbound-term-delete" className="text-primary hover:underline">Inbound: Term delete</a></li>
            <li><a href="#schemas" className="text-primary hover:underline">Field schemas</a></li>
            <li><a href="#errors" className="text-primary hover:underline">Errors &amp; status codes</a></li>
            <li><a href="#receiver" className="text-primary hover:underline">Reference receiver</a></li>
            <li><a href="#versioning" className="text-primary hover:underline">Versioning policy</a></li>
            <li><a href="#troubleshooting" className="text-primary hover:underline">Troubleshooting</a></li>
            <li><a href="#element-catalog" className="text-primary hover:underline">Element content shapes</a></li>
            <li><a href="#hyperlinks" className="text-primary hover:underline">Dictionary hyperlinks</a></li>
            <li><a href="#considerations" className="text-primary hover:underline">Integration considerations</a></li>
          </ol>
        </CardContent>
      </Card>

      {/* ─── 1. Overview ─── */}
      <Section id="overview" title="1. Overview" description="How OpenSEO's publishing system works at a high level.">
        <p className="text-muted-foreground">
          OpenSEO supports bidirectional content sync between your CMS/frontend and OpenSEO through JSON webhooks.
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li><strong>Outbound (OpenSEO → Your system):</strong> OpenSEO pushes content to your configured endpoint when you trigger a sync. Posts and dictionaries are delivered as JSON envelopes containing full content payloads.</li>
          <li><strong>Inbound (Your system → OpenSEO):</strong> Your system sends content updates to OpenSEO&apos;s inbound endpoints using an API key you generate inside OpenSEO. Supports create, update, and delete operations for posts, dictionaries, and terms.</li>
          <li><strong>Jobs:</strong> Bulk sync operations run asynchronously. You receive a <Code>job_id</Code> immediately and can poll for status updates until completion.</li>
        </ul>
        <div className="rounded-sm border border-border bg-secondary/20 p-3">
          <p className="text-xs font-medium">Data flow</p>
          <pre className="mt-1 text-xs text-muted-foreground">{`Your system ←── outbound (OpenSEO pushes JSON to your endpoint)
Your system ──→ inbound  (You POST JSON to OpenSEO's inbound endpoints)`}</pre>
        </div>
      </Section>

      {/* ─── 2. Authentication ─── */}
      <Section id="auth" title="2. Authentication" description="Two separate key models: one for outbound delivery, one for inbound writes.">
        <div className="space-y-3">
          <div>
            <p className="font-medium">Outbound key (OpenSEO → Your system)</p>
            <p className="text-muted-foreground">Configured in Settings → API Configuration. OpenSEO sends this key as <Code>Authorization: Bearer {'<key>'}</Code> to your endpoint so you can verify requests are from OpenSEO.</p>
          </div>
          <div>
            <p className="font-medium">Inbound key (Your system → OpenSEO)</p>
            <p className="text-muted-foreground">Generated in Settings → Inbound API Keys. Send it to OpenSEO as one of:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
              <li><Code>Authorization: Bearer {'<aurora_inbound_key>'}</Code></li>
              <li><Code>X-Aurora-Inbound-Key: {'<aurora_inbound_key>'}</Code></li>
            </ul>
          </div>
          <div className="rounded-sm border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
            <strong>Important:</strong> Inbound keys are shown only once on creation. Copy immediately. Keys can be revoked but not re-displayed. Rotate keys by creating a new one and revoking the old.
          </div>
        </div>
      </Section>

      {/* ─── 3. Envelope format ─── */}
      <Section id="envelope" title="3. Envelope format" description="Every outbound event and inbound request uses the same top-level structure.">
        <FieldTable fields={envelopeFields} />
        <p className="text-xs text-muted-foreground">
          For outbound events, <Code>event_id</Code> is auto-generated by OpenSEO (format: <Code>evt_{'<uuid>'}</Code>). For inbound requests, you must provide your own unique <Code>event_id</Code>.
        </p>
      </Section>

      {/* ─── 4. Idempotency ─── */}
      <Section id="idempotency" title="4. Idempotency" description="Duplicate event protection for safe retries.">
        <p className="text-muted-foreground">
          Every inbound request requires an <Code>event_id</Code> that is unique within your company scope.
          If OpenSEO receives a request with an <Code>event_id</Code> that has already been processed, it returns:
        </p>
        <Json data={{ status: 'duplicate_ignored', event_id: 'my-system-evt-001' }} />
        <p className="text-muted-foreground">
          This means you can safely retry failed requests without worrying about double-writes. OpenSEO checks the <Code>event_id</Code> against all previously processed inbound events for your company.
        </p>
        <div className="rounded-sm border border-border bg-secondary/20 p-2.5 text-xs text-muted-foreground">
          <strong>Recommendation:</strong> Use a deterministic event ID format like <Code>{'<entity>-<action>-<your-id>-<timestamp>'}</Code> (e.g. <Code>post-upsert-456-1707307200</Code>).
        </div>
      </Section>

      {/* ─── 5. Outbound: Post sync ─── */}
      <Section id="outbound-posts" title="5. Outbound: Post sync" description="Push all generated posts to your endpoint.">
        <div className="space-y-1">
          <p><Badge variant="outline">POST</Badge> <Code>/api/v1/publishing/sync/posts/all</Code></p>
          <p className="text-xs text-muted-foreground">Requires session auth. Triggers async push of all posts with status GENERATED.</p>
        </div>
        <div>
          <p className="text-xs font-medium">Response (202 Accepted)</p>
          <Json data={{ job_id: 'task_abc123', status: 'accepted' }} />
        </div>
        <div>
          <p className="text-xs font-medium">Envelope delivered per post to your endpoint</p>
          <Json data={outboundPostEnvelope} />
        </div>
        <p className="text-xs text-muted-foreground">
          OpenSEO expects your endpoint to return 2xx. Optionally include <Code>delivery_id</Code>, <Code>remote_id</Code>, or <Code>id</Code> in your JSON response — OpenSEO stores it as the remote publish mapping.
        </p>
      </Section>

      {/* ─── 6. Outbound: Dictionary sync ─── */}
      <Section id="outbound-dictionaries" title="6. Outbound: Dictionary sync" description="Push all dictionaries with their terms and definitions.">
        <div className="space-y-1">
          <p><Badge variant="outline">POST</Badge> <Code>/api/v1/publishing/sync/dictionaries/all</Code></p>
          <p className="text-xs text-muted-foreground">Requires session auth. Triggers async push of all company dictionaries.</p>
        </div>
        <div>
          <p className="text-xs font-medium">Response (202 Accepted)</p>
          <Json data={{ job_id: 'task_def456', status: 'accepted' }} />
        </div>
        <div>
          <p className="text-xs font-medium">Envelope delivered per dictionary to your endpoint</p>
          <Json data={outboundDictionaryEnvelope} />
        </div>
      </Section>

      {/* ─── 7. Jobs ─── */}
      <Section id="jobs" title="7. Sync jobs & polling" description="Track the progress of bulk sync operations.">
        <div className="space-y-1">
          <p><Badge variant="outline">GET</Badge> <Code>/api/v1/publishing/jobs/{'{jobId}'}</Code></p>
          <p className="text-xs text-muted-foreground">Returns current status, logs, and error (if any) for an async sync job.</p>
        </div>
        <div>
          <p className="text-xs font-medium">Job lifecycle</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Badge variant="secondary">accepted</Badge> → <Badge variant="secondary">running</Badge> → <Badge variant="default">completed</Badge> or <Badge variant="destructive">failed</Badge>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium">Example response</p>
          <Json data={jobStatusResponse} />
        </div>
        <div>
          <p className="text-xs font-medium">Log entry types</p>
          <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
            <li><Code>planned</Code> — Job started, includes <Code>count</Code> of items to process.</li>
            <li><Code>completed_item</Code> — One item was successfully delivered. Includes entity ID, remote ID, and HTTP status.</li>
          </ul>
        </div>
        <div className="rounded-sm border border-border bg-secondary/20 p-2.5 text-xs text-muted-foreground">
          <strong>Polling recommendation:</strong> Poll every 2–5 seconds. Jobs are held in memory and expire after the server restarts. For long-running syncs, check status promptly.
        </div>
        <div>
          <p className="text-xs font-medium">404 response (job expired or not found)</p>
          <Json data={{ job_id: 'task_abc123', status: 'not_available', detail: 'Job not found or expired' }} />
        </div>
      </Section>

      {/* ─── 8. Inbound: Post upsert ─── */}
      <Section id="inbound-post-upsert" title="8. Inbound: Post upsert" description="Create or update a post in OpenSEO from your system.">
        <div className="space-y-1">
          <p><Badge variant="outline">POST</Badge> <Code>/api/v1/publishing/inbound/post/upsert</Code></p>
          <p className="text-xs text-muted-foreground">Requires inbound API key. Upserts a blog post and optionally its content elements.</p>
        </div>
        <div>
          <p className="text-xs font-medium">Matching logic</p>
          <ol className="list-decimal space-y-0.5 pl-5 text-xs text-muted-foreground">
            <li>Match by <Code>payload.post.id</Code> (OpenSEO post ID) if provided.</li>
            <li>Match by <Code>payload.post.slug</Code> within your company if no ID match.</li>
            <li>If no match found → creates a new post.</li>
            <li>If match found → updates existing post fields (only fields present in payload are changed).</li>
          </ol>
        </div>
        <div>
          <p className="text-xs font-medium">Request body</p>
          <Json data={inboundPostUpsert} />
        </div>
        <div>
          <p className="text-xs font-medium">Success response (200)</p>
          <Json data={{ status: 'processed', post_id: 123, event_id: 'my-system-evt-001' }} />
        </div>
      </Section>

      {/* ─── 9. Inbound: Post delete ─── */}
      <Section id="inbound-post-delete" title="9. Inbound: Post delete" description="Delete a post from OpenSEO.">
        <div className="space-y-1">
          <p><Badge variant="outline">POST</Badge> <Code>/api/v1/publishing/inbound/post/delete</Code></p>
          <p className="text-xs text-muted-foreground">Requires inbound API key. Permanently deletes a post.</p>
        </div>
        <div>
          <p className="text-xs font-medium">Matching logic</p>
          <ol className="list-decimal space-y-0.5 pl-5 text-xs text-muted-foreground">
            <li>Match by <Code>payload.post.id</Code> (OpenSEO post ID).</li>
            <li>Match by <Code>payload.post.remote_id</Code> (via publish mapping).</li>
            <li>Match by <Code>payload.post.slug</Code>.</li>
            <li>If no match → returns validation error.</li>
          </ol>
        </div>
        <div>
          <p className="text-xs font-medium">Request body</p>
          <Json data={inboundPostDelete} />
        </div>
        <div>
          <p className="text-xs font-medium">Success response (200)</p>
          <Json data={{ status: 'processed', deleted_post_id: 123, event_id: 'my-system-evt-002' }} />
        </div>
      </Section>

      {/* ─── 10. Inbound: Dictionary upsert ─── */}
      <Section id="inbound-dictionary-upsert" title="10. Inbound: Dictionary upsert" description="Create or update a dictionary in OpenSEO.">
        <div className="space-y-1">
          <p><Badge variant="outline">POST</Badge> <Code>/api/v1/publishing/inbound/dictionary/upsert</Code></p>
          <p className="text-xs text-muted-foreground">Requires inbound API key.</p>
        </div>
        <div>
          <p className="text-xs font-medium">Matching logic</p>
          <ol className="list-decimal space-y-0.5 pl-5 text-xs text-muted-foreground">
            <li>Match by <Code>payload.dictionary.id</Code>.</li>
            <li>Match by <Code>payload.dictionary.title</Code> within company.</li>
            <li>No match → creates new dictionary (requires title, subject, language).</li>
            <li>Match → updates only the provided fields.</li>
          </ol>
        </div>
        <div>
          <p className="text-xs font-medium">Request body</p>
          <Json data={inboundDictionaryUpsert} />
        </div>
        <div>
          <p className="text-xs font-medium">Success response (200)</p>
          <Json data={{ status: 'processed', dictionary_id: 42, event_id: 'my-system-evt-003' }} />
        </div>
      </Section>

      {/* ─── 11. Inbound: Dictionary delete ─── */}
      <Section id="inbound-dictionary-delete" title="11. Inbound: Dictionary delete" description="Delete a dictionary and all its terms.">
        <div className="space-y-1">
          <p><Badge variant="outline">POST</Badge> <Code>/api/v1/publishing/inbound/dictionary/delete</Code></p>
          <p className="text-xs text-muted-foreground">Requires inbound API key. Cascade-deletes all terms within the dictionary.</p>
        </div>
        <div>
          <p className="text-xs font-medium">Request body</p>
          <Json data={inboundDictionaryDelete} />
        </div>
        <div>
          <p className="text-xs font-medium">Success response (200)</p>
          <Json data={{ status: 'processed', deleted_dictionary_id: 42, event_id: 'my-system-evt-006' }} />
        </div>
      </Section>

      {/* ─── 12. Inbound: Term upsert ─── */}
      <Section id="inbound-term-upsert" title="12. Inbound: Term upsert" description="Create or update a term within a dictionary.">
        <div className="space-y-1">
          <p><Badge variant="outline">POST</Badge> <Code>/api/v1/publishing/inbound/dictionary/term/upsert</Code></p>
          <p className="text-xs text-muted-foreground">Requires inbound API key. Must reference a dictionary by ID or title.</p>
        </div>
        <div>
          <p className="text-xs font-medium">Matching logic (dictionary)</p>
          <ol className="list-decimal space-y-0.5 pl-5 text-xs text-muted-foreground">
            <li>Match by <Code>payload.dictionary.id</Code>.</li>
            <li>Match by <Code>payload.dictionary.title</Code>.</li>
          </ol>
        </div>
        <div>
          <p className="text-xs font-medium">Matching logic (term)</p>
          <ol className="list-decimal space-y-0.5 pl-5 text-xs text-muted-foreground">
            <li>Match by <Code>payload.term.id</Code> within the dictionary.</li>
            <li>Match by <Code>payload.term.keyword</Code> within the dictionary.</li>
            <li>No match → creates new term (requires keyword, description).</li>
            <li>Match → updates only provided fields.</li>
          </ol>
        </div>
        <div>
          <p className="text-xs font-medium">Request body (with full definition)</p>
          <Json data={inboundTermUpsert} />
        </div>
        <div>
          <p className="text-xs font-medium">Success response (200)</p>
          <Json data={{ status: 'processed', dictionary_id: 42, word_id: 501, event_id: 'my-system-evt-004' }} />
        </div>
        <p className="text-xs text-muted-foreground">
          The <Code>definition</Code> object is optional. If included, it will be created or updated (full replace on the definition record).
        </p>
      </Section>

      {/* ─── 13. Inbound: Term delete ─── */}
      <Section id="inbound-term-delete" title="13. Inbound: Term delete" description="Delete a term from a dictionary.">
        <div className="space-y-1">
          <p><Badge variant="outline">POST</Badge> <Code>/api/v1/publishing/inbound/dictionary/term/delete</Code></p>
          <p className="text-xs text-muted-foreground">Requires inbound API key. Deletes the term and its definition.</p>
        </div>
        <div>
          <p className="text-xs font-medium">Request body</p>
          <Json data={inboundTermDelete} />
        </div>
        <div>
          <p className="text-xs font-medium">Success response (200)</p>
          <Json data={{ status: 'processed', deleted_term_id: 501, event_id: 'my-system-evt-005' }} />
        </div>
      </Section>

      {/* ─── 14. Field schemas ─── */}
      <Section id="schemas" title="14. Field schemas" description="Detailed field reference for all entity types.">
        <details className="rounded-sm border border-border" open>
          <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium uppercase tracking-wide">Post fields</summary>
          <div className="border-t border-border p-3"><FieldTable fields={postFields} /></div>
        </details>
        <details className="rounded-sm border border-border">
          <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium uppercase tracking-wide">Element fields (processed_content.elements[])</summary>
          <div className="border-t border-border p-3"><FieldTable fields={elementFields} /></div>
        </details>
        <details className="rounded-sm border border-border">
          <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium uppercase tracking-wide">Dictionary fields</summary>
          <div className="border-t border-border p-3"><FieldTable fields={dictionaryFields} /></div>
        </details>
        <details className="rounded-sm border border-border">
          <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium uppercase tracking-wide">Term fields</summary>
          <div className="border-t border-border p-3"><FieldTable fields={termFields} /></div>
        </details>
        <details className="rounded-sm border border-border">
          <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium uppercase tracking-wide">Definition fields (term.definition)</summary>
          <div className="border-t border-border p-3"><FieldTable fields={definitionFields} /></div>
        </details>
      </Section>

      {/* ─── 15. Errors ─── */}
      <Section id="errors" title="15. Errors & status codes" description="HTTP status codes and error response format.">
        <div className="space-y-2">
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-1.5 pr-4 font-medium">Status</th>
                  <th className="pb-1.5 pr-4 font-medium">Meaning</th>
                  <th className="pb-1.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50"><td className="py-1 pr-4 font-mono">200</td><td className="py-1 pr-4">OK</td><td className="py-1">Inbound processed successfully.</td></tr>
                <tr className="border-b border-border/50"><td className="py-1 pr-4 font-mono">202</td><td className="py-1 pr-4">Accepted</td><td className="py-1">Sync job queued.</td></tr>
                <tr className="border-b border-border/50"><td className="py-1 pr-4 font-mono">400</td><td className="py-1 pr-4">Bad Request</td><td className="py-1">Missing required fields, invalid payload.</td></tr>
                <tr className="border-b border-border/50"><td className="py-1 pr-4 font-mono">401</td><td className="py-1 pr-4">Unauthorized</td><td className="py-1">Missing or invalid inbound API key.</td></tr>
                <tr className="border-b border-border/50"><td className="py-1 pr-4 font-mono">404</td><td className="py-1 pr-4">Not Found</td><td className="py-1">Entity not found (delete of non-existent post/term), or job expired.</td></tr>
                <tr className="border-b border-border/50"><td className="py-1 pr-4 font-mono">500</td><td className="py-1 pr-4">Internal Error</td><td className="py-1">Server error. Retry with same event_id is safe.</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <p className="text-xs font-medium">Error response format</p>
            <Json data={errorResponse} />
          </div>
        </div>
      </Section>

      {/* ─── 16. Reference receiver ─── */}
      <Section id="receiver" title="16. Reference receiver" description="Example implementation for receiving outbound webhooks from OpenSEO.">
        <pre className="overflow-auto rounded-sm border border-border bg-secondary/30 p-3 text-xs leading-relaxed">{receiverExample}</pre>
        <p className="text-xs text-muted-foreground">
          This is a minimal Next.js API route. Adapt the auth check, idempotency storage, and CMS integration to your stack.
          The key requirement is: return 2xx and optionally include a <Code>remote_id</Code> or <Code>delivery_id</Code> in your response body.
        </p>
      </Section>

      {/* ─── 17. Versioning ─── */}
      <Section id="versioning" title="17. Versioning policy" description="How contract changes are managed.">
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>The <Code>contract_version</Code> field in outbound envelopes tracks the schema version.</li>
          <li>Additive changes (new optional fields) are shipped without a version bump.</li>
          <li>Breaking changes (field removal, type changes, required field additions) trigger a version bump.</li>
          <li>OpenSEO will include a deprecation notice in the envelope for at least one release before removing fields.</li>
          <li>Your receiver should handle unknown fields gracefully (ignore, don&apos;t reject).</li>
        </ul>
      </Section>

      {/* ─── 18. Troubleshooting ─── */}
      <Section id="troubleshooting" title="18. Troubleshooting" description="Common integration issues and fixes.">
        <div className="space-y-3">
          <details className="rounded-sm border border-border">
            <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium">Sync job shows &quot;failed&quot; immediately</summary>
            <div className="border-t border-border p-3 text-xs text-muted-foreground">
              <p>Check that your publishing endpoint is configured in Settings → API Configuration. The endpoint must be reachable from OpenSEO&apos;s server and return 2xx.</p>
            </div>
          </details>
          <details className="rounded-sm border border-border">
            <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium">Inbound request returns 401</summary>
            <div className="border-t border-border p-3 text-xs text-muted-foreground">
              <p>Ensure you&apos;re sending the inbound API key as <Code>Authorization: Bearer {'<key>'}</Code> or <Code>X-Aurora-Inbound-Key: {'<key>'}</Code>. Keys are company-scoped — verify you&apos;re using a key for the correct company.</p>
            </div>
          </details>
          <details className="rounded-sm border border-border">
            <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium">Inbound returns &quot;duplicate_ignored&quot;</summary>
            <div className="border-t border-border p-3 text-xs text-muted-foreground">
              <p>This means the <Code>event_id</Code> was already processed. Use a new unique <Code>event_id</Code> for each distinct operation. If you need to retry, the duplicate response is safe and expected.</p>
            </div>
          </details>
          <details className="rounded-sm border border-border">
            <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium">Post upsert creates a new post instead of updating</summary>
            <div className="border-t border-border p-3 text-xs text-muted-foreground">
              <p>OpenSEO matches by <Code>id</Code> first, then <Code>slug</Code>. Make sure you&apos;re sending the OpenSEO post ID or the exact slug. Title alone is not used for matching.</p>
            </div>
          </details>
          <details className="rounded-sm border border-border">
            <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium">Job status returns &quot;not_available&quot;</summary>
            <div className="border-t border-border p-3 text-xs text-muted-foreground">
              <p>Jobs are stored in memory and expire on server restart. If the server was restarted between job creation and status check, the job data is lost. Re-trigger the sync if needed.</p>
            </div>
          </details>
          <details className="rounded-sm border border-border">
            <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium">Dictionary term upsert returns &quot;Dictionary not found&quot;</summary>
            <div className="border-t border-border p-3 text-xs text-muted-foreground">
              <p>The term upsert requires an existing dictionary. Create the dictionary first via the dictionary upsert endpoint, then upsert terms into it. Reference the dictionary by <Code>id</Code> (preferred) or <Code>title</Code>.</p>
            </div>
          </details>
          <details className="rounded-sm border border-border">
            <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium">Outbound webhook not reaching my endpoint</summary>
            <div className="border-t border-border p-3 text-xs text-muted-foreground">
              <p>Verify: (1) your endpoint URL is correct in Settings, (2) it accepts POST with JSON, (3) there&apos;s no firewall blocking OpenSEO&apos;s IP, (4) check the job logs for HTTP status codes — they&apos;ll show exactly what response OpenSEO received.</p>
            </div>
          </details>
        </div>
      </Section>

      {/* ─── 19. Element content shapes ─── */}
      <Section id="element-catalog" title="19. Element content shapes" description={`Every element_type and its content JSON shape (${elementDocs.length} types).`}>
        <p className="text-muted-foreground">
          When OpenSEO pushes a post, <Code>processed_content.elements[]</Code> contains typed content blocks. Each element has an <Code>element_type</Code> string and a <Code>content</Code> object whose shape depends on the type.
        </p>
        {elementDocs.map(({ type, docs }) => (
          <details key={type} className="rounded-sm border border-border">
            <summary className="cursor-pointer bg-background px-3 py-2 text-xs font-medium">
              <Code>{type}</Code> — {docs.description}
            </summary>
            <div className="border-t border-border p-3 space-y-3">
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-1.5 pr-3 font-medium">Field</th>
                      <th className="pb-1.5 pr-3 font-medium">Type</th>
                      <th className="pb-1.5 pr-3 font-medium">Req?</th>
                      <th className="pb-1.5 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.fields.map((f) => (
                      <tr key={f.name} className="border-b border-border/50">
                        <td className="py-1 pr-3 font-mono">{f.name}</td>
                        <td className="py-1 pr-3 text-muted-foreground">{f.type}</td>
                        <td className="py-1 pr-3">{f.required ? <Badge variant="default" className="text-[9px]">yes</Badge> : <span className="text-muted-foreground">no</span>}</td>
                        <td className="py-1 text-muted-foreground">{f.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Json data={docs.example} />
              {docs.hyperlinkFields && docs.hyperlinkFields.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <strong>Hyperlink-capable fields:</strong>{' '}
                  {docs.hyperlinkFields.map((f, i) => (
                    <span key={f}>{i > 0 && ', '}<Code>{f}</Code></span>
                  ))}
                </p>
              )}
              {docs.legacyNotes && (
                <div className="rounded-sm border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                  <strong>Legacy note:</strong> {docs.legacyNotes}
                </div>
              )}
            </div>
          </details>
        ))}
      </Section>

      {/* ─── 20. Dictionary hyperlinks ─── */}
      <Section id="hyperlinks" title="20. Dictionary hyperlinks" description="How OpenSEO links dictionary terms within element content.">
        <p className="text-muted-foreground">
          When a company has a dictionary, OpenSEO matches dictionary keywords within post content and stores character-offset-based matches per text field. Each element can have an optional <Code>hyperlink</Code> field containing a <Code>matched_keywords</Code> object.
        </p>
        <div>
          <p className="text-xs font-medium">HyperlinkMatch structure</p>
          <Json data={{ keyword: 'A/B testing', description: 'A method of comparing...', matched_positions: [[45, 55]] }} />
          <p className="mt-1 text-xs text-muted-foreground">
            <Code>matched_positions</Code> is an array of <Code>[start, end)</Code> tuples. Wrap the text from <Code>start</Code> to <Code>end</Code> (exclusive) in a link to <Code>/dictionary/{'{keyword}'}</Code>.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium">Standard elements — keyed by field name</p>
          <Json data={{ title: [{ keyword: 'conversion rate', description: '...', matched_positions: [[18, 33]] }], text: [{ keyword: 'A/B testing', description: '...', matched_positions: [[0, 11]] }] }} />
        </div>
        <div>
          <p className="text-xs font-medium">FAQ elements — per-item parallel array</p>
          <Json data={{ items: [{ question: [{ keyword: 'SEO', description: '...', matched_positions: [[8, 11]] }], answer: [] }] }} />
        </div>
        <div className="rounded-sm border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
          <strong>Legacy support:</strong> Older data may lack <Code>matched_positions</Code>. Fall back to simple substring matching if the array is missing.
        </div>
      </Section>

      {/* ─── 21. Integration considerations ─── */}
      <Section id="considerations" title="21. Integration considerations" description="Practical notes for building a robust integration.">
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li><strong>Element ordering:</strong> Always sort by <Code>order</Code> (ascending, 0-indexed). Do not rely on array position.</li>
          <li><strong>HTML in text fields:</strong> Text may contain basic HTML (bold, italic, links). Sanitize with DOMPurify before using <Code>dangerouslySetInnerHTML</Code>.</li>
          <li><strong>Image URL resolution:</strong> Absolute URLs — use as-is. Paths starting with <Code>/</Code> — prefix with API base URL. Bare filenames — prefix with <Code>{'{base_url}/media/'}</Code>.</li>
          <li><strong>Cover image:</strong> Post-level cover image is at <Code>payload.post.cover_image</Code> — object with <Code>{'{url, description}'}</Code>. Separate from inline <Code>image</Code> elements.</li>
          <li><strong>Unknown element types:</strong> Render <Code>content.title</Code> + <Code>content.text</Code> as fallback. New types may be added.</li>
          <li><strong>Elements upsert:</strong> Sending <Code>elements</Code> in inbound post.upsert does a <strong>replace-all</strong>. Omitting leaves them untouched. Send <Code>elements: []</Code> to clear.</li>
        </ul>
      </Section>

      </CopyToggleBar>

      <div className="pb-8 text-center text-xs text-muted-foreground">
        Contract version: 2026-02-1 · <Link href="/settings" className="text-primary hover:underline">Back to settings</Link>
      </div>
    </div>
  )
}
