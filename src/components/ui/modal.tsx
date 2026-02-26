'use client'

/**
 * Modal — always renders via portal to document.body.
 * Use this for ALL modals/overlays to avoid stacking context issues.
 *
 * Usage:
 *   <Modal open={isOpen} onClose={() => setIsOpen(false)}>
 *     <div className="bg-background rounded-lg p-6 w-full max-w-md">
 *       ...content...
 *     </div>
 *   </Modal>
 */

import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose?: () => void
  children: ReactNode
  /** z-index class, default z-50 */
  zClass?: string
  /** Overlay bg class, default bg-black/50 */
  overlayClass?: string
  /** Close on overlay click, default true */
  closeOnOverlay?: boolean
  /** Close on Escape key, default true */
  closeOnEscape?: boolean
}

export function Modal({
  open,
  onClose,
  children,
  zClass = 'z-50',
  overlayClass = 'bg-black/50',
  closeOnOverlay = true,
  closeOnEscape = true,
}: ModalProps) {
  useEffect(() => {
    if (!open || !closeOnEscape || !onClose) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, closeOnEscape, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={`fixed inset-0 ${zClass} flex items-center justify-center ${overlayClass} p-4`}
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  )
}
