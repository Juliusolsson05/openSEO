'use client'

import { useCallback, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { useElementsApi } from '@/hooks/use-elements-api'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { applyHyperlinks, createHyperlinkedText } from '../hyperlink-utils'

type NumberedListParagraphContent = {
  title?: string
  text_before_list?: string
  list_items?: string[]
  text_after_list?: string
}

export function NumberedListParagraph({ content, blogId, elementId, onContentUpdated, onElementDeleted, hyperlink }: ElementComponentProps) {
  const { updateElement } = useElementsApi()
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

  const hyperlinkedListItem = (item: string, index: number) => {
    const kws = (hyperlink?.matched_keywords as any)?.list_items?.[index]
    return Array.isArray(kws) && kws.length ? createHyperlinkedText(item, kws) : item
  }

  return (
    <BaseElement content={content} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      <div className="space-y-3">
        {editing ? (
          <InlineEditorShell title="Numbered List Paragraph" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
            <div data-inline-edit-root="true" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`${elementId}-title`}>Title</Label>
                <Input id={`${elementId}-title`} value={draft.title ?? ''} onChange={(e) => patch({ title: e.target.value })} placeholder="Title" className="text-[18px] font-semibold" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${elementId}-text-before`}>Text before list</Label>
                <Textarea
                  id={`${elementId}-text-before`}
                  value={draft.text_before_list ?? ''}
                  onChange={(e) => patch({ text_before_list: e.target.value })}
                  placeholder="Text before list"
                  className="min-h-[120px] text-[15px] font-light leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label>List items</Label>
                <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <Label htmlFor={`${elementId}-text-after`}>Text after list</Label>
                <Textarea
                  id={`${elementId}-text-after`}
                  value={draft.text_after_list ?? ''}
                  onChange={(e) => patch({ text_after_list: e.target.value })}
                  placeholder="Text after list"
                  className="min-h-[120px] text-[15px] font-light leading-relaxed"
                />
              </div>
            </div>
          </InlineEditorShell>
        ) : (
          <div
            className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
            onClick={() => isEditModeEnabled && startEditing(elementId)}
          >
            <h3 className="mb-4 text-[22px] font-semibold leading-tight tracking-tight text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(view.title ?? '', hyperlink, 'title')) }} />
            <div className="mt-3 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdown(applyHyperlinks(view.text_before_list ?? '', hyperlink, 'text_before_list')) }} />
            <ol className="my-4 list-decimal pl-6 space-y-2">
              {viewItems.map((item, index) => (
                <li key={index} className="text-[16px] font-light leading-[1.7] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(hyperlinkedListItem(item, index)) }} />
              ))}
            </ol>
            <div className="mt-3 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdown(applyHyperlinks(view.text_after_list ?? '', hyperlink, 'text_after_list')) }} />
          </div>
        )}
      </div>
    </BaseElement>
  )
}
