'use client'

import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditFieldRenderer } from '../EditFieldRenderer'
import type { EditField } from '../../types'
import { useFieldValidation } from '../useFieldValidation'

interface Props {
  field: EditField
  value: any[]
  onChange: (value: any[]) => void
}

export function ArrayFieldInput({ field, value, onChange }: Props) {
  const items = value || []
  const hasReachedMax = field.maxItems ? items.length >= field.maxItems : false
  const errors = useFieldValidation(field, items)

  const addItem = () => {
    if (hasReachedMax) return
    onChange([...items, ''])
  }

  const updateItem = (index: number, val: any) => {
    const updated = [...items]
    updated[index] = val
    onChange(updated)
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addItem} disabled={hasReachedMax}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {items.length === 0 && <p className="mt-1 text-sm text-muted-foreground">No items added</p>}

      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2 rounded-md border p-2">
            <div className="flex-1">
              {field.itemConfig ? (
                <EditFieldRenderer field={field.itemConfig} value={item} onChange={(val) => updateItem(index, val)} />
              ) : (
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={item ?? ''}
                  onChange={(e) => updateItem(index, e.target.value)}
                />
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeItem(index)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {errors.map((err, i) => (
            <p key={i} className="text-[11px] text-destructive">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
