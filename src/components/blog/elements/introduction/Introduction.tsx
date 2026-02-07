'use client'

import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown } from '@/lib/markdown'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineRichText, InlineText, SaveIndicator, useInlineEdit } from '../inline'

type IntroductionContent = {
  title?: string
  text?: string
}

const formatText = (text: string) => {
  let value = text ?? ''
  value = value.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
  value = value.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')
  return renderMarkdown(value)
}

export function Introduction({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<IntroductionContent>((content ?? {}) as IntroductionContent)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => {
    setLocalContent((content ?? {}) as IntroductionContent)
  }, [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleContentChange = (key: keyof IntroductionContent, value: string) => {
    const next = { ...localContent, [key]: value }
    setLocalContent(next)
    void save(next)
  }

  return (
    <BaseElement
      content={localContent}
      blogId={blogId}
      elementId={elementId}
      allowEdit={false}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      <div>
        <h2 className="mt-4 mb-3 text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2 cursor-text" onClick={() => startEditing(elementId)}>
          <BookOpen className="h-5 w-5 text-sky-600" />
          {editing ? (
            <InlineText
              elementId={elementId}
              value={localContent.title ?? 'Introduction'}
              onChange={(value) => handleContentChange('title', value)}
              onBlur={() => void flush()}
              as="span"
              className="text-2xl font-semibold"
              placeholder="Introduction"
            />
          ) : (
            <span>{localContent.title ?? 'Introduction'}</span>
          )}
        </h2>

        {editing ? (
          <InlineRichText
            elementId={elementId}
            value={localContent.text ?? ''}
            onChange={(value) => handleContentChange('text', value)}
            onBlur={() => void flush()}
            className="my-[15px] text-lg font-light leading-[1.77778] text-foreground [&_em]:font-[450] [&_strong]:font-bold"
            placeholder="Write introduction..."
          />
        ) : (
          <p
            className="my-[15px] text-lg font-light leading-[1.77778] text-foreground [&_em]:font-[450] [&_strong]:font-bold cursor-text"
            onClick={() => startEditing(elementId)}
            dangerouslySetInnerHTML={{ __html: formatText(localContent.text ?? '') }}
          />
        )}

        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
