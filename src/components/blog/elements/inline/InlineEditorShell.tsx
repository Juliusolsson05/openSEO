'use client'

import { type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { SaveStatus } from '@/types/common'
import { SaveIndicator } from './SaveIndicator'

interface InlineEditorShellProps {
  title?: string
  isDirty: boolean
  status: SaveStatus
  error?: string | null
  onSave: () => void | Promise<void>
  onCancel: () => void
  children: ReactNode
}

export function InlineEditorShell({
  title,
  isDirty,
  status,
  error,
  onSave,
  onCancel,
  children,
}: InlineEditorShellProps) {
  return (
    <div className="rounded border border-primary/30 bg-primary-light/30 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {title ? <p className="text-[12px] font-semibold text-foreground">{title}</p> : null}
          <SaveIndicator status={status} />
          {error ? <p className="text-[11px] text-destructive mt-1">{error}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" data-inline-editor-action="true" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" size="sm" data-inline-editor-action="true" onClick={() => void onSave()} disabled={!isDirty || status === 'saving'}>
            Save
          </Button>
        </div>
      </div>

      {children}
    </div>
  )
}
