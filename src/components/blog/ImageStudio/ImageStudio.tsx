'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
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
  const [history, setHistory] = useState<HistoryEntry[]>(
    currentUrl ? [{ url: currentUrl, provider: 'ideogram', timestamp: Date.now() }] : []
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [photopeaOpen, setPhotopeaOpen] = useState(false)

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
    setHistory((prev) => [
      { url, provider: source, timestamp: Date.now() },
      ...prev.filter((item) => item.url !== url),
    ])
  }

  const onGenerate = async () => {
    setIsGenerating(true)
    try {
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
      if (!error && data?.new_url) addToHistory(data.new_url, provider)
    } finally {
      setIsGenerating(false)
    }
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
    try {
      const { data } = await useStockPhoto({ post_id: blogId, image_number: imageNumber, image_url: url })
      if (data?.new_url) addToHistory(data.new_url, 'stock')
    } finally {
      setIsGenerating(false)
    }
  }

  const onApply = async () => {
    setIsApplying(true)
    try {
      await onImageApplied?.()
    } finally {
      setIsApplying(false)
      onClose()
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} zClass="z-[60]">
        <div className="flex w-[min(1100px,95vw)] max-h-[85vh] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-base font-semibold">🎨 Image Studio</h2>
            <div className="flex items-center gap-2">
              {editableImageUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => setPhotopeaOpen(true)}
                >
                  <Pencil className="h-3 w-3" /> Edit in Photopea
                </Button>
              )}
              <button
                onClick={onClose}
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body — two panels */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left: Preview */}
            <div className="flex w-[55%] shrink-0 p-4">
              <ImagePreviewPanel
                imageUrl={selectedUrl}
                provider={provider}
                isGenerating={isGenerating}
              />
            </div>

            {/* Right: Controls */}
            <div className="flex w-[45%] flex-col border-l border-border">
              <div className="flex-1 overflow-y-auto p-4">
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
          </div>

          {/* Footer: History + Actions */}
          <ImageHistory
            items={history}
            activeUrl={selectedUrl}
            onSelect={setSelectedUrl}
            onApply={onApply}
            onCancel={onClose}
            applying={isApplying}
          />
        </div>
      </Modal>

      {editableImageUrl && (
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
      )}
    </>
  )
}
