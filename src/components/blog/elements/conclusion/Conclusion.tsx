'use client'

import { useEffect, useState } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown } from '@/lib/markdown'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineRichText, InlineText, SaveIndicator, useInlineEdit } from '../inline'

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

export function Conclusion({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<ConclusionContent>((content ?? {}) as ConclusionContent)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => {
    setLocalContent((content ?? {}) as ConclusionContent)
  }, [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleContentChange = (key: keyof ConclusionContent, value: string) => {
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
      allowDelete={false}
      allowAddElement={false}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      <div className="space-y-2">
        {editing ? (
          <>
            <InlineText
              elementId={elementId}
              value={localContent.title ?? 'Conclusion'}
              onChange={(value) => handleContentChange('title', value)}
              onBlur={() => void flush()}
              as="h2"
              className="mb-3 text-2xl font-semibold"
              placeholder="Conclusion"
            />
            <InlineRichText
              elementId={elementId}
              value={localContent.text ?? ''}
              onChange={(value) => handleContentChange('text', value)}
              onBlur={() => void flush()}
              className="custom-content my-[15px] text-lg font-light leading-[1.77778] text-foreground"
              placeholder="Write conclusion..."
            />
          </>
        ) : (
          <>
            <h2 className="mb-3 text-2xl font-semibold cursor-text" onClick={() => startEditing(elementId)}>
              {localContent.title ?? 'Conclusion'}
            </h2>
            <div
              className="custom-content my-[15px] text-lg font-light leading-[1.77778] text-foreground cursor-text"
              onClick={() => startEditing(elementId)}
              dangerouslySetInnerHTML={{ __html: formatConclusionText(localContent.text ?? '') }}
            />
          </>
        )}

        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
