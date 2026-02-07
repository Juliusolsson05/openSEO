'use client'

import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { EditFieldRenderer } from '../EditFieldRenderer'
import type { EditField } from '../../types'
import { useFieldValidation } from '../useFieldValidation'
import { cn } from '@/lib/utils'

interface Props {
  field: EditField
  value: Record<string, any>
  onChange: (value: Record<string, any>) => void
}

export function ObjectFieldInput({ field, value, onChange }: Props) {
  const localValue = value || {}
  const errors = useFieldValidation(field, localValue)

  const updateField = (key: string, val: any) => {
    onChange({ ...localValue, [key]: val })
  }

  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
      <Card className={cn('mt-2 space-y-3 p-4', errors.length > 0 && 'border-destructive')}>
        {Object.entries(field.fields || {}).map(([key, subField]) => (
          <EditFieldRenderer key={key} field={subField} value={localValue[key]} onChange={(val) => updateField(key, val)} />
        ))}
      </Card>
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
