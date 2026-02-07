'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { EditField } from '../../types'

interface Props {
  field: EditField
  value: any
  onChange: (value: number) => void
}

export function PercentageFieldInput({ field, value, onChange }: Props) {
  const parsedValue = Number.isFinite(Number(value)) ? Number(value) : 0
  const clampedValue = Math.max(0, Math.min(100, parsedValue))

  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>

      <div className="relative mt-1">
        <Input
          type="number"
          min={0}
          max={100}
          value={clampedValue}
          onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value))))}
          placeholder={field.description || field.placeholder}
          className="pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
      </div>

      <Input
        className="mt-2"
        type="range"
        min={0}
        max={100}
        value={clampedValue}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
