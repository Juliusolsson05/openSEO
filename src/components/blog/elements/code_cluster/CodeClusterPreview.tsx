'use client'

import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'

export function CodeClusterPreview({ content }: PreviewComponentProps) {
  return (
    <BasePreview content={content}>
      <div className="cursor-pointer transition-all duration-300 ease-in-out">
        <div className="mb-[15px] rounded border-2 border-destructive bg-destructive/10 p-[15px]">
          <h3 className="mb-3 text-xl font-semibold text-destructive">Unfilled Code Cluster</h3>
          <p className="font-medium text-destructive">Content will be available soon.</p>
        </div>
      </div>
    </BasePreview>
  )
}
