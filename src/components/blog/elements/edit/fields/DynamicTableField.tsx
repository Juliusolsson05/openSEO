'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { EditField } from '../../types'
import { EditFieldRenderer } from '../EditFieldRenderer'
import { useFieldValidation } from '../useFieldValidation'

interface Props {
  field: EditField
  value: Record<string, any>[]
  onChange: (value: Record<string, any>[]) => void
}

export function DynamicTableFieldInput({ field, value, onChange }: Props) {
  const rows = Array.isArray(value) ? value : []
  const columns = Object.entries(field.fields || {})
  const hasReachedMaxRows = !!field.maxItems && rows.length >= field.maxItems
  const errors = useFieldValidation(field, rows)

  const createEmptyRow = () => {
    const row: Record<string, any> = {}
    for (const [key] of columns) row[key] = ''
    return row
  }

  const addRow = () => {
    if (hasReachedMaxRows) return
    onChange([...rows, createEmptyRow()])
  }

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index))
  }

  const updateCell = (rowIndex: number, key: string, nextValue: any) => {
    const updated = [...rows]
    updated[rowIndex] = { ...(updated[rowIndex] || {}), [key]: nextValue }
    onChange(updated)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
        <Button variant="outline" size="sm" onClick={addRow} disabled={hasReachedMaxRows}>
          <Plus className="mr-1 h-4 w-4" />
          Add Row
        </Button>
      </div>

      <div className="mt-2 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(([key, col]) => (
                <TableHead key={key}>{col.label}</TableHead>
              ))}
              <TableHead className="w-[1%] whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map(([key, col]) => (
                  <TableCell key={key}>
                    <EditFieldRenderer
                      field={{ ...col, label: col.label || '' }}
                      value={row?.[key]}
                      onChange={(val) => updateCell(rowIndex, key, val)}
                    />
                  </TableCell>
                ))}
                <TableCell className="w-[1%] whitespace-nowrap">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRow(rowIndex)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
