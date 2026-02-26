'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePexelsSearchQuery } from '@/hooks/queries/images'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface PexelsImage { id: number; photographer: string; src: { original: string; large: string; medium: string } }
interface SearchImagesResponse { page: number; per_page: number; total_results: number; images: PexelsImage[] }
interface Props { modelValue: boolean; initialSearchTerm?: string; onOpenChange: (open: boolean) => void; onImageSelected: (imageUrl: string) => void }

export default function PexelsImageSearch({ modelValue, initialSearchTerm = '', onOpenChange, onImageSelected }: Props) {
  const [searchQuery, setSearchQuery] = useState(initialSearchTerm)
  const [activeQuery, setActiveQuery] = useState(initialSearchTerm)
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 12
  const [selectedImage, setSelectedImage] = useState<PexelsImage | null>(null)
  const [imageDialog, setImageDialog] = useState(false)

  const { data: searchData, isFetching: isLoading } = usePexelsSearchQuery(activeQuery, currentPage, perPage, {
    enabled: !!activeQuery.trim() && modelValue,
  })

  const images = searchData?.images ?? []
  const totalResults = searchData?.total_results ?? 0
  const hasSearched = !!activeQuery.trim()

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalResults / perPage)), [totalResults, perPage])

  const searchImages = (page = 1) => {
    if (!searchQuery.trim()) return
    setCurrentPage(page)
    setActiveQuery(searchQuery)
  }

  useEffect(() => {
    if (modelValue && initialSearchTerm) {
      setSearchQuery(initialSearchTerm)
      setActiveQuery(initialSearchTerm)
      setCurrentPage(1)
    }
  }, [modelValue, initialSearchTerm])

  return (
    <Dialog open={modelValue} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-5xl overflow-y-auto p-0">
        <VisuallyHidden><DialogTitle>Stock Photo Search</DialogTitle></VisuallyHidden>
        <Card className="border-0 shadow-none">
          <CardHeader className="flex-row items-center justify-between py-3">
            <CardTitle className="text-[14px]">Image Search</CardTitle>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>✕</Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-3 text-[13px]">
            {!hasSearched ? <p className="text-center text-[13px]">Search through millions of stock photos, powered by Pexels.</p> : null}
            <div className="flex gap-2">
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchImages(1)} placeholder="Search for images" disabled={isLoading} />
              <Button onClick={() => searchImages(1)} disabled={isLoading}>Search</Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: perPage }).map((_, i) => <Card key={i} className="p-2"><Skeleton className="h-[160px] w-full" /><Skeleton className="mt-2 h-4 w-2/3" /></Card>)}</div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {images.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <img src={image.src.medium} alt={image.photographer} className="h-36 w-full cursor-pointer object-cover" onClick={() => { setSelectedImage(image); setImageDialog(true) }} />
                    <CardContent className="p-2"><p className="truncate text-[12px]">{image.photographer}</p><Button className="mt-2 w-full" onClick={() => { onImageSelected(image.src.original); onOpenChange(false) }}>Use</Button></CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && hasSearched && images.length === 0 ? <p className="text-center text-[13px]">No images found. Try a different search term.</p> : null}
            {totalResults > 0 ? <div className="flex flex-wrap items-center justify-center gap-2"><Button variant="outline" disabled={currentPage <= 1 || isLoading} onClick={() => searchImages(currentPage - 1)}>Previous</Button><span className="text-[12px]">Page {currentPage} / {totalPages}</span><Button variant="outline" disabled={currentPage >= totalPages || isLoading} onClick={() => searchImages(currentPage + 1)}>Next</Button></div> : null}
          </CardContent>
        </Card>

        <Dialog open={imageDialog} onOpenChange={setImageDialog}>
          <DialogContent className="w-full max-w-4xl p-0">
            <VisuallyHidden><DialogTitle>Image Preview</DialogTitle></VisuallyHidden>
            {selectedImage ? (
              <Card className="border-0 shadow-none">
                <img src={selectedImage.src.large} alt={selectedImage.photographer} className="max-h-[70vh] w-full object-contain" />
                <CardContent className="flex items-center justify-between p-4"><p className="text-[13px]">{selectedImage.photographer}</p><Button onClick={() => { onImageSelected(selectedImage.src.original); setImageDialog(false); onOpenChange(false) }}>Use This Image</Button></CardContent>
              </Card>
            ) : null}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
