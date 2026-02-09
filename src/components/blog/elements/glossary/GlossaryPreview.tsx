'use client'

import { renderMarkdownInline } from '@/lib/markdown'
import { BookOpen } from 'lucide-react'
import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'

import type { GlossaryTerm } from '@/types/content-elements'

interface GlossaryPreviewContent {
  title?: string
  terms: GlossaryTerm[] | Record<string, string>
}

function normalizeTerms(raw: unknown): GlossaryTerm[] {
  if (Array.isArray(raw)) {
    return raw.map((t: any) => ({ term: String(t?.term ?? ''), definition: String(t?.definition ?? '') }))
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw as Record<string, string>).map(([term, definition]) => ({ term, definition: String(definition ?? '') }))
  }
  return []
}

export function GlossaryPreview({ content }: PreviewComponentProps) {
  const glossaryContent = (content ?? {}) as GlossaryPreviewContent
  const terms = normalizeTerms(glossaryContent.terms)

  return (
    <BasePreview content={glossaryContent}>
      <h2 className="mb-4 flex items-center gap-2 text-[22px] font-semibold leading-tight tracking-tight text-foreground">
        <BookOpen className="h-5 w-5 text-primary" />
        <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(glossaryContent.title ?? '') }} />
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {terms.map((t, index) => (
          <div key={index} className="rounded-lg border border-border bg-card p-4">
            <dt className="text-[15px] font-semibold text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(t.term) }} />
            <dd className="mt-1 text-[14px] font-light leading-[1.6] text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(t.definition) }} />
          </div>
        ))}
      </div>
    </BasePreview>
  )
}
