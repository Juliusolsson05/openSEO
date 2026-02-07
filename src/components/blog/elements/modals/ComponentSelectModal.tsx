'use client'

import { createPortal } from 'react-dom'

import { useMemo, useState } from 'react'
import { Search, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GENERATE_ELEMENT_TYPES, type ElementType } from '../types'
import { getPreviewComponent, getExample } from '../registry'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (elementType: ElementType, note?: string) => void
  loading: boolean
}

function pretty(type: string) {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

export function ComponentSelectModal({ open, onOpenChange, onSelect, loading }: Props) {
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState<ElementType | null>(null)
  const [search, setSearch] = useState('')
  const [previewType, setPreviewType] = useState<ElementType | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return GENERATE_ELEMENT_TYPES
    return GENERATE_ELEMENT_TYPES.filter((t) => t.includes(q) || pretty(t).toLowerCase().includes(q))
  }, [search])

  if (!open) return null

  const handleSelect = () => {
    if (selected) {
      onSelect(selected, note || undefined)
      setSelected(null)
      setNote('')
      setSearch('')
    }
  }

  const PreviewComponent = previewType ? getPreviewComponent(previewType) : null
  const previewExample = previewType ? getExample(previewType) : null

  return createPortal(
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => onOpenChange(false)}>
        <div className="bg-background rounded-sm border border-border w-full max-w-4xl p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">Add Element</h2>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input className="h-8 pl-8" placeholder="Search elements" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
            {filtered.map((type) => (
              <div
                key={type}
                role="button"
                tabIndex={0}
                className={`text-left border rounded-sm p-2.5 transition-colors cursor-pointer ${selected === type ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/60'}`}
                onClick={() => setSelected(type)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(type) }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold leading-snug">{pretty(type)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewType(type)
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <textarea
              className="w-full min-h-[72px] rounded-sm border border-border bg-background px-3 py-2 text-[13px]"
              placeholder="Optional generation instructions"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleSelect} disabled={!selected || loading}>{loading ? 'Adding...' : 'Add Element'}</Button>
          </div>
        </div>
      </div>

      {previewType && PreviewComponent && previewExample && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={() => setPreviewType(null)}>
          <Card className="w-full max-w-3xl border-border rounded-sm" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex-row items-center justify-between py-3">
              <CardTitle className="text-[14px]">{pretty(previewType)} Preview</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewType(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              <PreviewComponent content={previewExample as any} />
            </CardContent>
          </Card>
        </div>
      )}
    </>,
    document.body
  )
}
