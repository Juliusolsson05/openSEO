'use client'

import { useEffect, useMemo, useState } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdownInline } from '@/lib/markdown'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineText, SaveIndicator, useInlineEdit } from '../inline'

type StatisticContent = {
  title?: string
  count?: string | number
  value?: string | number
  percentage?: string | number
  label?: string
  description?: string
  source?: string
}

export function Statistic({ content, blogId, elementId, onContentUpdated, onElementDeleted, onElementAdded }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<StatisticContent>((content ?? {}) as StatisticContent)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => setLocalContent((content ?? {}) as StatisticContent), [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleChange = (key: keyof StatisticContent, value: string) => {
    const next = { ...localContent, [key]: value }
    setLocalContent(next)
    void save(next)
  }

  const percentage = Number(localContent.percentage ?? localContent.value ?? localContent.count ?? 0)
  const circumference = useMemo(() => 2 * Math.PI * 45, [])
  const dashOffset = useMemo(() => circumference * (1 - Math.max(0, Math.min(100, percentage)) / 100), [circumference, percentage])

  return (
    <BaseElement content={localContent} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted} onElementAdded={onElementAdded}>
      <div className="rounded-lg bg-secondary p-[30px] space-y-2">
        {editing ? (
          <>
            <InlineText elementId={elementId} value={localContent.title ?? ''} onChange={(v) => handleChange('title', v)} onBlur={() => void flush()} as="h3" className="text-center text-2xl font-semibold" placeholder="Statistic title" />
            <InlineText elementId={elementId} value={String(localContent.value ?? localContent.count ?? localContent.percentage ?? '')} onChange={(v) => handleChange('value', v)} onBlur={() => void flush()} className="text-center text-xl font-semibold" placeholder="Value / count" />
            <InlineText elementId={elementId} value={localContent.label ?? localContent.description ?? ''} onChange={(v) => handleChange('label', v)} onBlur={() => void flush()} className="text-center" placeholder="Label" />
            <InlineText elementId={elementId} value={localContent.source ?? ''} onChange={(v) => handleChange('source', v)} onBlur={() => void flush()} className="text-center text-sm" placeholder="Source" />
          </>
        ) : (
          <div className="cursor-text" onClick={() => startEditing(elementId)}>
            <h3 className="mb-4 text-center text-2xl font-semibold" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(localContent.title ?? '') }} />
            <div className="my-5 flex justify-center">
              <svg className="h-auto w-full max-w-[200px]" width="200" height="200" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#00008B" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="bold" fill="black">{percentage}%</text>
              </svg>
            </div>
            <p className="text-center text-[1.125rem] font-light" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(localContent.label ?? localContent.description ?? '') }} />
            {localContent.source ? <p className="mt-2 text-center text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(localContent.source) }} /> : null}
          </div>
        )}
        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
