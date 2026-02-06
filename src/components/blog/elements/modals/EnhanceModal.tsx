'use client'

import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEnhance: () => void
  loading: boolean
}

export function EnhanceModal({ open, onOpenChange, onEnhance, loading }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold mb-2">Enhance Content</h2>
        <p className="text-sm text-muted-foreground mb-6">
          AI will improve this element&apos;s content quality and readability.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onEnhance} disabled={loading}>
            {loading ? 'Enhancing...' : 'Enhance'}
          </Button>
        </div>
      </div>
    </div>
  )
}
