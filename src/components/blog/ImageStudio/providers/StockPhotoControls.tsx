'use client'

import { useEffect, useState } from 'react'
import { searchStockPhotos, type PexelsImage } from '@/lib/blog/images'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface Props {
  onSelect: (url: string) => void
  initialQuery?: string
}

const ORIENTATIONS: Array<{ key: 'all' | 'landscape' | 'portrait' | 'square'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'landscape', label: 'Landscape' },
  { key: 'portrait', label: 'Portrait' },
  { key: 'square', label: 'Square' },
]

const COLOR_PRESETS = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']
const SUGGESTIONS = ['Nature', 'Technology', 'Business', 'Abstract']

export function StockPhotoControls({ onSelect, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [images, setImages] = useState<PexelsImage[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [orientation, setOrientation] = useState<'all' | 'landscape' | 'portrait' | 'square'>('all')
  const [color, setColor] = useState<string>('')
  const perPage = 9

  const doSearch = async (p = 1, queryValue?: string) => {
    const term = (queryValue ?? query).trim()
    if (!term) return
    setLoading(true)
    setSelected(null)
    try {
      const data = await searchStockPhotos(
        term,
        p,
        perPage,
        orientation === 'all' ? undefined : orientation,
        color || undefined,
      )
      setImages(data?.images ?? [])
      setTotalResults(data?.total_results ?? 0)
      setPage(p)
    } catch {
      setImages([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery.trim()) doSearch(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (query.trim()) doSearch(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation, color])

  const totalPages = Math.ceil(totalResults / perPage)

  return (
    <div className="space-y-3">
      <form onSubmit={(e) => { e.preventDefault(); doSearch(1) }} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            placeholder="Search free photos…"
          />
        </div>
        <Button type="submit" size="sm" disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Search'}
        </Button>
      </form>

      <div className="space-y-2 rounded-md border border-border bg-muted/20 p-2.5">
        <div className="flex flex-wrap gap-1.5">
          {ORIENTATIONS.map((item) => (
            <Button
              key={item.key}
              type="button"
              size="sm"
              variant={orientation === item.key ? 'default' : 'outline'}
              className="h-7 text-xs"
              onClick={() => {
                setOrientation(item.key)
                setPage(1)
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] text-muted-foreground">Color</span>
          <button
            type="button"
            onClick={() => setColor('')}
            className={`h-6 rounded border px-2 text-[10px] ${!color ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}
          >
            Any
          </button>
          {COLOR_PRESETS.map((hex) => (
            <button
              key={hex}
              type="button"
              title={hex}
              onClick={() => setColor(hex.replace('#', ''))}
              className={`h-6 w-6 rounded border ${color === hex.replace('#', '') ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {loading && images.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : images.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  setSelected(img.src.original)
                  onSelect(img.src.original)
                }}
                className={`group relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                  selected === img.src.original ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-border'
                }`}
              >
                <img src={img.src.large || img.src.medium} alt={img.photographer} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                  <span className="block truncate text-[10px] text-white">📸 {img.photographer}</span>
                  <span className="block text-[10px] text-white/90">{img.width && img.height ? `${img.width}×${img.height}` : 'Unknown size'}</span>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => doSearch(page - 1)} className="h-7 gap-1 text-xs">
                <ChevronLeft className="h-3 w-3" /> Prev
              </Button>
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages} · {totalResults.toLocaleString()} photos</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => doSearch(page + 1)} className="h-7 gap-1 text-xs">
                Next <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Photos provided by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline">Pexels</a>
          </p>
        </>
      ) : totalResults === 0 && !loading && query.trim() ? (
        <div className="space-y-2 py-6 text-center text-sm text-muted-foreground">
          <p>No photos found for &quot;{query}&quot;</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {SUGGESTIONS.map((item) => (
              <Button
                key={item}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setQuery(item)
                  doSearch(1, item)
                }}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
