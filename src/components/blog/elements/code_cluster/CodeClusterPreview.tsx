'use client'

import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'

export function CodeClusterPreview({ content }: PreviewComponentProps) {
  return (
    <BasePreview content={content}>
      <div className="cursor-pointer transition-all duration-300 ease-in-out">
        <div className="mb-[15px] rounded border-2 border-[#ef5350] bg-[#ffebee] p-[15px]">
          <h3 className="mb-3 text-xl font-semibold text-[#c62828]">Unfilled Code Cluster</h3>
          <p className="font-medium text-[#b71c1c]">Content will be available soon.</p>
        </div>
      </div>
    </BasePreview>
  )
}
