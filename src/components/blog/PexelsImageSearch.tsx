'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface PexelsImage {
  id: number
  photographer: string
  src: {
    original: string
    large: string
    medium: string
  }
}

interface SearchImagesResponse {
  page: number
  per_page: number
  total_results: number
  images: PexelsImage[]
}

interface Props {
  modelValue: boolean
  initialSearchTerm?: string
  onOpenChange: (open: boolean) => void
  onImageSelected: (imageUrl: string) => void
}

export default function PexelsImageSearch({ modelValue, initialSearchTerm = '', onOpenChange, onImageSelected }: Props) {
  const [searchQuery, setSearchQuery] = useState(initialSearchTerm)
  const [images, setImages] = useState<PexelsImage[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(12)
  const [selectedImage, setSelectedImage] = useState<PexelsImage | null>(null)
  const [imageDialog, setImageDialog] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalResults / perPage)), [totalResults, perPage])

  const searchImages = async (page = 1) => {
    if (!searchQuery.trim()) return
    setIsLoading(true)
    try {
      const { data, error } = await api<SearchImagesResponse>('/api/aurora/blog/images/stock_photos/search', {
        method: 'GET',
        params: {
          query: searchQuery,
          page,
          per_page: perPage,
        },
      })
      if (error) throw error
      setImages(data?.images ?? [])
      setTotalResults(data?.total_results ?? 0)
      setCurrentPage(page)
      setHasSearched(true)
    } catch {
      setImages([])
      setTotalResults(0)
      setHasSearched(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (modelValue && initialSearchTerm) {
      setSearchQuery(initialSearchTerm)
      searchImages(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelValue, initialSearchTerm])

  if (!modelValue) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[4px] border-[#E1E1E1] bg-white">
        <CardHeader className="flex-row items-center justify-between rounded-t-[4px] bg-[#0078D4] py-3 text-white">
          <CardTitle className="text-[14px]">Image Search</CardTitle>
          <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => onOpenChange(false)}>✕</Button>
        </CardHeader>
        <CardContent className="space-y-4 bg-[#F2F2F2] pt-5 text-[13px]">
          {!hasSearched ? <p className="text-center text-[13px]">Search through millions of stock photos, powered by Pexels.</p> : null}

          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchImages(1)}
              placeholder="Search for images"
              disabled={isLoading}
              className="rounded-[3px] border-[#E1E1E1] bg-white"
            />
            <Button onClick={() => searchImages(1)} disabled={isLoading}>Search</Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: perPage }).map((_, i) => (
                <Card key={i} className="rounded-[3px] border-[#E1E1E1] p-2">
                  <Skeleton className="h-[160px] w-full rounded-[3px]" />
                  <Skeleton className="mt-2 h-4 w-2/3" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden rounded-[3px] border-[#E1E1E1]">
                  <img src={image.src.medium} alt={image.photographer} className="h-36 w-full cursor-pointer object-cover" onClick={() => { setSelectedImage(image); setImageDialog(true) }} />
                  <CardContent className="p-2">
                    <p className="truncate text-[12px]">{image.photographer}</p>
                    <Button className="mt-2 w-full" onClick={() => { onImageSelected(image.src.original); onOpenChange(false) }}>Use</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && hasSearched && images.length === 0 ? <p className="text-center text-[13px]">No images found. Try a different search term.</p> : null}

          {totalResults > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" disabled={currentPage <= 1 || isLoading} onClick={() => searchImages(currentPage - 1)}>Previous</Button>
              <span className="text-[12px]">Page {currentPage} / {totalPages}</span>
              <Button variant="outline" disabled={currentPage >= totalPages || isLoading} onClick={() => searchImages(currentPage + 1)}>Next</Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {imageDialog && selectedImage ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setImageDialog(false)}>
          <Card className="w-full max-w-4xl rounded-[4px]" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.src.large} alt={selectedImage.photographer} className="max-h-[70vh] w-full object-contain" />
            <CardContent className="flex items-center justify-between p-4">
              <p className="text-[13px]">{selectedImage.photographer}</p>
              <Button onClick={() => { onImageSelected(selectedImage.src.original); setImageDialog(false); onOpenChange(false) }}>Use This Image</Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
