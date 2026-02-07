'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

  const canSubmit = createNew ? newType !== '' && newCount > 0 : true

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader><DialogTitle>Regenerate Content</DialogTitle></DialogHeader>

        <Textarea
          placeholder="Enter any specific instructions for regeneration"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="new-elements" checked={createNew} onCheckedChange={(v) => setCreateNew(Boolean(v))} />
          <Label htmlFor="new-elements">New element(s)</Label>
        </div>

        {createNew && (
          <div className="space-y-3">
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger><SelectValue placeholder="Select element type" /></SelectTrigger>
              <SelectContent>
                {GENERATE_ELEMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" min={1} value={newCount} onChange={(e) => setNewCount(Number(e.target.value))} placeholder="Number of elements" />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={() => onRegenerate({
              regeneration_note: note,
              ...(createNew ? { new_element_type: newType, new_element_count: newCount } : {}),
            })}
            disabled={!canSubmit || loading}
          >{loading ? 'Generating...' : 'Generate'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
