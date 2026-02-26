'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdownInline } from '@/lib/markdown'
import { useElementsApi } from '@/hooks/use-elements-api'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const { updateElement } = useElementsApi()
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = (content ?? { title: '', count: '', value: '', percentage: '', label: '', description: '', source: '' }) as StatisticContent
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<StatisticContent>(initial)

  useEffect(() => { rebase((content ?? { title: '', count: '', value: '', percentage: '', label: '', description: '', source: '' }) as StatisticContent) }, [content])

  const saveFn = useCallback(async (data: StatisticContent) => {
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

  const view = (content ?? {}) as StatisticContent
  const percentage = Number(view.percentage ?? view.value ?? view.count ?? 0)
  const circumference = useMemo(() => 2 * Math.PI * 45, [])
  const dashOffset = useMemo(() => circumference * (1 - Math.max(0, Math.min(100, percentage)) / 100), [circumference, percentage])

  return (
    <BaseElement content={content} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted} onElementAdded={onElementAdded}>
      <div className="space-y-4 rounded-lg bg-secondary/50 p-5">
        {editing ? (
          <InlineEditorShell title="Statistic" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
            <div data-inline-edit-root="true" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`${elementId}-title`}>Title</Label>
                <Input id={`${elementId}-title`} value={String(draft.title ?? '')} onChange={(e) => patch({ title: e.target.value })} placeholder="Statistic title" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`${elementId}-count`}>Count</Label>
                  <Input id={`${elementId}-count`} value={String(draft.count ?? '')} onChange={(e) => patch({ count: e.target.value })} placeholder="Count" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${elementId}-value`}>Value</Label>
                  <Input id={`${elementId}-value`} value={String(draft.value ?? '')} onChange={(e) => patch({ value: e.target.value })} placeholder="Value" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${elementId}-percentage`}>Percentage</Label>
                  <Input id={`${elementId}-percentage`} value={String(draft.percentage ?? '')} onChange={(e) => patch({ percentage: e.target.value })} placeholder="Percentage" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${elementId}-label`}>Label</Label>
                <Input id={`${elementId}-label`} value={String(draft.label ?? '')} onChange={(e) => patch({ label: e.target.value })} placeholder="Label" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${elementId}-description`}>Description</Label>
                <Input id={`${elementId}-description`} value={String(draft.description ?? '')} onChange={(e) => patch({ description: e.target.value })} placeholder="Description" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${elementId}-source`}>Source</Label>
                <Input id={`${elementId}-source`} value={String(draft.source ?? '')} onChange={(e) => patch({ source: e.target.value })} placeholder="Source" />
              </div>
            </div>
          </InlineEditorShell>
        ) : (
          <div
            className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
            onClick={() => isEditModeEnabled && startEditing(elementId)}
          >
            <h3 className="text-center text-[22px] font-semibold leading-tight tracking-tight text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(view.title ?? '') }} />
            <div className="my-5 flex justify-center text-primary">
              <svg className="h-auto w-full max-w-[200px]" width="200" height="200" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 50 50)" />
                <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="bold" fill="currentColor">{percentage}%</text>
              </svg>
            </div>
            <p className="text-center text-[17px] font-light text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(view.label ?? view.description ?? '') }} />
            {view.source ? <p className="mt-2 text-center text-[13px] text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(view.source) }} /> : null}
          </div>
        )}
      </div>
    </BaseElement>
  )
}
