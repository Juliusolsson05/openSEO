'use client'

/**
 * BasePreview — read-only wrapper for element previews (no action buttons).
 * Ported from aurora_dashboard/views/apps/blog/elements/BasePreview.vue
 */

import type { ReactNode } from 'react'

interface BasePreviewProps {
  content: any
  children: ReactNode
}

export function BasePreview({ children }: BasePreviewProps) {
  return (
    <div className="relative mb-5">
      {children}
    </div>
  )
}
