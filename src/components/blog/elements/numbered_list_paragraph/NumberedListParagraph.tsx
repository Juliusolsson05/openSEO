'use client'

import { useCallback, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { useElementsStore } from '@/stores/elements-store'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type NumberedListParagraphContent = {
  title?: string
  text_before_list?: string
  list_items?: string[]
  text_after_list?: string
}

export function NumberedListParagraph({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = (content ?? { title: '', text_before_list: '', list_items: [], text_after_list: '' }) as NumberedListParagraphContent
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<NumberedListParagraphContent>(initial)

  useEffect(() => { rebase((content ?? { title: '', text_before_list: '', list_items: [], text_after_list: '' }) as NumberedListParagraphContent) }, [content])

  const saveFn = useCallback(async (data: NumberedListParagraphContent) => {
    const result = await updateElement(elementId, data, blogId)
    if (result.success) onContentUpdated?.(data)
    return result
  }, [updateElement, elementId, blogId, onContentUpdated])

  const { save, status, error } = useElementSave(saveFn)

  const handleSave = async () => {
    if (!isDirty) return
    const ok = await save(draft)
    if (ok) {
      commit()
      stopEditing()
    }
  }

  const handleCancel = () => {
    reset()
    stopEditing()
  }

  const items = Array.isArray(draft.list_items) ? draft.list_items : []

  const updateItem = (index: number, value: string) => {
    const next = [...items]
    next[index] = value
    patch({ list_items: next })
  }

  const addItem = () => patch({ list_items: [...items, ''] })
  const removeItem = (index: number) => patch({ list_items: items.filter((_, i) => i !== index) })

  const view = (content ?? {}) as NumberedListParagraphContent
  const viewItems = Array.isArray(view.list_items) ? view.list_items : []

  return (
    <BaseElement content={content} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      <div className="space-y-3">
        {editing ? (
          <InlineEditorShell title="Numbered List Paragraph" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
            <div data-inline-edit-root="true" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${elementId}-title`}>Title</Label>
                <Input id={`${elementId}-title`} value={draft.title ?? ''} onChange={(e) => patch({ title: e.target.value })} placeholder="Title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${elementId}-text-before`}>Text before list</Label>
                <Textarea
                  id={`${elementId}-text-before`}
                  value={draft.text_before_list ?? ''}
                  onChange={(e) => patch({ text_before_list: e.target.value })}
                  placeholder="Text before list"
                />
              </div>

              <div className="space-y-2">
                <Label>List items</Label>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-6 shrink-0 text-sm text-muted-foreground">{index + 1}.</span>
                      <Input value={item} onChange={(e) => updateItem(index, e.target.value)} placeholder={`List item ${index + 1}`} />
                      <button type="button" onClick={() => removeItem(index)} className="rounded p-2 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addItem} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Plus className="h-4 w-4" /> Add item
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${elementId}-text-after`}>Text after list</Label>
                <Textarea
                  id={`${elementId}-text-after`}
                  value={draft.text_after_list ?? ''}
                  onChange={(e) => patch({ text_after_list: e.target.value })}
                  placeholder="Text after list"
                />
              </div>
            </div>
          </InlineEditorShell>
        ) : (
          <div
            className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
            onClick={() => isEditModeEnabled && startEditing(elementId)}
          >
            <h3 className="mb-[10px] text-[1.5rem] font-medium" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(view.title ?? '') }} />
            <div className="my-[15px] text-lg font-light" dangerouslySetInnerHTML={{ __html: renderMarkdown(view.text_before_list ?? '') }} />
            <ol className="my-[15px] list-decimal pl-5 text-lg font-light">
              {viewItems.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item) }} />
              ))}
            </ol>
            <div className="my-[15px] text-lg font-light" dangerouslySetInnerHTML={{ __html: renderMarkdown(view.text_after_list ?? '') }} />
          </div>
        )}
      </div>
    </BaseElement>
  )
}
