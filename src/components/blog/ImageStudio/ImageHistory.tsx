'use client'

import type { HistoryEntry } from './types'
import { Button } from '@/components/ui/button'

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
          <Button key={`${item.url}-${item.timestamp}`} type="button" variant="outline" size="icon" onClick={() => onSelect(item.url)} className={`h-12 w-12 shrink-0 overflow-hidden p-0 ${activeUrl === item.url ? 'ring-2 ring-primary' : ''}`}>
            <img src={item.url} alt={item.provider} className="h-full w-full object-cover" />
          </Button>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="button" size="sm" onClick={onApply} disabled={!activeUrl || applying}>{applying ? 'Applying...' : 'Apply'}</Button>
      </div>
    </div>
  )
}
