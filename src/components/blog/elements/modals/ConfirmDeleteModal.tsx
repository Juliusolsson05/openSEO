'use client'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  loading: boolean
}

export function ConfirmDeleteModal({ open, onOpenChange, onConfirm, loading }: Props) {
  return (
    <Modal open={open} onClose={() => onOpenChange(false)}>
      <div className="bg-background rounded-lg shadow-lg w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold mb-2">Confirm Delete</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete this element?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
