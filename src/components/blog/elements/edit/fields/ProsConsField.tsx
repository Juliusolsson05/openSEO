'use client'

import { Plus, Minus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { EditField } from '../../types'
import { useFieldValidation } from '../useFieldValidation'
import { cn } from '@/lib/utils'

interface ProsConsValue {
  pros: string[]
  cons: string[]
}

interface Props {
  field: EditField
  value: ProsConsValue
  onChange: (value: ProsConsValue) => void
}

const MAX_ITEMS = 10

export function ProsConsFieldInput({ field, value, onChange }: Props) {
  const localValue: ProsConsValue = {
    pros: Array.isArray(value?.pros) ? value.pros : [],
    cons: Array.isArray(value?.cons) ? value.cons : [],
  }

  const errors = useFieldValidation(field, localValue)

  const addPro = () => {
    if (localValue.pros.length >= MAX_ITEMS) return
    onChange({ ...localValue, pros: [...localValue.pros, ''] })
  }

  const addCon = () => {
    if (localValue.cons.length >= MAX_ITEMS) return
    onChange({ ...localValue, cons: [...localValue.cons, ''] })
  }

  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
      <div className="mt-2 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-emerald-700">Pros</p>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-700" onClick={addPro} disabled={localValue.pros.length >= MAX_ITEMS}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {localValue.pros.map((pro, index) => (
              <div key={index} className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600" />
                <Input
                  className="h-8"
                  value={pro}
                  placeholder="Enter a pro"
                  onChange={(e) => {
                    const next = [...localValue.pros]
                    next[index] = e.target.value
                    onChange({ ...localValue, pros: next })
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => onChange({ ...localValue, pros: localValue.pros.filter((_, i) => i !== index) })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {localValue.pros.length === 0 && <p className="text-xs text-muted-foreground">No pros added</p>}
          </div>
        </div>

        <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-rose-700">Cons</p>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-700" onClick={addCon} disabled={localValue.cons.length >= MAX_ITEMS}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {localValue.cons.map((con, index) => (
              <div key={index} className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-rose-600" />
                <Input
                  className="h-8"
                  value={con}
                  placeholder="Enter a con"
                  onChange={(e) => {
                    const next = [...localValue.cons]
                    next[index] = e.target.value
                    onChange({ ...localValue, cons: next })
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => onChange({ ...localValue, cons: localValue.cons.filter((_, i) => i !== index) })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {localValue.cons.length === 0 && <p className="text-xs text-muted-foreground">No cons added</p>}
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className={cn('mt-1 space-y-0.5')}>
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
