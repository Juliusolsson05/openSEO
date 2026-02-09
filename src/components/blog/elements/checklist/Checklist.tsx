'use client'

import { useCallback, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import { renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'
import { useElementsStore } from '@/stores/elements-store'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

import type { ChecklistItem, ChecklistContent } from '@/types/content-elements'

export function Checklist({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = (content ?? { title: '', items: [] }) as ChecklistContent
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<ChecklistContent>(initial)

  useEffect(() => { rebase((content ?? { title: '', items: [] }) as ChecklistContent) }, [content])

  const saveFn = useCallback(async (data: ChecklistContent) => {
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

  const items = Array.isArray(draft.items) ? draft.items : []

  const updateItemText = (index: number, value: string) => {
    const next = [...items]
    const prev = next[index] ?? {}
    next[index] = { ...prev, text: value, action: value }
    patch({ items: next })
  }

  const updateItemChecked = (index: number, checked: boolean) => {
    const next = [...items]
    const prev = next[index] ?? {}
    next[index] = { ...prev, checked }
    patch({ items: next })
  }

  const addItem = () => patch({ items: [...items, { text: '', action: '', checked: false }] })
  const removeItem = (index: number) => patch({ items: items.filter((_, i) => i !== index) })

  const view = (content ?? {}) as ChecklistContent
  const viewItems = Array.isArray(view.items) ? view.items : []

  const toggleViewCheck = async (index: number) => {
    const nextItems = viewItems.map((item, idx) => (idx === index ? { ...item, checked: !item.checked } : item))
    const next = { ...view, items: nextItems }
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
  }

  return (
    <BaseElement content={content} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      <div className="mx-auto max-w-[800px] space-y-3 rounded-lg border bg-card p-6 shadow-sm">
        {editing ? (
          <InlineEditorShell title="Checklist" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
            <div data-inline-edit-root="true" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${elementId}-title`}>Title</Label>
                <Input id={`${elementId}-title`} value={draft.title ?? ''} onChange={(e) => patch({ title: e.target.value })} placeholder="Checklist title" />
              </div>

              <div className="space-y-2">
                <Label>Items</Label>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Checkbox
                        checked={!!item.checked}
                        onCheckedChange={(value) => updateItemChecked(index, value === true)}
                        aria-label={`Toggle item ${index + 1}`}
                      />
                      <Input
                        value={item.text ?? item.action ?? ''}
                        onChange={(e) => updateItemText(index, e.target.value)}
                        placeholder={`Item ${index + 1}`}
                      />
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
            </div>
          </InlineEditorShell>
        ) : (
          <div
            className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
            onClick={() => isEditModeEnabled && startEditing(elementId)}
          >
            <h2 className="mb-4 text-3xl font-bold text-primary" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(view.title ?? '') }} />
            <ul className="space-y-1">
              {viewItems.map((item, index) => {
                const text = item.text ?? item.action ?? ''
                const checked = !!item.checked
                return (
                  <li key={index} className="flex items-center gap-2" onClick={() => void toggleViewCheck(index)}>
                    <input type="checkbox" checked={checked} onChange={() => void toggleViewCheck(index)} />
                    <span className={checked ? 'text-muted-foreground line-through' : ''} dangerouslySetInnerHTML={{ __html: renderMarkdownInline(text) }} />
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </BaseElement>
  )
}
