'use client'

import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { ExternalLink, CheckCircle2, Quote, Building2, ArrowRight } from 'lucide-react'
import type { ElementComponentProps } from '../registry'
import { extractDomain } from '@/lib/media'

export interface CaseStudyContent {
  title: string
  clientName: string
  industry: string
  companyWebsite: string
  headerColor: string
  challenge: string
  solution: string
  results: string[]
  testimonial: {
    quote: string
    author: string
  }
}

interface CaseStudyProps extends Omit<ElementComponentProps, 'content'> {
  content: CaseStudyContent
}

export function CaseStudy({ content, blogId, elementId, onContentUpdated, onElementDeleted }: CaseStudyProps) {
  const results = Array.isArray(content?.results) ? content.results : []
  const headerColor = content?.headerColor && /^#[0-9a-fA-F]{6}$/.test(content.headerColor) ? content.headerColor : '#0078D4'

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Header — solid brand color */}
        <div className="relative px-8 py-7 text-white" style={{ backgroundColor: headerColor }}>
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h2
                className="text-[22px] font-semibold leading-tight tracking-tight"
                dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.title) }}
              />
              <div className="mt-3 flex items-center gap-2 text-[14px] font-medium text-white/80">
                <Building2 className="h-3.5 w-3.5" />
                <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.clientName) }} />
                <span className="text-white/50">·</span>
                <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.industry) }} />
              </div>
            </div>
            <img
              src={`https://www.google.com/s2/favicons?domain=${extractDomain(content?.companyWebsite)}&sz=128`}
              alt={`${content?.clientName || 'Company'} Logo`}
              className="h-14 w-14 shrink-0 rounded-lg bg-white object-contain p-1.5 shadow-sm"
            />
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Challenge & Solution — side by side on desktop */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">The Challenge</h3>
              <div
                className="text-[15px] leading-[1.7] text-foreground [&_strong]:font-semibold [&_em]:font-[450]"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content?.challenge) }}
              />
            </div>
            <div>
              <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">The Solution</h3>
              <div
                className="text-[15px] leading-[1.7] text-foreground [&_strong]:font-semibold [&_em]:font-[450]"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content?.solution) }}
              />
            </div>
          </div>

          {/* Results — horizontal badges */}
          <div>
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Key Results</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-[14px] leading-snug text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(result) }} />
                </div>
              ))}
            </div>
          </div>

          {content?.testimonial?.quote && (
            <div className="relative rounded-lg border border-border bg-secondary/30 px-6 py-5">
              <Quote className="absolute top-4 left-4 h-5 w-5 text-muted-foreground/30" />
              <blockquote
                className="pl-6 text-[16px] font-light italic leading-[1.7] text-foreground"
                dangerouslySetInnerHTML={{ __html: renderMarkdownInline(`"${content.testimonial.quote}"`) }}
              />
              <p className="mt-3 pl-6 text-[13px] font-semibold text-muted-foreground">
                — <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.testimonial.author) }} />
              </p>
            </div>
          )}
        </div>

        {content?.companyWebsite && (
          <div className="flex items-center justify-between border-t border-border px-8 py-4">
            <a
              href={content.companyWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] font-medium text-primary transition-colors hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visit {content.clientName}
            </a>
            <span className="flex items-center gap-1 text-[13px] font-medium text-primary cursor-pointer hover:underline">
              Read Full Case Study
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </div>
    </BaseElement>
  )
}
