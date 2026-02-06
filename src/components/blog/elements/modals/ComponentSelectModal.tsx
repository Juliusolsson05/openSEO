'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GENERATE_ELEMENT_TYPES, type ElementType } from '../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (elementType: ElementType, note?: string) => void
  loading: boolean
}

export function ComponentSelectModal({ open, onOpenChange, onSelect, loading }: Props) {
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState<ElementType | null>(null)

  if (!open) return null

  const handleSelect = () => {
    if (selected) {
      onSelect(selected, note || undefined)
      setSelected(null)
      setNote('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Add New Element</h2>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {GENERATE_ELEMENT_TYPES.map((type) => (
            <Button
              key={type}
              variant={selected === type ? 'default' : 'outline'}
              size="sm"
              className="justify-start text-xs"
              onClick={() => setSelected(type)}
            >
              {type.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>

        {selected && (
          <textarea
            className="w-full min-h-[60px] rounded-md border bg-background px-3 py-2 text-sm mt-2"
            placeholder="Optional: generation instructions"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selected || loading}>
            {loading ? 'Adding...' : 'Add Element'}
          </Button>
        </div>
      </div>
    </div>
  )
}
