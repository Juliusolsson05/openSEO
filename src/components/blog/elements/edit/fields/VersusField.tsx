'use client'

import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import type { EditField } from '../../types'
import { EditFieldRenderer } from '../EditFieldRenderer'
import { useFieldValidation } from '../useFieldValidation'
import { cn } from '@/lib/utils'

interface VersusValue {
  a: Record<string, any>
  b: Record<string, any>
}

interface Props {
  field: EditField
  value: VersusValue
  onChange: (value: VersusValue) => void
}

export function VersusFieldInput({ field, value, onChange }: Props) {
  const localValue: VersusValue = {
    a: value?.a || {},
    b: value?.b || {},
  }

  const errors = useFieldValidation(field, localValue)

  const updateSide = (side: 'a' | 'b', key: string, nextValue: any) => {
    onChange({
      ...localValue,
      [side]: {
        ...(localValue[side] || {}),
        [key]: nextValue,
      },
    })
  }

  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-start">
        <Card className={cn('p-3', errors.length > 0 && 'border-destructive')}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Item A</p>
          <div className="space-y-2">
            {Object.entries(field.fields || {}).map(([key, subField]) => (
              <EditFieldRenderer
                key={`a-${key}`}
                field={subField}
                value={localValue.a?.[key]}
                onChange={(val) => updateSide('a', key, val)}
              />
            ))}
          </div>
        </Card>

        <div className="flex items-center justify-center px-2 py-5 text-sm font-semibold text-muted-foreground">VS</div>

        <Card className={cn('p-3', errors.length > 0 && 'border-destructive')}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Item B</p>
          <div className="space-y-2">
            {Object.entries(field.fields || {}).map(([key, subField]) => (
              <EditFieldRenderer
                key={`b-${key}`}
                field={subField}
                value={localValue.b?.[key]}
                onChange={(val) => updateSide('b', key, val)}
              />
            ))}
          </div>
        </Card>
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
