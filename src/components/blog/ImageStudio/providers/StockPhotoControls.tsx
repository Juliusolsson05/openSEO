'use client'

import { useState } from 'react'
import { searchStockPhotos, type PexelsImage } from '@/lib/blog/images'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  onSelect: (url: string) => void
  initialQuery?: string
}

export function StockPhotoControls({ onSelect, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [images, setImages] = useState<PexelsImage[]>([])
  const [loading, setLoading] = useState(false)

  const onSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    const { data } = await searchStockPhotos(query, 1, 12)
    setImages(data?.images ?? [])
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded border border-border px-2 py-1 text-sm" placeholder="Search photos" />
        <Button type="button" size="sm" onClick={onSearch}>Search</Button>
      </div>
      {loading ? <div className="text-sm text-muted-foreground">Loading...</div> : null}
      <div className="grid grid-cols-2 gap-2">
        {images.map((img) => (
          <Button key={img.id} type="button" variant="outline" onClick={() => onSelect(img.src.original)} className="h-auto overflow-hidden p-0">
            <img src={img.src.medium} alt={img.photographer} className="h-24 w-full object-cover" />
          </Button>
        ))}
      </div>
    </div>
  )
}
