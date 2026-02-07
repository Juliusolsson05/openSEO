'use client'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEnhance: () => void
  loading: boolean
}

export function EnhanceModal({ open, onOpenChange, onEnhance, loading }: Props) {
  return (
    <Modal open={open} onClose={() => onOpenChange(false)}>
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
    </Modal>
  )
}
