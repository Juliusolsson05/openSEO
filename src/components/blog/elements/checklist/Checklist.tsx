'use client'

import { useCallback, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'
import { useElementsApi } from '@/hooks/use-elements-api'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

import type { ChecklistItem, ChecklistContent } from '@/types/content-elements'

export function Checklist({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const { updateElement } = useElementsApi()
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

  const updateItemAction = (index: number, value: string) => {
    const next = [...items]
    next[index] = { ...(next[index] ?? { action: '' }), action: value }
    patch({ items: next })
  }
  const updateItemDetails = (index: number, value: string) => {
    const next = [...items]
    next[index] = { ...(next[index] ?? { action: '' }), details: value }
    patch({ items: next })
  }

  const updateItemChecked = (index: number, checked: boolean) => {
    const next = [...items]
    const prev = next[index] ?? {}
    next[index] = { ...prev, checked }
    patch({ items: next })
  }

  const addItem = () => patch({ items: [...items, { action: '', details: '', checked: false }] })
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
                <Label htmlFor={`${elementId}-introduction`}>Introduction</Label>
                <Textarea
                  id={`${elementId}-introduction`}
                  value={draft.introduction ?? ''}
                  onChange={(e) => patch({ introduction: e.target.value })}
                  placeholder="Optional introduction shown above the list"
                  rows={2}
                />
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
                      <div className="flex-1 space-y-2">
                        <Input
                          value={item.action ?? ''}
                          onChange={(e) => updateItemAction(index, e.target.value)}
                          placeholder={`Item ${index + 1}`}
                        />
                        <Input
                          value={item.details ?? ''}
                          onChange={(e) => updateItemDetails(index, e.target.value)}
                          placeholder="Optional details"
                        />
                      </div>
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
                <Label htmlFor={`${elementId}-conclusion`}>Conclusion</Label>
                <Textarea
                  id={`${elementId}-conclusion`}
                  value={draft.conclusion ?? ''}
                  onChange={(e) => patch({ conclusion: e.target.value })}
                  placeholder="Optional conclusion shown below the list"
                  rows={2}
                />
              </div>
            </div>
          </InlineEditorShell>
        ) : (
          <div
            className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
            onClick={() => isEditModeEnabled && startEditing(elementId)}
          >
            <h2
              className="mb-4 text-3xl font-bold text-primary"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(view.title ?? '') }}
            />

            {view.introduction ? (
              <p
                className="mb-6 text-base text-foreground"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(view.introduction) }}
              />
            ) : null}

            <ul className="space-y-1">
              {viewItems.map((item, index) => {
                const action = item.action ?? ''
                const checked = !!item.checked
                return (
                  <li
                    key={index}
                    className={`flex items-start gap-3 rounded-md px-3 py-2 transition-colors ${checked ? 'bg-emerald-50' : ''}`}
                    onClick={() => void toggleViewCheck(index)}
                  >
                    <span
                      className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-sm border text-[10px] leading-none ${
                        checked ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-muted-foreground/40'
                      }`}
                    >
                      {checked ? '✓' : ''}
                    </span>
                    <div>
                      <div
                        className={`font-medium ${checked ? 'text-emerald-700 line-through' : 'text-foreground'}`}
                        dangerouslySetInnerHTML={{ __html: renderMarkdownInline(action) }}
                      />
                      {item.details ? (
                        <p
                          className="mt-1 text-sm text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item.details) }}
                        />
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>

            {view.conclusion ? (
              <p
                className="mt-4 text-sm text-emerald-700"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(view.conclusion) }}
              />
            ) : null}
          </div>
        )}
      </div>
    </BaseElement>
  )
}
