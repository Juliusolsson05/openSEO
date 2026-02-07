'use client'

import { Label } from '@/components/ui/label'

/**
 * EditFieldRenderer — routes to the correct field component based on field.type.
 * Ported from aurora_dashboard/views/apps/blog/elements/edit/EditField.vue
 */

import type { EditField } from '../types'
import { TextFieldInput } from './fields/TextField'
import { ArrayFieldInput } from './fields/ArrayField'
import { NumberFieldInput } from './fields/NumberField'
import { UrlFieldInput } from './fields/UrlField'
import { SelectFieldInput } from './fields/SelectField'
import { ObjectFieldInput } from './fields/ObjectField'
import { NestedArrayFieldInput } from './fields/NestedArrayField'
import { ArrayObjectFieldInput } from './fields/ArrayObjectField'
import { PercentageFieldInput } from './fields/PercentageField'
import { FaqFieldInput } from './fields/FaqField'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface EditFieldRendererProps {
  field: EditField
  value: any
  onChange: (value: any) => void
}

export function EditFieldRenderer({ field, value, onChange }: EditFieldRendererProps) {
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'rich-text':
      return <TextFieldInput field={field} value={value} onChange={onChange} />

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

    case 'color':
      return (
        <div>
          <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
          <Input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block h-10 w-full rounded border cursor-pointer"
          />
        </div>
      )

    case 'faq':
      return <FaqFieldInput field={field} value={value} onChange={onChange} />

    case 'table':
    case 'dynamic-table':
    case 'pros-cons':
    case 'versus':
      // Complex field types — render as JSON textarea fallback for now
      // Individual element sub-agents will implement specialized versions
      return (
        <div>
          <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
          <Textarea
            className="mt-1 w-full min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm font-mono"
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value))
              } catch {
                onChange(e.target.value)
              }
            }}
          />
        </div>
      )

    default:
      return <TextFieldInput field={field} value={value} onChange={onChange} />
  }
}
