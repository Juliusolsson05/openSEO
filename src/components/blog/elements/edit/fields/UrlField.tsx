'use client'

import { Input } from '@/components/ui/input'
import type { EditField } from '../../types'

interface Props {
  field: EditField
  value: any
  onChange: (value: string) => void
}

export function UrlFieldInput({ field, value, onChange }: Props) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
      <Input
        className="mt-1"
        type="url"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.description || 'https://...'}
      />
    </div>
  )
}
