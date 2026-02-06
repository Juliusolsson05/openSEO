'use client'

import { Input } from '@/components/ui/input'
import type { EditField } from '../../types'

interface Props {
  field: EditField
  value: any
  onChange: (value: string) => void
}

export function TextFieldInput({ field, value, onChange }: Props) {
  const isTextarea = field.type === 'textarea' || field.type === 'rich-text'

  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
      {isTextarea ? (
        <textarea
          className="mt-1 w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.description || field.placeholder}
        />
      ) : (
        <Input
          className="mt-1"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.description || field.placeholder}
        />
      )}
    </div>
  )
}
