'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineListProps {
  items: string[]
  onChange: (items: string[]) => void
  ordered?: boolean
  className?: string
  placeholder?: string
}

export function InlineList({ items, onChange, ordered = false, className, placeholder }: InlineListProps) {
  const [editing, setEditing] = useState(false)
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (focusIndex == null) return
    const input = inputRefs.current[focusIndex]
    if (!input) return
    input.focus()
    const len = input.value.length
    input.setSelectionRange(len, len)
    setFocusIndex(null)
  }, [focusIndex, items])

  const normalized = items.length ? items : ['']

  const updateItem = (index: number, value: string) => {
    const next = [...normalized]
    next[index] = value
    onChange(next)
  }

  const addItem = (index = normalized.length - 1) => {
    const next = [...normalized]
    next.splice(index + 1, 0, '')
    onChange(next)
    setFocusIndex(index + 1)
  }

  const removeItem = (index: number) => {
    if (normalized.length === 1) {
      onChange([''])
      setFocusIndex(0)
      return
    }

    const next = normalized.filter((_, i) => i !== index)
    onChange(next)
    setFocusIndex(Math.max(0, index - 1))
  }

  if (!editing) {
    const ListTag = ordered ? 'ol' : 'ul'
    return (
      <ListTag className={cn(ordered ? 'list-decimal' : 'list-disc', 'cursor-text space-y-1 pl-5', className)} onClick={() => setEditing(true)}>
        {normalized.map((item, idx) => (
          <li key={idx}>{item || <span className="text-muted-foreground">{placeholder ?? 'Click to edit list...'}</span>}</li>
        ))}
      </ListTag>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {normalized.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-6 shrink-0 text-sm text-muted-foreground">{ordered ? `${index + 1}.` : '•'}</span>
          <input
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            value={item}
            placeholder={placeholder ?? 'List item'}
            onChange={(e) => updateItem(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addItem(index)
              }
              if (e.key === 'Backspace' && !item) {
                e.preventDefault()
                removeItem(index)
              }
              if (e.key === 'Tab') {
                if (e.shiftKey) {
                  setFocusIndex(Math.max(0, index - 1))
                } else {
                  if (index === normalized.length - 1) {
                    e.preventDefault()
                    addItem(index)
                  } else {
                    setFocusIndex(index + 1)
                  }
                }
              }
            }}
            className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm outline-none ring-ring focus:ring-1"
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Delete list item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {index === normalized.length - 1 ? (
            <button
              type="button"
              onClick={() => addItem(index)}
              className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Add list item"
            >
              <Plus className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
