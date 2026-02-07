'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  loading: boolean
}

export function ConfirmDeleteModal({ open, onOpenChange, onConfirm, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>Are you sure you want to delete this element?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
