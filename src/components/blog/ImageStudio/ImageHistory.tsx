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

const PROVIDER_SHORT: Record<string, string> = {
  ideogram: 'IDG',
  'gpt-image': 'GPT',
  'nano-banana': 'NAN',
  imagen: 'IMG',
  stock: 'STK',
  upload: 'UPL',
  photopea: 'PEA',
}

export function ImageHistory({ items, activeUrl, onSelect, onApply, onCancel, applying = false }: Props) {
  return (
    <div className="shrink-0 border-t border-border px-5 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto min-w-0 flex-1">
          {items.length > 0 && (
            <span className="text-[11px] text-muted-foreground shrink-0 mr-1">History</span>
          )}
          {items.map((item, i) => (
            <button
              key={`${item.timestamp}-${i}`}
              type="button"
              onClick={() => onSelect(item.url)}
              title={`${PROVIDER_SHORT[item.provider] ?? item.provider} · ${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              className={`relative h-10 w-10 shrink-0 overflow-hidden rounded border-2 transition-all ${
                activeUrl === item.url
                  ? 'border-primary ring-1 ring-primary/30'
                  : 'border-border hover:border-foreground/30'
              }`}
            >
              <img src={item.url} alt="" className="h-full w-full object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-white text-center leading-tight py-px">
                {PROVIDER_SHORT[item.provider] ?? '?'}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={onApply} disabled={!activeUrl || applying} className="text-xs">
            {applying ? 'Applying…' : 'Apply'}
          </Button>
        </div>
      </div>
    </div>
  )
}
