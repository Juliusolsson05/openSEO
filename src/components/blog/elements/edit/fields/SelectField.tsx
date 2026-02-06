'use client'

import type { EditField } from '../../types'

interface Props {
  field: EditField
  value: any
  onChange: (value: any) => void
}

export function SelectFieldInput({ field, value, onChange }: Props) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
      <select
        className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
