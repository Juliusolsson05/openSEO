'use client'

import { useCallback, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'
import { useElementsStore } from '@/stores/elements-store'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface VersusCriterion {
  name: string
  winner: number
  details: string[]
}

interface VersusContent {
  title?: string
  text_before?: string
  competitors: string[]
  criteria: VersusCriterion[]
  text_after?: string
}

export function Versus({ content, blogId, elementId, onContentUpdated, onElementAdded, onElementDeleted }: ElementComponentProps) {
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = (content ?? { title: '', text_before: '', competitors: ['', ''], criteria: [], text_after: '' }) as VersusContent
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<VersusContent>(initial)

  useEffect(() => { rebase((content ?? { title: '', text_before: '', competitors: ['', ''], criteria: [], text_after: '' }) as VersusContent) }, [content])

  const saveFn = useCallback(async (data: VersusContent) => {
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

  const competitors = Array.isArray(draft.competitors) ? draft.competitors : []
  const criteria = Array.isArray(draft.criteria) ? draft.criteria : []

  const updateCompetitor = (index: number, value: string) => {
    const next = [...competitors]
    next[index] = value
    patch({ competitors: next })
  }

  const updateCriterion = (index: number, patchValue: Partial<VersusCriterion>) => {
    const next = [...criteria]
    next[index] = { ...next[index], ...patchValue }
    patch({ criteria: next })
  }

  const updateCriterionDetail = (criterionIndex: number, competitorIndex: number, value: string) => {
    const next = [...criteria]
    const details = [...(next[criterionIndex]?.details ?? [])]
    details[competitorIndex] = value
    next[criterionIndex] = { ...next[criterionIndex], details }
    patch({ criteria: next })
  }

  const addCriterion = () => {
    patch({ criteria: [...criteria, { name: '', winner: 0, details: new Array(competitors.length).fill('') }] })
  }

  const removeCriterion = (index: number) => {
    patch({ criteria: criteria.filter((_, i) => i !== index) })
  }

  const viewContent = (content ?? { competitors: [], criteria: [] }) as VersusContent
  const viewCompetitors = Array.isArray(viewContent.competitors) ? viewContent.competitors : []
  const viewCriteria = Array.isArray(viewContent.criteria) ? viewContent.criteria : []

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementAdded={onElementAdded}
      onElementDeleted={onElementDeleted}
    >
      {editing ? (
        <InlineEditorShell title="Versus" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
          <div data-inline-edit-root="true" className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={draft.title ?? ''} onChange={(e) => patch({ title: e.target.value })} placeholder="Title" />
            </div>

            <div className="space-y-2">
              <Label>Text before</Label>
              <Textarea value={draft.text_before ?? ''} onChange={(e) => patch({ text_before: e.target.value })} placeholder="Text before comparison" rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Competitors</Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {competitors.map((competitor, index) => (
                  <Input key={index} value={competitor} onChange={(e) => updateCompetitor(index, e.target.value)} placeholder={`Competitor ${index + 1}`} />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Criteria</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
                  <Plus className="mr-1 h-4 w-4" /> Add criterion
                </Button>
              </div>

              <div className="space-y-3">
                {criteria.map((criterion, criterionIndex) => (
                  <div key={criterionIndex} className="rounded-lg border p-4 space-y-3">
                    <div className="space-y-2">
                      <Label>Criterion name</Label>
                      <Input value={criterion.name ?? ''} onChange={(e) => updateCriterion(criterionIndex, { name: e.target.value })} placeholder="Criterion name" />
                    </div>

                    <div className="space-y-2">
                      <Label>Winner</Label>
                      <select
                        value={String(criterion.winner ?? 0)}
                        onChange={(e) => updateCriterion(criterionIndex, { winner: Number(e.target.value) })}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {competitors.map((competitor, competitorIndex) => (
                          <option key={competitorIndex} value={competitorIndex}>{competitor || `Competitor ${competitorIndex + 1}`}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Details</Label>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {competitors.map((competitor, competitorIndex) => (
                          <Input
                            key={competitorIndex}
                            value={criterion.details?.[competitorIndex] ?? ''}
                            onChange={(e) => updateCriterionDetail(criterionIndex, competitorIndex, e.target.value)}
                            placeholder={`${competitor || `Competitor ${competitorIndex + 1}`} details`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeCriterion(criterionIndex)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Remove criterion
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Text after</Label>
              <Textarea value={draft.text_after ?? ''} onChange={(e) => patch({ text_after: e.target.value })} placeholder="Text after comparison" rows={4} />
            </div>
          </div>
        </InlineEditorShell>
      ) : (
        <div
          className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
          onClick={() => isEditModeEnabled && startEditing(elementId)}
        >
          {viewContent.title ? (
            <h3
              className="mb-6 text-2xl font-semibold text-foreground"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(viewContent.title) }}
            />
          ) : null}

          {viewContent.text_before ? (
            <p
              className="my-6 text-[1.05rem] leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(viewContent.text_before) }}
            />
          ) : null}

          <div className="my-8 overflow-hidden rounded-lg border">
            <div className="grid grid-cols-2 bg-muted/40 font-semibold md:grid-cols-[30%_1fr_1fr]">
              <div className="hidden border-b p-4 md:block" />
              {viewCompetitors.map((competitor, index) => (
                <div
                  key={`competitor-${index}`}
                  className="border-b p-4 text-center"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownInline(competitor) }}
                />
              ))}
            </div>

            {viewCriteria.map((criterion, index) => (
              <div key={`criterion-${index}`} className="grid grid-cols-1 border-b last:border-b-0 md:grid-cols-[30%_1fr_1fr]">
                <div
                  className="bg-muted/25 p-4 font-semibold"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownInline(criterion.name) }}
                />

                {criterion.details.map((detail, detailIndex) => {
                  const isWinner = criterion.winner === detailIndex

                  return (
                    <div key={`detail-${index}-${detailIndex}`} className={`relative p-4 ${isWinner ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''}`}>
                      <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(detail) }} />
                      {isWinner ? <span className="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-emerald-600">✓</span> : null}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {viewContent.text_after ? (
            <p
              className="my-6 text-[1.05rem] leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(viewContent.text_after) }}
            />
          ) : null}
        </div>
      )}
    </BaseElement>
  )
}
