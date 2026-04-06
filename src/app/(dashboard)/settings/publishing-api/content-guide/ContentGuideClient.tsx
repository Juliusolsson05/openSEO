'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ElementDocs } from '@/components/blog/elements/docs-types'

/* ─── Markdown serializer ─── */

function docsToMarkdown(elementDocs: Array<{ type: string; docs: ElementDocs }>): string {
  const lines: string[] = [
    '# OpenSEO Content Shape & Integration Guide',
    '',
    '## Element Types',
    '',
    'Each element in `processed_content.elements[]` has an `element_type` string and a `content` object. Below is every type with its content shape.',
    '',
  ]

  for (const { type, docs } of elementDocs) {
    lines.push(`### \`${type}\` — ${docs.label}`)
    lines.push('')
    lines.push(docs.description)
    lines.push('')
    lines.push('| Field | Type | Required | Description |')
    lines.push('|-------|------|----------|-------------|')
    for (const f of docs.fields) {
      lines.push(`| \`${f.name}\` | ${f.type} | ${f.required ? 'yes' : 'no'} | ${f.description} |`)
    }
    lines.push('')
    lines.push('**Example:**')
    lines.push('```json')
    lines.push(JSON.stringify(docs.example, null, 2))
    lines.push('```')
    lines.push('')
    if (docs.hyperlinkFields?.length) {
      lines.push(`**Hyperlink-capable fields:** ${docs.hyperlinkFields.map(f => `\`${f}\``).join(', ')}`)
      lines.push('')
    }
    if (docs.legacyNotes) {
      lines.push(`> **Legacy note:** ${docs.legacyNotes}`)
      lines.push('')
    }
  }

  lines.push('---', '')
  lines.push('## Dictionary Hyperlinks', '')
  lines.push('When a company has a dictionary, OpenSEO matches dictionary keywords within post content and stores character-offset-based matches per text field.', '')
  lines.push('### HyperlinkMatch structure', '')
  lines.push('```json')
  lines.push(JSON.stringify({ keyword: 'A/B testing', description: 'A method of comparing...', matched_positions: [[45, 55]] }, null, 2))
  lines.push('```', '')
  lines.push('`matched_positions` is an array of `[start, end)` character offset tuples into the original text string.', '')
  lines.push('### matched_keywords structure (standard elements)', '')
  lines.push('`element.hyperlink.matched_keywords` is keyed by field name:', '')
  lines.push('```json')
  lines.push(JSON.stringify({ title: [{ keyword: 'conversion rate', description: '...', matched_positions: [[18, 33]] }], text: [{ keyword: 'A/B testing', description: '...', matched_positions: [[0, 11]] }] }, null, 2))
  lines.push('```', '')
  lines.push('### FAQ hyperlinks (per-item)', '')
  lines.push('FAQ elements use a parallel array under `matched_keywords.items`:', '')
  lines.push('```json')
  lines.push(JSON.stringify({ items: [{ question: [{ keyword: 'SEO', description: '...', matched_positions: [[8, 11]] }], answer: [] }] }, null, 2))
  lines.push('```', '')
  lines.push('### Rendering hyperlinked text', '')
  lines.push('Sort matches by start offset, skip overlaps, splice `<a>` tags:', '')
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

  lines.push('---', '')
  lines.push('## Integration Considerations', '')
  lines.push('- **Element ordering:** Always sort by `order` (ascending, 0-indexed). Do not rely on array position.')
  lines.push('- **HTML in text fields:** Text may contain basic HTML (bold, italic, links). Sanitize with DOMPurify before using dangerouslySetInnerHTML.')
  lines.push('- **Image URL resolution:** Absolute URLs → use as-is. Paths starting with `/` → prefix with API base URL. Bare filenames → prefix with `{base_url}/media/`.')
  lines.push('- **Cover image:** Post-level cover image is at `payload.post.cover_image` — object with `{url, description}`. Separate from inline `image` elements.')
  lines.push('- **Unknown element types:** Render `content.title` + `content.text` as a fallback paragraph. New types may be added.')
  lines.push('- **Elements upsert:** Sending `elements` in inbound post.upsert does a **replace-all**. Omitting leaves them untouched. Send `elements: []` to clear.')
  lines.push('- **Legacy field aliases:** CTA uses `image_url`/`image` and `button_href`/`target_url`/`link`. Always check canonical field first, fall back to aliases.')
  lines.push('')

  return lines.join('\n')
}

/* ─── Helpers ─── */

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

/* ─── Main Component ─── */

export function ContentGuideClient({ elementDocs }: { elementDocs: Array<{ type: string; docs: ElementDocs }> }) {
  const [rawMode, setRawMode] = useState(false)
  const [copied, setCopied] = useState(false)

  const markdown = useCallback(() => docsToMarkdown(elementDocs), [elementDocs])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(markdown())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [markdown])

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Content Shape & Integration Guide</h1>
        <Link href="/settings/publishing-api" className="text-sm text-primary hover:underline">Back to Publishing API docs</Link>
      </div>

      {/* Copy + toggle bar */}
      <Card className="rounded-sm border-border bg-white">
        <CardContent className="flex items-center justify-between py-3">
          <p className="text-sm text-muted-foreground">
            {elementDocs.length} element types documented. Copy as markdown to paste into your AI agent or codebase.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setRawMode(!rawMode)}>
              {rawMode ? 'Rendered view' : 'Raw markdown'}
            </Button>
            <Button size="sm" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy Markdown'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {rawMode ? (
        <Card className="rounded-sm border-border bg-white">
          <CardContent className="p-0">
            <pre className="overflow-auto whitespace-pre-wrap p-4 text-xs leading-relaxed font-mono text-muted-foreground">
              {markdown()}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Element catalog */}
          <Section id="element-catalog" title="Element Type Catalog" description={`Every element_type and its content JSON shape (${elementDocs.length} types).`}>
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

          {/* Hyperlinks section */}
          <Section id="hyperlinks" title="Dictionary Hyperlinks" description="How OpenSEO links dictionary terms within element content.">
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

          {/* Considerations section */}
          <Section id="considerations" title="Integration Considerations" description="Practical notes for building a robust integration.">
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li><strong>Element ordering:</strong> Always sort by <Code>order</Code> (ascending, 0-indexed). Do not rely on array position.</li>
              <li><strong>HTML in text fields:</strong> Text may contain basic HTML (bold, italic, links). Sanitize with DOMPurify before using <Code>dangerouslySetInnerHTML</Code>.</li>
              <li><strong>Image URL resolution:</strong> Absolute URLs — use as-is. Paths starting with <Code>/</Code> — prefix with API base URL. Bare filenames — prefix with <Code>{'{base_url}/media/'}</Code>.</li>
              <li><strong>Cover image:</strong> Post-level cover image is at <Code>payload.post.cover_image</Code> — object with <Code>{'{url, description}'}</Code>. Separate from inline <Code>image</Code> elements.</li>
              <li><strong>Unknown element types:</strong> Render <Code>content.title</Code> + <Code>content.text</Code> as fallback. New types may be added.</li>
              <li><strong>Elements upsert:</strong> Sending <Code>elements</Code> in inbound post.upsert does a <strong>replace-all</strong>. Omitting leaves them untouched. Send <Code>elements: []</Code> to clear.</li>
            </ul>
          </Section>
        </>
      )}

      <div className="pb-8 text-center text-xs text-muted-foreground">
        <Link href="/settings/publishing-api" className="text-primary hover:underline">Back to Publishing API docs</Link>
      </div>
    </div>
  )
}
