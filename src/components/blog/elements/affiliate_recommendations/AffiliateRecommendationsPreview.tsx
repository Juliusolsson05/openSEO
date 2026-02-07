'use client'

import type { PreviewComponentProps } from '../registry'

export function AffiliateRecommendationsPreview({ content }: PreviewComponentProps) {
  const title = content?.title || 'Recommended Products'
  const items = Array.isArray(content?.items) ? content.items : content?.recommendations ?? []

  return (
    <div className="space-y-2">
      {title && <h3 className="text-[14px] font-semibold">{title}</h3>}
      {items.map((item: any, i: number) => (
        <div key={i} className="p-2 bg-secondary/40 rounded text-[12px]">
          <span className="font-medium">{item.name}</span>
          {item.price && <span className="ml-2 text-primary">{item.price}</span>}
        </div>
      ))}
    </div>
  )
}
