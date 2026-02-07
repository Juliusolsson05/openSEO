'use client'

import { Label } from '@/components/ui/label'

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
      <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
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
