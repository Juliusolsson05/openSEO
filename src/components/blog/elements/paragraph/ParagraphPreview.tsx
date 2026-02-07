'use client'

import { useMemo } from 'react'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'

export function ParagraphPreview({ content }: PreviewComponentProps) {
  const formattedTitle = useMemo(() => renderMarkdownInline(content?.title ?? ''), [content?.title])

  const formattedText = useMemo(() => {
    let text = content?.text ?? ''
    text = text.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
    text = text.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')
    return renderMarkdown(text)
  }, [content?.text])

  return (
    <BasePreview content={content}>
      <h3
        className="mb-3 text-2xl font-semibold custom-content"
        dangerouslySetInnerHTML={{ __html: formattedTitle }}
      />
      <p
        className="my-[15px] text-[1.125rem] font-light leading-[1.77778] text-foreground custom-content"
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    </BasePreview>
  )
}
