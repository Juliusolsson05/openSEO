'use client'

import type { EditField } from '../../types'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  field: EditField
  value: any
  onChange: (value: any) => void
}

export function SelectFieldInput({ field, value, onChange }: Props) {
  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
      <Select value={value ?? ''} onValueChange={onChange}>
        <SelectTrigger className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
