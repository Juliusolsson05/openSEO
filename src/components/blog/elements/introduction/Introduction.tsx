'use client'

import { BookOpen } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

const formatText = (text: string) => {
  let value = text ?? ''
  value = value.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
  value = value.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')
  return renderMarkdown(value)
}

export function Introduction({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const titleHtml = renderMarkdownInline('Introduction')
  const formattedText = formatText(content?.text ?? '')

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      <div>
        <h2 className="mt-4 mb-3 text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sky-600" />
          <span dangerouslySetInnerHTML={{ __html: titleHtml }} />
        </h2>
        <p
          className="my-[15px] text-lg font-light leading-[1.77778] text-foreground [&_em]:font-[450] [&_strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      </div>
    </BaseElement>
  )
}
