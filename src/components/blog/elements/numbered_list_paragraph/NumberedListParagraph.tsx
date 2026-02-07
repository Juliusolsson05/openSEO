'use client'

import { useEffect, useState } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineList, InlineRichText, InlineText, SaveIndicator, useInlineEdit } from '../inline'

type NumberedListParagraphContent = {
  title?: string
  text_before_list?: string
  list_items?: string[]
  text_after_list?: string
}

export function NumberedListParagraph({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<NumberedListParagraphContent>((content ?? {}) as NumberedListParagraphContent)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => setLocalContent((content ?? {}) as NumberedListParagraphContent), [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleChange = (key: keyof NumberedListParagraphContent, value: string | string[]) => {
    const next = { ...localContent, [key]: value }
    setLocalContent(next)
    void save(next)
  }

  const items = Array.isArray(localContent.list_items) ? localContent.list_items : []

  return (
    <BaseElement content={localContent} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      <div className="space-y-3">
        {editing ? (
          <>
            <InlineText elementId={elementId} value={localContent.title ?? ''} onChange={(v) => handleChange('title', v)} onBlur={() => void flush()} as="h3" className="mb-[10px] text-[1.5rem] font-medium" placeholder="Title" />
            <InlineRichText elementId={elementId} value={localContent.text_before_list ?? ''} onChange={(v) => handleChange('text_before_list', v)} onBlur={() => void flush()} className="my-[15px] text-lg font-light" placeholder="Text before list" />
            <InlineList items={items} onChange={(v) => handleChange('list_items', v)} ordered placeholder="List item" className="my-[15px]" />
            <InlineRichText elementId={elementId} value={localContent.text_after_list ?? ''} onChange={(v) => handleChange('text_after_list', v)} onBlur={() => void flush()} className="my-[15px] text-lg font-light" placeholder="Text after list" />
          </>
        ) : (
          <div className="cursor-text" onClick={() => startEditing(elementId)}>
            <h3 className="mb-[10px] text-[1.5rem] font-medium" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(localContent.title ?? '') }} />
            <div className="my-[15px] text-lg font-light" dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent.text_before_list ?? '') }} />
            <ol className="my-[15px] list-decimal pl-5 text-lg font-light">
              {items.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item) }} />
              ))}
            </ol>
            <div className="my-[15px] text-lg font-light" dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent.text_after_list ?? '') }} />
          </div>
        )}
        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
