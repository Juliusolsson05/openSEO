'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { EditFieldRenderer } from '../EditFieldRenderer'
import type { EditField } from '../../types'

interface Props {
  field: EditField
  value: any[]
  onChange: (value: any[]) => void
}

export function NestedArrayFieldInput({ field, value, onChange }: Props) {
  const items = Array.isArray(value) ? value : []
  const hasReachedMaxItems = !!field.maxItems && items.length >= field.maxItems

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

  const validationError =
    field.required && !items.length
      ? 'At least one item is required'
      : field.minItems && items.length < field.minItems
        ? `Minimum ${field.minItems} items required`
        : field.maxItems && items.length > field.maxItems
          ? `Maximum ${field.maxItems} items allowed`
          : ''

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={addItem}
          disabled={hasReachedMaxItems}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-1">No items added</p>
      ) : (
        <div className="space-y-2 mt-2">
          {items.map((item, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Item {index + 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-3">
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

      {validationError && <p className="text-xs text-destructive mt-1">{validationError}</p>}
    </div>
  )
}
