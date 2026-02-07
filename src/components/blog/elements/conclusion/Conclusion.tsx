'use client'

import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

type ConclusionContent = {
  text?: string
}

const formatConclusionText = (value: string) => {
  let text = value
  text = text.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
  text = text.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')
  return renderMarkdown(text)
}

export function Conclusion({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const parsedContent = (content ?? {}) as ConclusionContent
  const titleHtml = renderMarkdownInline('Conclusion')
  const bodyHtml = formatConclusionText(parsedContent.text ?? '')

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      allowDelete={false}
      allowAddElement={false}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      <h2
        className="mb-3 text-2xl font-semibold"
        dangerouslySetInnerHTML={{ __html: titleHtml }}
      />
      <div
        className="custom-content my-[15px] text-lg font-light leading-[1.77778] text-foreground"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </BaseElement>
  )
}
