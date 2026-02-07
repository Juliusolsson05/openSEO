'use client'

import { useState, useEffect } from 'react'
import { searchStockPhotos, type PexelsImage } from '@/lib/blog/images'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface Props {
  onSelect: (url: string) => void
  initialQuery?: string
}

export function StockPhotoControls({ onSelect, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [images, setImages] = useState<PexelsImage[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const perPage = 9

  const doSearch = async (p = 1) => {
    if (!query.trim()) return
    setLoading(true)
    setSelected(null)
    try {
      const { data } = await searchStockPhotos(query.trim(), p, perPage)
      setImages(data?.images ?? [])
      setTotalResults(data?.total_results ?? 0)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }

  // Auto-search on mount if there's a query
  useEffect(() => {
    if (initialQuery.trim()) doSearch(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPages = Math.ceil(totalResults / perPage)

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); doSearch(1) }}
        className="flex gap-2"
      >
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

      {/* Results grid */}
      {loading && images.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : images.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  setSelected(img.src.original)
                  onSelect(img.src.original)
                }}
                className={`group relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                  selected === img.src.original
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-transparent hover:border-border'
                }`}
              >
                <img
                  src={img.src.medium}
                  alt={img.photographer}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                  <span className="text-[10px] text-white truncate block">
                    📸 {img.photographer}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => doSearch(page - 1)}
                className="h-7 gap-1 text-xs"
              >
                <ChevronLeft className="h-3 w-3" /> Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages} · {totalResults.toLocaleString()} photos
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => doSearch(page + 1)}
                className="h-7 gap-1 text-xs"
              >
                Next <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Photos provided by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline">Pexels</a>
          </p>
        </>
      ) : totalResults === 0 && !loading && query.trim() ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No photos found for "{query}"
        </div>
      ) : null}
    </div>
  )
}
