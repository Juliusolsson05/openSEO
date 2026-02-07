'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { EditField } from '../../types'
import { useFieldValidation } from '../useFieldValidation'

interface Props {
  field: EditField
  value: any
  onChange: (value: string) => void
}

export function RichTextFieldInput({ field, value, onChange }: Props) {
  const [preview, setPreview] = useState(false)
  const errors = useFieldValidation(field, value)

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
        <Button variant="outline" size="sm" onClick={() => setPreview((v) => !v)}>
          {preview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {preview ? (
        <div
          className={cn('prose mt-1 min-h-[160px] max-w-none rounded-md border bg-background p-3 text-sm', errors.length > 0 && 'border-destructive')}
          dangerouslySetInnerHTML={{ __html: value || '' }}
        />
      ) : (
        <Textarea
          className={cn('mt-1 min-h-[160px] w-full rounded-md border bg-background px-3 py-2 text-sm', errors.length > 0 && 'border-destructive')}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.description || field.placeholder}
        />
      )}

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
