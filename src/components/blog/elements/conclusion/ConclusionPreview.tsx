'use client'

import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

type ConclusionContent = {
  title?: string
  text?: string
}

const formatConclusionText = (value: string) => {
  let text = value
  text = text.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
  text = text.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')
  return renderMarkdown(text)
}

export function ConclusionPreview({ content }: PreviewComponentProps) {
  const parsedContent = (content ?? {}) as ConclusionContent
  const titleHtml = renderMarkdownInline(parsedContent.title ?? 'Conclusion')
  const bodyHtml = formatConclusionText(parsedContent.text ?? '')

  return (
    <BasePreview content={content}>
      <h2
        className="mb-3 text-2xl font-semibold"
        dangerouslySetInnerHTML={{ __html: titleHtml }}
      />
      <div
        className="custom-content my-[15px] text-lg font-light leading-[1.77778] text-foreground"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </BasePreview>
  )
}
