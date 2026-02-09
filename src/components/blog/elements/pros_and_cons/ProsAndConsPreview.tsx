'use client'

import { BasePreview } from '../BasePreview'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { PreviewComponentProps } from '../registry'

import type { ProsAndConsContent } from '@/types/content-elements'

interface ProsAndConsPreviewProps extends Omit<PreviewComponentProps, 'content'> {
  content: ProsAndConsContent
}

export function ProsAndConsPreview({ content }: ProsAndConsPreviewProps) {
  const pros = Array.isArray(content?.pros) ? content.pros : []
  const cons = Array.isArray(content?.cons) ? content.cons : []

  return (
    <BasePreview content={content}>
      {content.title ? (
        <h3
          className="mb-6 text-2xl font-semibold text-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.title) }}
        />
      ) : null}

      {content.text_before ? (
        <p
          className="my-6 text-[1.05rem] leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_before) }}
        />
      ) : null}

      <div className="my-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h4 className="mb-3 border-b-2 border-emerald-600 pb-2 text-xl font-semibold text-emerald-600">Pros</h4>
          <ul className="space-y-3">
            {pros.map((pro, index) => (
              <li key={`pro-${index}`} className="flex items-start">
                <span className="mr-2 inline-block w-5 font-bold text-emerald-600">✓</span>
                <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(pro) }} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 border-b-2 border-rose-600 pb-2 text-xl font-semibold text-rose-600">Cons</h4>
          <ul className="space-y-3">
            {cons.map((con, index) => (
              <li key={`con-${index}`} className="flex items-start">
                <span className="mr-2 inline-block w-5 font-bold text-rose-600">✕</span>
                <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(con) }} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {content.text_after ? (
        <p
          className="my-6 text-[1.05rem] leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_after) }}
        />
      ) : null}
    </BasePreview>
  )
}
