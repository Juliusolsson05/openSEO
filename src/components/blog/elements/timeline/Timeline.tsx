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
import { Button } from '@/components/ui/button'

import type { TimelineEvent, TimelineContent } from '@/types/content-elements'

export function Timeline({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const { updateElement } = useElementsApi()
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = (content ?? { title: '', text_before: '', events: [], text_after: '' }) as TimelineContent
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<TimelineContent>(initial)

  useEffect(() => { rebase((content ?? { title: '', text_before: '', events: [], text_after: '' }) as TimelineContent) }, [content])

  const saveFn = useCallback(async (data: TimelineContent) => {
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

  const events = Array.isArray(draft.events) ? draft.events : []

  const updateEvent = (index: number, key: keyof TimelineEvent, value: string) => {
    const next = [...events]
    next[index] = { ...next[index], [key]: value }
    patch({ events: next })
  }

  const addEvent = () => patch({ events: [...events, { date: '', title: '', description: '' }] })
  const removeEvent = (index: number) => patch({ events: events.filter((_, i) => i !== index) })

  const viewContent = (content ?? {}) as TimelineContent
  const viewEvents = Array.isArray(viewContent.events) ? viewContent.events : []

  return (
    <BaseElement content={content} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      {editing ? (
        <InlineEditorShell title="Timeline" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
          <div data-inline-edit-root="true" className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={draft.title ?? ''} onChange={(e) => patch({ title: e.target.value })} placeholder="Timeline title" className="text-[18px] font-semibold" />
            </div>

            <div className="space-y-1.5">
              <Label>Text before timeline</Label>
              <Textarea value={draft.text_before ?? ''} onChange={(e) => patch({ text_before: e.target.value })} placeholder="Text before timeline" rows={4} className="min-h-[120px] text-[15px] font-light leading-relaxed" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Events</Label>
                <Button type="button" variant="outline" size="sm" onClick={addEvent}>
                  <Plus className="mr-1 h-4 w-4" /> Add event
                </Button>
              </div>

              <div className="space-y-3">
                {events.map((event, index) => (
                  <div key={index} className="rounded-lg border p-4 space-y-3">
                    <div className="space-y-1.5">
                      <Label>Date</Label>
                      <Input value={event.date ?? ''} onChange={(e) => updateEvent(index, 'date', e.target.value)} placeholder="Date" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Title</Label>
                      <Input value={event.title ?? ''} onChange={(e) => updateEvent(index, 'title', e.target.value)} placeholder="Event title" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea value={event.description ?? ''} onChange={(e) => updateEvent(index, 'description', e.target.value)} placeholder="Description" rows={4} className="min-h-[120px] text-[15px] font-light leading-relaxed" />
                    </div>
                    <div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeEvent(index)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Remove event
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Text after timeline</Label>
              <Textarea value={draft.text_after ?? ''} onChange={(e) => patch({ text_after: e.target.value })} placeholder="Text after timeline" rows={4} className="min-h-[120px] text-[15px] font-light leading-relaxed" />
            </div>
          </div>
        </InlineEditorShell>
      ) : (
        <div
          className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
          onClick={() => isEditModeEnabled && startEditing(elementId)}
        >
          {viewContent.title ? <h3 className="mb-4 text-[22px] font-semibold leading-tight tracking-tight text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(viewContent.title) }} /> : null}
          {viewContent.text_before ? <p className="mt-3 mb-6 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdown(viewContent.text_before) }} /> : null}
          <div className="relative ml-4 border-l-2 border-primary/30 pl-8 space-y-8">
            {viewEvents.map((event, index) => (
              <div key={index} className="relative">
                {/* Dot on the timeline */}
                <div className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-card">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="mb-1.5 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-[12px] font-semibold text-primary" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(event.date ?? '') }} />
                <h4 className="text-[17px] font-semibold leading-snug text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(event.title ?? '') }} />
                <div className="mt-1.5 text-[16px] font-light leading-[1.7] text-muted-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdown(event.description ?? '') }} />
              </div>
            ))}
          </div>
          {viewContent.text_after ? <p className="mt-6 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdown(viewContent.text_after) }} /> : null}
        </div>
      )}
    </BaseElement>
  )
}
