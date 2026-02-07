'use client'

import { Label } from '@/components/ui/label'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditFieldRenderer } from '../EditFieldRenderer'
import type { EditField } from '../../types'

interface Props {
  field: EditField
  value: any[]
  onChange: (value: any[]) => void
}

export function ArrayFieldInput({ field, value, onChange }: Props) {
  const items = value || []
  const hasReachedMax = field.maxItems ? items.length >= field.maxItems : false

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
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={addItem}
          disabled={hasReachedMax}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground mt-1">No items added</p>
      )}

      <div className="space-y-2 mt-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2 border rounded-md p-2">
            <div className="flex-1">
              {field.itemConfig ? (
                <EditFieldRenderer
                  field={field.itemConfig}
                  value={item}
                  onChange={(val) => updateItem(index, val)}
                />
              ) : (
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={item ?? ''}
                  onChange={(e) => updateItem(index, e.target.value)}
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive shrink-0"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
