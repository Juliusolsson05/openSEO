'use client'

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
    case 'percentage':
      return <NumberFieldInput field={field} value={value} onChange={onChange} />

    case 'url':
      return <UrlFieldInput field={field} value={value} onChange={onChange} />

    case 'select':
      return <SelectFieldInput field={field} value={value} onChange={onChange} />

    case 'array':
      return <ArrayFieldInput field={field} value={value} onChange={onChange} />

    case 'object':
    case 'nested-array':
    case 'array-object':
      // Object-like fields render sub-fields recursively
      return (
        <div className="space-y-3 border rounded-lg p-3">
          <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
          {field.fields &&
            Object.entries(field.fields).map(([key, subField]) => (
              <EditFieldRenderer
                key={key}
                field={subField}
                value={value?.[key]}
                onChange={(val) => onChange({ ...value, [key]: val })}
              />
            ))}
        </div>
      )

    case 'color':
      return (
        <div>
          <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block h-10 w-full rounded border cursor-pointer"
          />
        </div>
      )

    case 'table':
    case 'dynamic-table':
    case 'faq':
    case 'pros-cons':
    case 'versus':
      // Complex field types — render as JSON textarea fallback for now
      // Individual element sub-agents will implement specialized versions
      return (
        <div>
          <label className="text-sm font-medium text-muted-foreground">{field.label}</label>
          <textarea
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
