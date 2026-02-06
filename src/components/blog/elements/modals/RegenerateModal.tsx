'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GENERATE_ELEMENT_TYPES } from '../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegenerate: (payload: {
    regeneration_note: string
    new_element_type?: string
    new_element_count?: number
  }) => void
  loading: boolean
}

export function RegenerateModal({ open, onOpenChange, onRegenerate, loading }: Props) {
  const [note, setNote] = useState('')
  const [createNew, setCreateNew] = useState(false)
  const [newType, setNewType] = useState('')
  const [newCount, setNewCount] = useState(1)

  if (!open) return null

  const canSubmit = createNew ? newType !== '' && newCount > 0 : true

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Regenerate Content</h2>

        <textarea
          className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Enter any specific instructions for regeneration"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <label className="flex items-center gap-2 mt-4 text-sm">
          <input
            type="checkbox"
            checked={createNew}
            onChange={(e) => setCreateNew(e.target.checked)}
          />
          New element(s)
        </label>

        {createNew && (
          <div className="space-y-3 mt-3">
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            >
              <option value="">Select element type</option>
              {GENERATE_ELEMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <Input
              type="number"
              min={1}
              value={newCount}
              onChange={(e) => setNewCount(Number(e.target.value))}
              placeholder="Number of elements"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={() => onRegenerate({
              regeneration_note: note,
              ...(createNew ? { new_element_type: newType, new_element_count: newCount } : {}),
            })}
            disabled={!canSubmit || loading}
          >
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>
    </div>
  )
}
