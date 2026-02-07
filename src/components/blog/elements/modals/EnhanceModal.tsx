'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEnhance: () => void
  loading: boolean
}

export function EnhanceModal({ open, onOpenChange, onEnhance, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>Enhance Content</DialogTitle>
          <DialogDescription>AI will improve this element&apos;s content quality and readability.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={onEnhance} disabled={loading}>{loading ? 'Enhancing...' : 'Enhance'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
