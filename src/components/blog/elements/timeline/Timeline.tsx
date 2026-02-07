'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineRichText, InlineText, SaveIndicator, useInlineEdit } from '../inline'

interface TimelineEvent {
  date: string
  title: string
  description: string
}

interface TimelineContent {
  title?: string
  text_before?: string
  events?: TimelineEvent[]
  text_after?: string
}

export function Timeline({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<TimelineContent>((content ?? {}) as TimelineContent)
  const [expanded, setExpanded] = useState<number | null>(0)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => setLocalContent((content ?? {}) as TimelineContent), [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleChange = (next: TimelineContent) => {
    setLocalContent(next)
    void save(next)
  }

  const events = Array.isArray(localContent.events) ? localContent.events : []

  const updateEvent = (index: number, key: keyof TimelineEvent, value: string) => {
    const nextEvents = [...events]
    nextEvents[index] = { ...nextEvents[index], [key]: value }
    handleChange({ ...localContent, events: nextEvents })
  }

  return (
    <BaseElement content={localContent} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      <div className="timeline-wrapper space-y-3">
        {editing ? (
          <>
            <InlineText elementId={elementId} value={localContent.title ?? ''} onChange={(v) => handleChange({ ...localContent, title: v })} onBlur={() => void flush()} as="h3" className="text-2xl font-semibold" placeholder="Timeline title" />
            <InlineRichText elementId={elementId} value={localContent.text_before ?? ''} onChange={(v) => handleChange({ ...localContent, text_before: v })} onBlur={() => void flush()} placeholder="Text before timeline" />
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={index} className="rounded border p-3">
                  <button type="button" className="w-full text-left font-medium" onClick={() => setExpanded((current) => (current === index ? null : index))}>
                    {event.title || `Event ${index + 1}`}
                  </button>
                  {expanded === index ? (
                    <div className="mt-2 space-y-2">
                      <InlineText value={event.date ?? ''} onChange={(v) => updateEvent(index, 'date', v)} placeholder="Date" className="text-sm" />
                      <InlineText value={event.title ?? ''} onChange={(v) => updateEvent(index, 'title', v)} placeholder="Event title" className="text-lg" />
                      <InlineText value={event.description ?? ''} onChange={(v) => updateEvent(index, 'description', v)} multiline placeholder="Description" />
                      <button type="button" className="inline-flex items-center gap-1 text-sm text-destructive" onClick={() => handleChange({ ...localContent, events: events.filter((_, i) => i !== index) })}>
                        <Trash2 className="h-4 w-4" /> Delete event
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
              <button type="button" className="inline-flex items-center gap-1 text-sm text-primary" onClick={() => handleChange({ ...localContent, events: [...events, { date: '', title: '', description: '' }] })}>
                <Plus className="h-4 w-4" /> Add event
              </button>
            </div>
            <InlineRichText elementId={elementId} value={localContent.text_after ?? ''} onChange={(v) => handleChange({ ...localContent, text_after: v })} onBlur={() => void flush()} placeholder="Text after timeline" />
          </>
        ) : (
          <div className="cursor-text" onClick={() => startEditing(elementId)}>
            {localContent.title ? <h3 className="mb-4 text-2xl font-semibold" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(localContent.title) }} /> : null}
            {localContent.text_before ? <p className="my-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent.text_before) }} /> : null}
            <div className="space-y-6">
              {events.map((event, index) => (
                <div key={index} className="rounded border-l-4 border-l-primary p-4">
                  <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(event.date ?? '') }} />
                  <h4 className="text-xl font-semibold text-primary" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(event.title ?? '') }} />
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(event.description ?? '') }} />
                </div>
              ))}
            </div>
            {localContent.text_after ? <p className="my-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent.text_after) }} /> : null}
          </div>
        )}
        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
