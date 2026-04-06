'use client'

import { useCallback, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { useElementsApi } from '@/hooks/use-elements-api'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createHyperlinkedText, type HyperlinkData } from '../hyperlink-utils'

import type { FAQItem, FAQContent } from '@/types/content-elements'
import { normalizeFaqContent } from './shared'

export function FAQ({ content, blogId, elementId, onContentUpdated, onElementAdded, onElementDeleted, hyperlink }: ElementComponentProps) {
  const { updateElement } = useElementsApi()
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = normalizeFaqContent(content)
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<FAQContent>(initial)

  useEffect(() => { rebase(normalizeFaqContent(content)) }, [content])

  const saveFn = useCallback(async (data: FAQContent) => {
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

  const updateItem = (index: number, key: keyof FAQItem, value: string) => {
    const next = [...items]
    next[index] = { ...next[index], [key]: value }
    patch({ items: next })
  }

  const addItem = () => patch({ items: [...items, { question: '', answer: '' }] })
  const removeItem = (index: number) => patch({ items: items.filter((_, i) => i !== index) })

  const viewContent = normalizeFaqContent(content)

  return (
    <BaseElement content={content} blogId={blogId} elementId={elementId} allowEdit={false} allowDelete={false} allowAddElement={false} onContentUpdated={onContentUpdated} onElementAdded={onElementAdded} onElementDeleted={onElementDeleted}>
      {editing ? (
        <InlineEditorShell title="FAQ" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
          <div data-inline-edit-root="true" className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={draft.title ?? 'FAQ'} onChange={(e) => patch({ title: e.target.value })} placeholder="FAQ title" className="text-[18px] font-semibold" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>FAQ items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-4 w-4" /> Add item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="space-y-1.5">
                      <Label>Question</Label>
                      <Input value={item.question ?? ''} onChange={(e) => updateItem(index, 'question', e.target.value)} placeholder="Question" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Answer</Label>
                      <Textarea value={item.answer ?? ''} onChange={(e) => updateItem(index, 'answer', e.target.value)} placeholder="Answer" rows={4} className="min-h-[120px] text-[15px] font-light leading-relaxed" />
                    </div>
                    <div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Remove item
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </InlineEditorShell>
      ) : (
        <div
          className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
          onClick={() => isEditModeEnabled && startEditing(elementId)}
        >
          <h2 className="mb-4 text-[22px] font-semibold leading-tight tracking-tight text-foreground">{viewContent.title || 'FAQ'}</h2>
          <div className="space-y-3">
            {viewContent.items.map((item, index) => {
              const faqKeywords = hyperlink?.matched_keywords as unknown as Array<{ question?: any[]; answer?: any[] }>
              const qKeywords = faqKeywords?.[index]?.question
              const aKeywords = faqKeywords?.[index]?.answer
              const linkedQuestion = Array.isArray(qKeywords) && qKeywords.length ? createHyperlinkedText(item.question, qKeywords) : item.question
              const linkedAnswer = Array.isArray(aKeywords) && aKeywords.length ? createHyperlinkedText(item.answer, aKeywords) : item.answer

              return (
                <div key={index} className="rounded-lg border border-border bg-card p-5">
                  <div className="text-[17px] font-semibold leading-snug text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(linkedQuestion) }} />
                  <div className="mt-2 text-[16px] font-light leading-[1.7] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdown(linkedAnswer) }} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </BaseElement>
  )
}
