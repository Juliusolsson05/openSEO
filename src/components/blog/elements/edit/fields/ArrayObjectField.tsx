'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { EditFieldRenderer } from '../EditFieldRenderer'
import type { EditField } from '../../types'
import { useFieldValidation } from '../useFieldValidation'
import { cn } from '@/lib/utils'

interface Props {
  field: EditField
  value: any[]
  onChange: (value: any[]) => void
}

export function ArrayObjectFieldInput({ field, value, onChange }: Props) {
  const items = Array.isArray(value) ? value : []
  const hasReachedMaxItems = !!field.maxItems && items.length >= field.maxItems
  const errors = useFieldValidation(field, items)

  const createEmptyItem = () => {
    const item: Record<string, any> = {}
    for (const key of Object.keys(field.fields || {})) {
      item[key] = ''
    }
    return item
  }

  const addItem = () => {
    if (hasReachedMaxItems) return
    onChange([...items, createEmptyItem()])
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const updateItemField = (index: number, key: string, val: any) => {
    const updated = [...items]
    updated[index] = { ...(updated[index] || {}), [key]: val }
    onChange(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addItem} disabled={hasReachedMaxItems}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">No items added</p>
      ) : (
        <div className="mt-2 space-y-3">
          {items.map((item, index) => (
            <Card key={index} className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Item {index + 1}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(index)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                {Object.entries(field.fields || {}).map(([key, subField]) => (
                  <EditFieldRenderer
                    key={key}
                    field={subField}
                    value={item?.[key]}
                    onChange={(val) => updateItemField(index, key, val)}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {errors.length > 0 && (
        <div className={cn('mt-1 space-y-0.5')}>
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
