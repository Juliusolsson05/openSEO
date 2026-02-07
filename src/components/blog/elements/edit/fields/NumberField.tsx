'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { EditField } from '../../types'
import { useFieldValidation } from '../useFieldValidation'

interface Props {
  field: EditField
  value: any
  onChange: (value: number) => void
}

export function NumberFieldInput({ field, value, onChange }: Props) {
  const errors = useFieldValidation(field, value)

  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
      <Input
        className={cn('mt-1', errors.length > 0 && 'border-destructive')}
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={field.description || field.placeholder}
      />
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
