'use client'

import { createElement, useMemo, useState } from 'react'
import { Search, Eye, X, LayoutGrid, List, Sparkles, LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { GENERATE_ELEMENT_TYPES, type ElementType } from '../types'
import { getPreviewComponent, getExample, getIcon } from '../registry'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (elementType: ElementType, note?: string) => void
  onTemplateSelect?: (templateId: string) => void
  loading: boolean
}

type ViewMode = 'grid' | 'list'
type SelectMode = 'generate' | 'template'

const TEMPLATES = [{ id: 'call_to_action', label: 'Call to Action' }]

function pretty(type: string) {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

export function ComponentSelectModal({ open, onOpenChange, onSelect, onTemplateSelect, loading }: Props) {
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState<ElementType | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [previewType, setPreviewType] = useState<ElementType | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [mode, setMode] = useState<SelectMode>('generate')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return GENERATE_ELEMENT_TYPES
    return GENERATE_ELEMENT_TYPES.filter((t) => t.includes(q) || pretty(t).toLowerCase().includes(q))
  }, [search])

  const handleClose = () => {
    onOpenChange(false)
    setSelected(null)
    setSelectedTemplate(null)
    setNote('')
    setSearch('')
    setMode('generate')
    setViewMode('grid')
  }

  const handleConfirm = () => {
    if (mode === 'generate' && selected) {
      onSelect(selected, note || undefined)
      handleClose()
      return
    }

    if (mode === 'template' && selectedTemplate) {
      onTemplateSelect?.(selectedTemplate)
      handleClose()
    }
  }

  const previewExample = previewType ? getExample(previewType) : null

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose() }}>
        <DialogContent className="z-[70] bg-background rounded-sm border border-info-light w-full max-w-5xl p-5 max-h-[85vh] overflow-y-auto">
          <VisuallyHidden><DialogTitle>Add Element</DialogTitle></VisuallyHidden>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Add Element</h2>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="inline-flex rounded-sm border border-info-light p-1 mb-4 bg-info-light">
            <Button
              type="button"
              size="sm"
              variant={mode === 'generate' ? 'default' : 'ghost'}
              className="h-8 text-xs"
              onClick={() => setMode('generate')}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Generate
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === 'template' ? 'default' : 'ghost'}
              className="h-8 text-xs"
              onClick={() => setMode('template')}
            >
              <LayoutTemplate className="h-3.5 w-3.5 mr-1" /> Template
            </Button>
          </div>

          {mode === 'generate' ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <Input className="h-8 pl-8" placeholder="Search elements" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="inline-flex rounded-sm border border-info-light p-0.5 bg-info-light">
                  <Button type="button" size="icon" variant={viewMode === 'grid' ? 'default' : 'ghost'} className="h-7 w-7" onClick={() => setViewMode('grid')}>
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant={viewMode === 'list' ? 'default' : 'ghost'} className="h-7 w-7" onClick={() => setViewMode('list')}>
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {filtered.map((type) => {
                    const Icon = getIcon(type)
                    return (
                      <div
                        key={type}
                        role="button"
                        tabIndex={0}
                        className={`text-left border rounded-sm p-3 transition-all cursor-pointer ${selected === type ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-info-light hover:border-primary/40 hover:bg-primary/5'}`}
                        onClick={() => setSelected(type)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(type) }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-[86px] flex items-center justify-center w-full">
                            {Icon ? <Icon width={80} height={80} className="shrink-0" /> : null}
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[12px] font-semibold leading-snug">{pretty(type)}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-primary"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreviewType(type)
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {filtered.map((type) => {
                    const Icon = getIcon(type)
                    return (
                      <div
                        key={type}
                        role="button"
                        tabIndex={0}
                        className={`border rounded-sm px-3 py-2 transition-all cursor-pointer flex items-center justify-between ${selected === type ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-info-light hover:border-primary/40 hover:bg-primary/5'}`}
                        onClick={() => setSelected(type)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(type) }}
                      >
                        <div className="flex items-center gap-3">
                          {Icon ? <Icon width={48} height={48} /> : null}
                          <span className="text-[13px] font-medium">{pretty(type)}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewType(type)
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}

              {selected && (
                <Textarea
                  className="w-full min-h-[72px] rounded-sm border border-border bg-background px-3 py-2 text-[13px]"
                  placeholder="Optional generation instructions"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              )}
            </>
          ) : (
            <div className="space-y-2 mb-4">
              {TEMPLATES.map((template) => (
                <Button
                  type="button"
                  key={template.id}
                  variant="outline"
                  className={`h-auto w-full justify-start rounded-sm px-3 py-2 text-left ${selectedTemplate === template.id ? 'border-primary bg-primary/10 ring-1 ring-primary hover:bg-primary/10' : 'border-info-light hover:border-primary/40 hover:bg-primary/5'}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div>
                    <div className="font-medium text-[13px]">{template.label}</div>
                    <div className="text-[12px] text-muted-foreground">Insert a template-based component flow.</div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={(mode === 'generate' ? !selected : !selectedTemplate) || loading}>
              {loading ? 'Adding...' : mode === 'generate' ? 'Add Element' : 'Use Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {previewType && previewExample && (
        <Dialog open={true} onOpenChange={(next) => { if (!next) setPreviewType(null) }}>
          <DialogContent className="z-[80] max-w-3xl border-border rounded-sm p-0">
            <VisuallyHidden><DialogTitle>Element Preview</DialogTitle></VisuallyHidden> 
            <Card className="w-full max-w-3xl border-border rounded-sm">
            <CardHeader className="flex-row items-center justify-between py-3">
              <CardTitle className="text-[14px]">{pretty(previewType)} Preview</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewType(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              {createElement(getPreviewComponent(previewType), { content: previewExample as unknown })}
            </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
