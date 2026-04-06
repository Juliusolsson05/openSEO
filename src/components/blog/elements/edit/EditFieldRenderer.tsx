'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { EditField } from '../types'
import { TextFieldInput } from './fields/TextField'
import { RichTextFieldInput } from './fields/RichTextField'
import { ArrayFieldInput } from './fields/ArrayField'
import { NumberFieldInput } from './fields/NumberField'
import { PercentageFieldInput } from './fields/PercentageField'
import { UrlFieldInput } from './fields/UrlField'
import { SelectFieldInput } from './fields/SelectField'
import { ObjectFieldInput } from './fields/ObjectField'
import { NestedArrayFieldInput } from './fields/NestedArrayField'
import { ArrayObjectFieldInput } from './fields/ArrayObjectField'
import { FaqFieldInput } from './fields/FaqField'
import { DynamicTableFieldInput } from './fields/DynamicTableField'
import { TableFieldInput } from './fields/TableField'
import { ProsConsFieldInput } from './fields/ProsConsField'
import { VersusFieldInput } from './fields/VersusField'
import { useFieldValidation } from './useFieldValidation'

interface EditFieldRendererProps {
  field: EditField
  value: any
  onChange: (value: any) => void
}

export function EditFieldRenderer({ field, value, onChange }: EditFieldRendererProps) {
  switch (field.type) {
    case 'text':
    case 'textarea':
      return <TextFieldInput field={field} value={value} onChange={onChange} />

    case 'rich-text':
      return <RichTextFieldInput field={field} value={value} onChange={onChange} />

    case 'number':
      return <NumberFieldInput field={field} value={value} onChange={onChange} />

    case 'percentage':
      return <PercentageFieldInput field={field} value={value} onChange={onChange} />

    case 'url':
      return <UrlFieldInput field={field} value={value} onChange={onChange} />

    case 'select':
      return <SelectFieldInput field={field} value={value} onChange={onChange} />

    case 'array':
      return <ArrayFieldInput field={field} value={value} onChange={onChange} />

    case 'object':
      return <ObjectFieldInput field={field} value={value} onChange={onChange} />

    case 'nested-array':
      return <NestedArrayFieldInput field={field} value={value} onChange={onChange} />

    case 'array-object':
      return <ArrayObjectFieldInput field={field} value={value} onChange={onChange} />

    case 'faq':
      return <FaqFieldInput field={field} value={value} onChange={onChange} />

    case 'dynamic-table':
      return <DynamicTableFieldInput field={field} value={value} onChange={onChange} />

    case 'table':
      return <TableFieldInput field={field} value={value} onChange={onChange} />

    case 'pros-cons':
      return <ProsConsFieldInput field={field} value={value} onChange={onChange} />

    case 'versus':
      return <VersusFieldInput field={field} value={value} onChange={onChange} />

    case 'color':
      return <ColorFieldInput field={field} value={value} onChange={onChange} />

    default:
      return <TextFieldInput field={field} value={value} onChange={onChange} />
  }
}

function ColorFieldInput({ field, value, onChange }: EditFieldRendererProps) {
  const errors = useFieldValidation(field, value)

  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
      <Input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className={cn('mt-1 block h-10 w-full cursor-pointer rounded border', errors.length > 0 && 'border-destructive')}
      />
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
