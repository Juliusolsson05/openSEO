import { useCallback, useEffect, useState } from 'react'
import { regenerateBlogImage, uploadBlogPostImage, useStockPhoto } from '@/lib/blog/images'
import type { HistoryEntry, ImageStudioProvider } from './types'

interface Options {
  open: boolean
  blogId: number
  imageNumber: number
  currentUrl?: string
  currentDescription?: string
  postTitle?: string
  /** Called once the user confirms Apply. Receives the URL that was applied
   *  (this is the currently selected preview URL, i.e. editableImageUrl). */
  onImageApplied?: (newUrl: string) => Promise<void> | void
  onClose: () => void
}

export function useImageStudioState(opts: Options) {
  const { open, blogId, imageNumber, currentUrl, currentDescription = '', postTitle = '', onImageApplied, onClose } = opts

  const [provider, setProvider] = useState<ImageStudioProvider>('ideogram')

  const [prompt, setPrompt] = useState(currentDescription)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentUrl ?? null)
  const [history, setHistory] = useState<HistoryEntry[]>(
    currentUrl ? [{ url: currentUrl, provider: 'ideogram', timestamp: Date.now() }] : [],
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [photopeaOpen, setPhotopeaOpen] = useState(false)

  const [ideogramQuality, setIdeogramQuality] = useState<1 | 2 | 3>(2)
  const [magicPrompt, setMagicPrompt] = useState(true)

  const [gptQuality, setGptQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [gptSize, setGptSize] = useState<'1024x1024' | '1536x1024' | '1024x1536' | 'auto'>('auto')
  const [gptBackground, setGptBackground] = useState<'auto' | 'transparent' | 'opaque'>('auto')

  const [nanoModel, setNanoModel] = useState<'flash' | 'pro'>('flash')
  const [nanoAspectRatio, setNanoAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('16:9')

  const [imagenAspectRatio, setImagenAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('16:9')

  const editableImageUrl = selectedUrl ?? currentUrl ?? null

  useEffect(() => {
    if (!open) return
    setPrompt(currentDescription)
    setSelectedUrl(currentUrl ?? null)
    setHistory(currentUrl ? [{ url: currentUrl, provider: 'ideogram', timestamp: Date.now() }] : [])
    setPhotopeaOpen(false)
  }, [open, currentDescription, currentUrl])

  const addToHistory = useCallback((url: string, source: ImageStudioProvider) => {
    setSelectedUrl(url)
    setHistory((prev) => [
      { url, provider: source, timestamp: Date.now() },
      ...prev.filter((item) => item.url !== url),
    ])
  }, [])

  const onGenerate = useCallback(async () => {
    setIsGenerating(true)
    try {
      const data = await regenerateBlogImage({
        post_id: blogId,
        image_number: imageNumber,
        force_prompt: prompt,
        provider: provider === 'gpt-image' ? 'gpt-image' : provider === 'nano-banana' ? 'nano-banana' : provider === 'imagen' ? 'imagen' : 'ideogram',
        version: ideogramQuality,
        magic_prompt: magicPrompt,
        gpt_quality: gptQuality,
        gpt_size: gptSize,
        gpt_background: gptBackground,
        gpt_output_format: 'png',
        nano_model: nanoModel,
        aspect_ratio: provider === 'nano-banana' ? nanoAspectRatio : provider === 'imagen' ? imagenAspectRatio : undefined,
      })
      if (data?.new_url) addToHistory(data.new_url, provider)
    } catch {
      // ignore — UI stays in current state
    } finally {
      setIsGenerating(false)
    }
  }, [blogId, imageNumber, prompt, provider, ideogramQuality, magicPrompt, gptQuality, gptSize, gptBackground, nanoModel, nanoAspectRatio, imagenAspectRatio, addToHistory])

  const onUploadSelect = useCallback(async (file: File) => {
    setIsGenerating(true)
    try {
      const data = await uploadBlogPostImage({ post_id: blogId, image_number: imageNumber, image: file })
      if (data?.new_url) addToHistory(data.new_url, 'upload')
    } finally {
      setIsGenerating(false)
    }
  }, [blogId, imageNumber, addToHistory])

  const onStockSelect = useCallback(async (url: string) => {
    setIsGenerating(true)
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- useStockPhoto is not a hook, it's a plain async function
      const data = await useStockPhoto({ post_id: blogId, image_number: imageNumber, image_url: url })
      if (data?.new_url) addToHistory(data.new_url, 'stock')
    } catch {
      // ignore — UI stays in current state
    } finally {
      setIsGenerating(false)
    }
  }, [blogId, imageNumber, addToHistory])

  const onApply = useCallback(async () => {
    const appliedUrl = editableImageUrl
    if (!appliedUrl) {
      onClose()
      return
    }
    setIsApplying(true)
    try {
      await onImageApplied?.(appliedUrl)
    } finally {
      setIsApplying(false)
      onClose()
    }
  }, [editableImageUrl, onImageApplied, onClose])

  return {
    provider, setProvider,
    prompt, setPrompt,
    selectedUrl, setSelectedUrl,
    history,
    isGenerating, isApplying,
    editableImageUrl,
    photopeaOpen, setPhotopeaOpen,
    ideogramQuality, setIdeogramQuality,
    magicPrompt, setMagicPrompt,
    gptQuality, setGptQuality,
    gptSize, setGptSize,
    gptBackground, setGptBackground,
    nanoModel, setNanoModel,
    nanoAspectRatio, setNanoAspectRatio,
    imagenAspectRatio, setImagenAspectRatio,
    onGenerate, onUploadSelect, onStockSelect, onApply,
    addToHistory,
    postTitle, currentDescription,
  }
}
