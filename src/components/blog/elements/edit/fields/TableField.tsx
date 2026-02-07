'use client'

import type { EditField } from '../../types'
import { ArrayFieldInput } from './ArrayField'
import { DynamicTableFieldInput } from './DynamicTableField'
import { useFieldValidation } from '../useFieldValidation'

interface TableValue {
  headers: string[]
  rows: string[][]
}

interface Props {
  field: EditField
  value: TableValue
  onChange: (value: TableValue) => void
}

const sanitizeHeaderForKey = (header: string): string =>
  header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || 'column'

const arrayToObjectRows = (headers: string[], rows: string[][]): Record<string, any>[] =>
  rows.map((row) => {
    const obj: Record<string, any> = {}
    row.forEach((cell, index) => {
      const key = sanitizeHeaderForKey(headers[index] || `column_${index}`)
      obj[key] = cell
    })
    return obj
  })

const objectToArrayRows = (headers: string[], rows: Record<string, any>[]): string[][] =>
  rows.map((row) => headers.map((header) => row[sanitizeHeaderForKey(header)] || ''))

export function TableFieldInput({ field, value, onChange }: Props) {
  const localValue: TableValue = {
    headers: Array.isArray(value?.headers) ? value.headers : [],
    rows: Array.isArray(value?.rows) ? value.rows : [],
  }

  const errors = useFieldValidation(field, localValue)

  const headerField: EditField = {
    type: 'array',
    label: 'Headers',
    itemConfig: { type: 'text', label: 'Header' },
    minItems: 2,
    maxItems: 5,
    description: 'Column headers',
  }

  const updateHeaders = (newHeaders: string[]) => {
    const newRows = localValue.rows.map((row) =>
      row.slice(0, newHeaders.length).concat(Array(Math.max(0, newHeaders.length - row.length)).fill('')),
    )

    onChange({ headers: newHeaders, rows: newRows })
  }

  const dynamicField: EditField = {
    type: 'dynamic-table',
    label: 'Table Content',
    minItems: 1,
    maxItems: 7,
    fields: Object.fromEntries(
      localValue.headers.map((header) => [sanitizeHeaderForKey(header), { type: 'text', label: header } as EditField]),
    ),
  }

  const transformedRows = arrayToObjectRows(localValue.headers, localValue.rows)

  const updateRows = (newObjectRows: Record<string, any>[]) => {
    const arrayRows = objectToArrayRows(localValue.headers, newObjectRows)
    onChange({ headers: localValue.headers, rows: arrayRows })
  }

  return (
    <div>
      <ArrayFieldInput field={headerField} value={localValue.headers} onChange={updateHeaders} />
      <div className="mt-4">
        <DynamicTableFieldInput field={dynamicField} value={transformedRows} onChange={updateRows} />
      </div>

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
