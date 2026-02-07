'use client'

import type { EditField } from '../../types'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useFieldValidation } from '../useFieldValidation'

interface Props {
  field: EditField
  value: any
  onChange: (value: any) => void
}

export function SelectFieldInput({ field, value, onChange }: Props) {
  const errors = useFieldValidation(field, value)

  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
      <Select value={value == null ? '' : String(value)} onValueChange={onChange}>
        <SelectTrigger className={cn('mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm', errors.length > 0 && 'border-destructive')}>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
