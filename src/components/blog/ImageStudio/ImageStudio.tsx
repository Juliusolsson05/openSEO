'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { regenerateBlogImage, uploadBlogPostImage, useStockPhoto } from '@/lib/blog/images'
import { ImageControlPanel } from './ImageControlPanel'
import { ImagePreviewPanel } from './ImagePreviewPanel'
import { ImageHistory } from './ImageHistory'
import { PhotopeaEditor } from './PhotopeaEditor'
import type { HistoryEntry, ImageStudioProvider } from './types'

interface Props {
  open: boolean
  onClose: () => void
  blogId: number
  imageNumber: number
  currentUrl?: string
  currentDescription?: string
  postTitle?: string
  onImageApplied?: () => Promise<void> | void
}

export function ImageStudio({
  open,
  onClose,
  blogId,
  imageNumber,
  currentUrl,
  currentDescription = '',
  postTitle = '',
  onImageApplied,
}: Props) {
  const [provider, setProvider] = useState<ImageStudioProvider>('ideogram')
  const [prompt, setPrompt] = useState(currentDescription)
  const [ideogramQuality, setIdeogramQuality] = useState<1 | 2 | 3>(2)
  const [magicPrompt, setMagicPrompt] = useState(true)
  const [gptQuality, setGptQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [gptSize, setGptSize] = useState<'1024x1024' | '1536x1024' | '1024x1536' | 'auto'>('auto')
  const [gptBackground, setGptBackground] = useState<'auto' | 'transparent' | 'opaque'>('auto')
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentUrl ?? null)
  const [history, setHistory] = useState<HistoryEntry[]>(currentUrl ? [{ url: currentUrl, provider: 'ideogram', timestamp: Date.now() }] : [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [photopeaOpen, setPhotopeaOpen] = useState(false)

  const providerLabel = useMemo(() => provider, [provider])
  const editableImageUrl = selectedUrl ?? currentUrl ?? null

  useEffect(() => {
    if (!open) return
    setPrompt(currentDescription)
    setSelectedUrl(currentUrl ?? null)
    setHistory(currentUrl ? [{ url: currentUrl, provider: 'ideogram', timestamp: Date.now() }] : [])
    setPhotopeaOpen(false)
  }, [open, currentDescription, currentUrl])

  const addToHistory = (url: string, source: ImageStudioProvider) => {
    setSelectedUrl(url)
    setHistory((prev) => [{ url, provider: source, timestamp: Date.now() }, ...prev.filter((item) => item.url !== url)])
  }

  const onGenerate = async () => {
    setIsGenerating(true)
    const { data, error } = await regenerateBlogImage({
      post_id: blogId,
      image_number: imageNumber,
      force_prompt: prompt,
      provider: provider === 'gpt-image' ? 'gpt-image' : 'ideogram',
      version: ideogramQuality,
      magic_prompt: magicPrompt,
      gpt_quality: gptQuality,
      gpt_size: gptSize,
      gpt_background: gptBackground,
      gpt_output_format: 'png',
    })
    setIsGenerating(false)

    if (error || !data?.new_url) return
    addToHistory(data.new_url, provider)
  }

  const onUploadSelect = async (file: File) => {
    setIsGenerating(true)
    try {
      const data = await uploadBlogPostImage({ post_id: blogId, image_number: imageNumber, image: file })
      if (data?.new_url) addToHistory(data.new_url, 'upload')
    } finally {
      setIsGenerating(false)
    }
  }

  const onStockSelect = async (url: string) => {
    setIsGenerating(true)
    const { data } = await useStockPhoto({ post_id: blogId, image_number: imageNumber, image_url: url })
    setIsGenerating(false)
    if (data?.new_url) addToHistory(data.new_url, 'stock')
  }

  const onApply = async () => {
    setIsApplying(true)
    await onImageApplied?.()
    setIsApplying(false)
    onClose()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
        <DialogContent className="w-[min(1100px,95vw)] max-w-none max-h-[85vh] overflow-hidden rounded-lg border border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Image Studio</h2>
            <div className="flex items-center gap-2">
              {editableImageUrl ? (
                <button onClick={() => setPhotopeaOpen(true)} className="rounded border border-border px-2 py-1 text-sm">
                  ✏️ Edit in Photopea
                </button>
              ) : null}
              <button onClick={onClose} className="rounded border border-border px-2 py-1 text-sm">✕</button>
            </div>
          </div>

          <div className="grid h-[60vh] grid-cols-1 gap-4 md:grid-cols-[55%_45%]">
            <ImagePreviewPanel imageUrl={selectedUrl} provider={providerLabel} isGenerating={isGenerating} />
            <div className="overflow-y-auto pr-1">
              <ImageControlPanel
                provider={provider}
                setProvider={setProvider}
                prompt={prompt}
                setPrompt={setPrompt}
                postTitle={postTitle}
                currentDescription={currentDescription}
                ideogramQuality={ideogramQuality}
                setIdeogramQuality={setIdeogramQuality}
                magicPrompt={magicPrompt}
                setMagicPrompt={setMagicPrompt}
                gptQuality={gptQuality}
                setGptQuality={setGptQuality}
                gptSize={gptSize}
                setGptSize={setGptSize}
                gptBackground={gptBackground}
                setGptBackground={setGptBackground}
                onGenerate={onGenerate}
                isGenerating={isGenerating}
                onStockSelect={onStockSelect}
                onUploadSelect={onUploadSelect}
                currentImageUrl={editableImageUrl}
                onOpenPhotopea={() => setPhotopeaOpen(true)}
              />
            </div>
          </div>

          <ImageHistory items={history} activeUrl={selectedUrl} onSelect={setSelectedUrl} onApply={onApply} onCancel={onClose} applying={isApplying} />
        </DialogContent>
      </Dialog>

      {editableImageUrl ? (
        <PhotopeaEditor
          open={photopeaOpen}
          onClose={() => setPhotopeaOpen(false)}
          imageUrl={editableImageUrl}
          blogId={blogId}
          imageNumber={imageNumber}
          onSaved={(newUrl) => {
            addToHistory(newUrl, 'photopea')
            setPhotopeaOpen(false)
          }}
        />
      ) : null}
    </>
  )
}
