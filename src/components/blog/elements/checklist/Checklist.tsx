'use client'

import { useEffect, useMemo, useState } from 'react'
import { BaseElement } from '../BaseElement'
import { renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineList, InlineText, SaveIndicator, useInlineEdit } from '../inline'

type ChecklistItem = { text?: string; action?: string; checked?: boolean }
type ChecklistContent = { title?: string; items?: ChecklistItem[] }

export function Checklist({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<ChecklistContent>((content ?? {}) as ChecklistContent)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => setLocalContent((content ?? {}) as ChecklistContent), [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const listItems = useMemo(() => (Array.isArray(localContent.items) ? localContent.items.map((i) => i.text ?? i.action ?? '') : []), [localContent.items])

  const handleTitleChange = (title: string) => {
    const next = { ...localContent, title }
    setLocalContent(next)
    void save(next)
  }

  const handleItemsChange = (items: string[]) => {
    const next = {
      ...localContent,
      items: items.map((text, idx) => ({ text, action: text, checked: localContent.items?.[idx]?.checked ?? false })),
    }
    setLocalContent(next)
    void save(next)
  }

  const toggleCheck = (index: number) => {
    const next = {
      ...localContent,
      items: (localContent.items ?? []).map((item, idx) => (idx === index ? { ...item, checked: !item.checked } : item)),
    }
    setLocalContent(next)
    void save(next)
  }

  return (
    <BaseElement content={localContent} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      <div className="mx-auto max-w-[800px] rounded-lg border bg-card p-6 shadow-sm space-y-3">
        {editing ? (
          <>
            <InlineText elementId={elementId} value={localContent.title ?? ''} onChange={handleTitleChange} onBlur={() => void flush()} as="h2" className="text-3xl font-bold" placeholder="Checklist title" />
            <InlineList items={listItems} onChange={handleItemsChange} placeholder="Checklist item" />
          </>
        ) : (
          <div className="cursor-text" onClick={() => startEditing(elementId)}>
            <h2 className="mb-4 text-3xl font-bold text-primary" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(localContent.title ?? '') }} />
            <ul className="space-y-1">
              {(localContent.items ?? []).map((item, index) => {
                const text = item.text ?? item.action ?? ''
                const checked = !!item.checked
                return (
                  <li key={index} className="flex items-center gap-2" onClick={() => toggleCheck(index)}>
                    <input type="checkbox" checked={checked} onChange={() => toggleCheck(index)} />
                    <span className={checked ? 'line-through text-muted-foreground' : ''} dangerouslySetInnerHTML={{ __html: renderMarkdownInline(text) }} />
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
