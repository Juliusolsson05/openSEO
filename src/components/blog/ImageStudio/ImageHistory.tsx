'use client'

import type { HistoryEntry } from './types'

interface Props {
  items: HistoryEntry[]
  activeUrl: string | null
  onSelect: (url: string) => void
  onApply: () => void
  onCancel: () => void
  applying?: boolean
}

export function ImageHistory({ items, activeUrl, onSelect, onApply, onCancel, applying = false }: Props) {
  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {items.map((item) => (
          <button key={`${item.url}-${item.timestamp}`} type="button" onClick={() => onSelect(item.url)} className={`h-12 w-12 shrink-0 overflow-hidden rounded border ${activeUrl === item.url ? 'ring-2 ring-primary' : ''}`}>
            <img src={item.url} alt={item.provider} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded border border-border px-3 py-1 text-sm">Cancel</button>
        <button type="button" onClick={onApply} disabled={!activeUrl || applying} className="rounded bg-primary px-3 py-1 text-sm text-white disabled:opacity-60">{applying ? 'Applying...' : 'Apply'}</button>
      </div>
    </div>
  )
}
