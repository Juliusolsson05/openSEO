'use client'

import { useEffect, useRef, useState } from 'react'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInlineEdit } from './InlineEditProvider'

interface InlineTextProps {
  value: string
  onChange: (value: string) => void
  as?: 'h2' | 'h3' | 'p' | 'span'
  multiline?: boolean
  className?: string
  placeholder?: string
  elementId?: number
  onBlur?: () => void
}

export function InlineText({
  value,
  onChange,
  as = 'p',
  multiline = false,
  className,
  placeholder,
  elementId,
  onBlur,
}: InlineTextProps) {
  const Tag = as
  const { isEditModeEnabled, startEditing, stopEditing, isEditing } = useInlineEdit()
  const active = elementId ? isEditing(elementId) : false
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => setDraft(value), [value])

  useEffect(() => {
    if (active) {
      const input = inputRef.current
      if (!input) return
      input.focus()
      const len = input.value.length
      input.setSelectionRange?.(len, len)
    }
  }, [active])

  const commit = () => {
    if (draft !== value) onChange(draft)
    onBlur?.()
    stopEditing()
  }

  const cancel = () => {
    setDraft(value)
    stopEditing()
  }

  if (!active) {
    return (
      <Tag
        className={cn(
          'group/inline relative rounded-sm transition',
          isEditModeEnabled && 'cursor-text hover:border-dashed hover:border-border',
          className,
        )}
        onClick={() => isEditModeEnabled && elementId && startEditing(elementId)}
      >
        {value || <span className="text-muted-foreground">{placeholder ?? 'Click to edit...'}</span>}
        {isEditModeEnabled ? <Pencil className="ml-1 inline h-3 w-3 opacity-0 transition group-hover/inline:opacity-40" /> : null}
      </Tag>
    )
  }

  if (multiline) {
    return (
      <div data-inline-edit-root="true">
      <textarea
        ref={(el) => {
          inputRef.current = el
          if (!el) return
          el.style.height = 'auto'
          el.style.height = `${el.scrollHeight}px`
        }}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => {
          setDraft(e.target.value)
          e.currentTarget.style.height = 'auto'
          e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
        }}
        onBlur={() => {
          // Do not auto-commit on blur (caused instant-save/close issues).
          // Save is explicit via keyboard (Cmd/Ctrl+Enter) or element-level actions.
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            cancel()
          }
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            commit()
          }
        }}
        className={cn('w-full resize-none rounded-md border border-border bg-background px-2 py-1 outline-none ring-ring focus:ring-1', className)}
        rows={1}
      />
      </div>
    )
  }

  return (
    <div data-inline-edit-root="true">
    <input
      ref={(el) => {
        inputRef.current = el
      }}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        // Do not auto-commit on blur (caused instant-save/close issues).
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          cancel()
        }
      }}
      className={cn('w-full rounded-md border border-border bg-background px-2 py-1 outline-none ring-ring focus:ring-1', className)}
    />
    </div>
  )
}
