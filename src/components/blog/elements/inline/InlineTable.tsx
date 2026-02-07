'use client'

import { useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineTableProps {
  headers: string[]
  rows: string[][]
  onChange: (headers: string[], rows: string[][]) => void
  className?: string
}

export function InlineTable({ headers, rows, onChange, className }: InlineTableProps) {
  const [editing, setEditing] = useState(false)
  const [focusCell, setFocusCell] = useState<string | null>(null)
  const refs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (!focusCell) return
    const el = refs.current[focusCell]
    if (!el) return
    el.focus()
    el.select()
    setFocusCell(null)
  }, [focusCell, headers, rows])

  const columnCount = Math.max(1, headers.length)
  const normalizedHeaders = headers.length ? headers : Array.from({ length: columnCount }, (_, i) => `Column ${i + 1}`)
  const normalizedRows = rows.length ? rows.map((row) => Array.from({ length: normalizedHeaders.length }, (_, i) => row[i] ?? '')) : [['']]

  const setHeader = (index: number, value: string) => {
    const next = [...normalizedHeaders]
    next[index] = value
    onChange(next, normalizedRows)
  }

  const setCell = (rowIndex: number, colIndex: number, value: string) => {
    const nextRows = normalizedRows.map((row) => [...row])
    nextRows[rowIndex][colIndex] = value
    onChange(normalizedHeaders, nextRows)
  }

  const addRow = () => {
    const nextRows = [...normalizedRows, Array.from({ length: normalizedHeaders.length }, () => '')]
    onChange(normalizedHeaders, nextRows)
    setFocusCell(`r-${nextRows.length - 1}-0`)
  }

  const addColumn = () => {
    const nextHeaders = [...normalizedHeaders, `Column ${normalizedHeaders.length + 1}`]
    const nextRows = normalizedRows.map((row) => [...row, ''])
    onChange(nextHeaders, nextRows)
    setFocusCell(`h-${nextHeaders.length - 1}`)
  }

  const removeRow = (index: number) => {
    const nextRows = normalizedRows.filter((_, i) => i !== index)
    onChange(normalizedHeaders, nextRows.length ? nextRows : [['']])
  }

  const removeColumn = (index: number) => {
    if (normalizedHeaders.length === 1) return
    const nextHeaders = normalizedHeaders.filter((_, i) => i !== index)
    const nextRows = normalizedRows.map((row) => row.filter((_, i) => i !== index))
    onChange(nextHeaders, nextRows)
  }

  const moveNext = (rowIndex: number, colIndex: number) => {
    const isLastCell = rowIndex === normalizedRows.length - 1 && colIndex === normalizedHeaders.length - 1
    if (isLastCell) {
      addRow()
      return
    }

    if (colIndex < normalizedHeaders.length - 1) {
      setFocusCell(`r-${rowIndex}-${colIndex + 1}`)
    } else {
      setFocusCell(`r-${rowIndex + 1}-0`)
    }
  }

  if (!editing) {
    return (
      <div className={cn('overflow-x-auto rounded-lg border', className)} onClick={() => setEditing(true)}>
        <table className="w-full border-separate border-spacing-0 cursor-text">
          <thead>
            <tr className="bg-muted/50">
              {normalizedHeaders.map((header, index) => (
                <th key={index} className="border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalizedRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border-b px-4 py-3 text-sm">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-muted/50">
              {normalizedHeaders.map((header, colIndex) => (
                <th key={colIndex} className="border-b px-2 py-2">
                  <div className="flex items-center gap-1">
                    <input
                      ref={(el) => {
                        refs.current[`h-${colIndex}`] = el
                      }}
                      value={header}
                      onChange={(e) => setHeader(colIndex, e.target.value)}
                      className="w-full rounded border px-2 py-1 text-xs font-semibold uppercase"
                    />
                    <button type="button" onClick={() => removeColumn(colIndex)} className="p-1 text-muted-foreground hover:text-foreground">
                      <Minus className="h-3 w-3" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalizedRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border-b px-2 py-2">
                    <input
                      ref={(el) => {
                        refs.current[`r-${rowIndex}-${colIndex}`] = el
                      }}
                      value={cell}
                      onChange={(e) => setCell(rowIndex, colIndex, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          moveNext(rowIndex, colIndex)
                        }
                        if (e.key === 'Tab' && !e.shiftKey) {
                          e.preventDefault()
                          moveNext(rowIndex, colIndex)
                        }
                      }}
                      className="w-full rounded border px-2 py-1 text-sm"
                    />
                  </td>
                ))}
                <td className="border-b px-1 py-2">
                  <button type="button" onClick={() => removeRow(rowIndex)} className="p-1 text-muted-foreground hover:text-foreground">
                    <Minus className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 text-sm">
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1 text-primary"><Plus className="h-4 w-4" /> Add row</button>
        <button type="button" onClick={addColumn} className="inline-flex items-center gap-1 text-primary"><Plus className="h-4 w-4" /> Add column</button>
      </div>
    </div>
  )
}
