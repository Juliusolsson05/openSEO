'use client'

import { Input } from '@/components/ui/input'
import type { EditField } from '../../types'

interface Props {
  field: EditField
  value: any
  onChange: (value: number) => void
}

export function NumberFieldInput({ field, value, onChange }: Props) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
      <Input
        className="mt-1"
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={field.description || field.placeholder}
      />
    </div>
  )
}
