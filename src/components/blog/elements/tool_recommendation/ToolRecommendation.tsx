'use client'

import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'

interface ToolRecommendationContent {
  title: string
  companyUrl: string
  pricing: string
  productDescription: string
  headerColor: string
  features: string[]
}

interface ToolRecommendationProps extends Omit<ElementComponentProps, 'content'> {
  content: ToolRecommendationContent
}

const extractDomain = (url: string): string => {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

const adjustColorOpacity = (color: string, opacity: number): string => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return `rgba(0, 0, 0, ${opacity})`

  const r = Number.parseInt(color.slice(1, 3), 16)
  const g = Number.parseInt(color.slice(3, 5), 16)
  const b = Number.parseInt(color.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function ToolRecommendation({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ToolRecommendationProps) {
  const features = Array.isArray(content?.features) ? content.features : []

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      <div
        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        style={{ borderColor: content?.headerColor || '#e5e7eb' }}
      >
        <div
          className="flex items-center justify-between gap-4 p-6"
          style={{ backgroundColor: adjustColorOpacity(content?.headerColor || '#000000', 0.3) }}
        >
          <div className="flex-1">
            <h2
              className="m-0 text-[22px] font-semibold leading-tight tracking-tight text-foreground"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.title || '') }}
            />
            <p
              className="mt-1 text-[15px] font-medium text-primary"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.pricing || '') }}
            />
          </div>
          <img
            src={`https://img.logo.dev/${extractDomain(content?.companyUrl || '')}?token=pk_PJnue9akRVmT-qo6GmYjhA`}
            alt={`${content?.title || 'Tool'} Logo`}
            className="h-[60px] w-auto rounded-lg bg-card p-1"
          />
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="mt-0.5 text-2xl">ℹ️</span>
            <div
              className="flex-1 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content?.productDescription || '') }}
            />
          </div>

          <div>
            <h3 className="mb-2 text-[17px] font-semibold leading-snug text-foreground">
              Key Features:
            </h3>
            <ul className="grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-2">
              {features.map((feature, index) => (
                <li
                  key={`feature-${index}`}
                  className="flex items-start rounded-lg bg-secondary/50 px-3 py-2 text-[16px] font-light leading-[1.7] text-foreground"

                >
                  <span className="mr-2 shrink-0 text-emerald-600">
                    ✓
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(feature) }} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-start bg-secondary/50 p-5">
          <a
            href={content?.companyUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary transition-colors hover:text-primary"
          >
            Visit <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.title || '') }} /> Website
          </a>
        </div>
      </div>
    </BaseElement>
  )
}
