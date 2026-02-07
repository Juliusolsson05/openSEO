'use client'

import { useEffect, useState } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineRichText, InlineText, SaveIndicator, useInlineEdit } from '../inline'

type SnippetContent = { title?: string; text?: string }

export function SnippetBlock({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<SnippetContent>((content ?? {}) as SnippetContent)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => setLocalContent((content ?? {}) as SnippetContent), [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleChange = (key: keyof SnippetContent, value: string) => {
    const next = { ...localContent, [key]: value }
    setLocalContent(next)
    void save(next)
  }

  return (
    <BaseElement content={localContent} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      <div className="my-[30px] border-[10px] border-primary bg-[rgba(211,211,211,0.44)] p-[45px] space-y-3">
        {editing ? (
          <>
            <InlineText elementId={elementId} value={localContent.title ?? ''} onChange={(v) => handleChange('title', v)} onBlur={() => void flush()} as="h2" className="text-[28px] font-medium leading-[40px]" placeholder="Snippet title" />
            <InlineRichText elementId={elementId} value={localContent.text ?? ''} onChange={(v) => handleChange('text', v)} onBlur={() => void flush()} className="text-[18px] leading-[32px]" placeholder="Snippet text" />
          </>
        ) : (
          <div className="cursor-text" onClick={() => startEditing(elementId)}>
            <h2 className="mb-5 text-[28px] font-medium leading-[40px]" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(localContent.title ?? '') }} />
            <p className="text-[18px] leading-[32px]" dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent.text ?? '') }} />
          </div>
        )}
        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
