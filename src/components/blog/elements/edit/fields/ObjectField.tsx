'use client'

import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { EditFieldRenderer } from '../EditFieldRenderer'
import type { EditField } from '../../types'

interface Props {
  field: EditField
  value: Record<string, any>
  onChange: (value: Record<string, any>) => void
}

export function ObjectFieldInput({ field, value, onChange }: Props) {
  const localValue = value || {}

  const updateField = (key: string, val: any) => {
    onChange({ ...localValue, [key]: val })
  }

  const validationError = field.required
    ? Object.entries(field.fields || {}).find(([key, subField]) => subField.required && !localValue[key])?.[1]
        ?.label
    : undefined

  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
      <Card className="mt-2 p-4 space-y-3">
        {Object.entries(field.fields || {}).map(([key, subField]) => (
          <EditFieldRenderer
            key={key}
            field={subField}
            value={localValue[key]}
            onChange={(val) => updateField(key, val)}
          />
        ))}
      </Card>
      {validationError && <p className="text-xs text-destructive mt-1">{validationError} is required</p>}
    </div>
  )
}
