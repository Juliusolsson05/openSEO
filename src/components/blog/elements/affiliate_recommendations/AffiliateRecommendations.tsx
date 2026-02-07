'use client'

import type { ElementComponentProps } from '../registry'

interface AffiliateItem {
  name: string
  description?: string
  link?: string
  price?: string
  rating?: number | string
  image_url?: string
}

export function AffiliateRecommendations({ content }: ElementComponentProps) {
  const title = content?.title || 'Recommended Products'
  const items: AffiliateItem[] = Array.isArray(content?.items)
    ? content.items
    : Array.isArray(content?.recommendations)
      ? content.recommendations
      : []

  if (items.length === 0) {
    return (
      <div className="p-4 border border-dashed border-border rounded bg-secondary/30 text-center text-muted-foreground text-sm">
        No affiliate recommendations available.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {title && (
        <h3 className="text-[15px] font-semibold">{title}</h3>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex gap-3 p-3 border border-border rounded-md bg-white hover:shadow-sm transition-shadow"
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-16 h-16 rounded object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate">{item.name}</p>
              {item.description && (
                <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                {item.price && (
                  <span className="text-[12px] font-medium text-primary">
                    {item.price}
                  </span>
                )}
                {item.rating && (
                  <span className="text-[11px] text-muted-foreground">
                    ⭐ {item.rating}
                  </span>
                )}
              </div>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary hover:underline mt-1 inline-block"
                >
                  View →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
