'use client'

import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Eye, EyeOff, Loader2, Sparkles, Upload, Image as ImageIcon, Type } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { useBlogStore } from '@/stores/blog-store'
import PexelsImageSearch from '@/components/blog/PexelsImageSearch'
import { regenerateBlogImage, uploadBlogPostImage, useStockPhoto } from '@/lib/blog/images'

type ImageContent = {
  url?: string
  description?: string
  image_number?: number
}

type LoadingAction = 'standard' | 'high' | 'custom' | 'title' | 'upload' | 'stock' | null
type PromptMode = 'custom' | 'title'

type ToastMessage = {
  id: number
  type: 'success' | 'error'
  text: string
}

const DEFAULT_IMAGE = 'https://via.placeholder.com/800x400?text=No+Image'

const resolveImageUrl = (url?: string) => {
  if (!url) return DEFAULT_IMAGE
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedPath = url.startsWith('/') ? url : `/${url}`

  return `${normalizedBase}${normalizedPath}`
}

export function ImageElement({ content, blogId, elementId, onContentUpdated, onElementDeleted, onElementAdded }: ElementComponentProps) {
  const parsedContent = (content ?? {}) as ImageContent
  const [imageUrl, setImageUrl] = useState(parsedContent.url)
  const [showControls, setShowControls] = useState(true)
  const [magicPrompt, setMagicPrompt] = useState(true)
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [promptMode, setPromptMode] = useState<PromptMode>('custom')
  const [customPrompt, setCustomPrompt] = useState('')
  const [modalQuality, setModalQuality] = useState<1 | 2 | 3>(2)
  const [showImageSearch, setShowImageSearch] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const post = useBlogStore((s) => s.post)
  const fetchPost = useBlogStore((s) => s.fetchPost)

  const imageNumber = useMemo(() => {
    if (typeof parsedContent.image_number === 'number') return parsedContent.image_number
    if (!post?.elements?.length) return 1

    const imageElements = post.elements.filter((element) => element.element_type === 'image')
    const index = imageElements.findIndex((element) => element.id === elementId)
    return index >= 0 ? index + 1 : 1
  }, [elementId, parsedContent.image_number, post?.elements])

  const postTitle = post?.title_text || ''
  const src = resolveImageUrl(imageUrl)
  const alt = parsedContent.description || 'Blog image'
  const isAnyLoading = loadingAction !== null

  const addToast = (type: 'success' | 'error', text: string) => {
    const id = Date.now() + Math.round(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, type, text }])
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3000)
  }

  const applyNewImageUrl = async (newUrl: string) => {
    setImageUrl(newUrl)
    onContentUpdated?.({ ...parsedContent, url: newUrl })
    if (post?.id) {
      await fetchPost(post.id, true)
    }
  }

  const handleRegenerate = async (quality: number, forcePrompt?: string, action: LoadingAction = 'standard') => {
    if (!post?.id) return

    setLoadingAction(action)
    try {
      const { data, error } = await regenerateBlogImage({
        post_id: post.id,
        image_number: imageNumber,
        version: quality,
        magic_prompt: magicPrompt,
        force_prompt: forcePrompt,
      })

      if (error) throw error
      if (!data?.new_url) throw new Error('No image URL returned')

      await applyNewImageUrl(data.new_url)
      addToast('success', 'Image generated successfully.')
    } catch {
      addToast('error', 'Failed to generate image.')
    } finally {
      setLoadingAction(null)
    }
  }

  const openPromptModal = (mode: PromptMode) => {
    setPromptMode(mode)
    if (mode === 'custom') setCustomPrompt('')
    setModalQuality(2)
    setShowPromptModal(true)
  }

  const submitPrompt = async () => {
    if (promptMode === 'custom' && !customPrompt.trim()) {
      addToast('error', 'Custom prompt cannot be empty.')
      return
    }

    const forcePrompt = promptMode === 'title' ? postTitle : customPrompt.trim()
    const action = promptMode === 'title' ? 'title' : 'custom'
    setShowPromptModal(false)
    await handleRegenerate(modalQuality, forcePrompt, action)
  }

  const triggerImageUpload = () => fileInputRef.current?.click()

  const onFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!post?.id) return

    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setLoadingAction('upload')
    try {
      const data = await uploadBlogPostImage({
        post_id: post.id,
        image_number: imageNumber,
        image: file,
      })

      if (!data?.new_url) throw new Error('No image URL returned')

      await applyNewImageUrl(data.new_url)
      addToast('success', 'Image uploaded successfully.')
    } catch {
      addToast('error', 'Failed to upload image.')
    } finally {
      setLoadingAction(null)
    }
  }

  const onStockImageSelected = async (selectedImageUrl: string) => {
    if (!post?.id) return

    setLoadingAction('stock')
    try {
      const { data, error } = await useStockPhoto({
        post_id: post.id,
        image_number: imageNumber,
        image_url: selectedImageUrl,
      })
      if (error) throw error
      if (!data?.new_url) throw new Error('No image URL returned')

      await applyNewImageUrl(data.new_url)
      addToast('success', 'Stock photo applied successfully.')
      setShowImageSearch(false)
    } catch {
      addToast('error', 'Failed to apply stock photo.')
    } finally {
      setLoadingAction(null)
    }
  }

  const buttonClass = 'inline-flex h-8 items-center gap-1 rounded-[3px] border border-[#E1E1E1] bg-white/70 px-2 text-[12px] text-black disabled:cursor-not-allowed disabled:opacity-60'
  const activeButtonClass = 'border-[#0078D4] bg-[#0078D4] text-white'

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      allowRegenerate={false}
      allowEnhance={false}
      allowHumanize={false}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
      onElementAdded={onElementAdded}
    >
      <div className="relative my-8 h-[400px] w-full overflow-hidden rounded-[4px] border border-[#E1E1E1]" style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }} role="img" aria-label={alt}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelected} className="hidden" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <button className={buttonClass} onClick={() => setShowControls((prev) => !prev)} disabled={isAnyLoading}>
            {showControls ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          {showControls ? (
            <label className="inline-flex h-8 items-center gap-2 rounded-[3px] border border-[#E1E1E1] bg-white/70 px-2 text-[12px]">
              <input type="checkbox" checked={magicPrompt} onChange={(e) => setMagicPrompt(e.target.checked)} disabled={isAnyLoading} />
              Magic Prompt
            </label>
          ) : null}
        </div>

        {showControls ? (
          <>
            <div className="absolute right-3 top-3 flex gap-2">
              <button className={`${buttonClass} ${loadingAction === 'high' ? activeButtonClass : ''}`} onClick={() => handleRegenerate(2, undefined, 'high')} disabled={isAnyLoading}>
                {loadingAction === 'high' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                High Quality
              </button>
              <button className={`${buttonClass} ${loadingAction === 'standard' ? activeButtonClass : ''}`} onClick={() => handleRegenerate(1, undefined, 'standard')} disabled={isAnyLoading}>
                {loadingAction === 'standard' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Standard Quality
              </button>
            </div>

            <div className="absolute bottom-3 right-3 flex flex-wrap justify-end gap-2">
              <button className={buttonClass} onClick={() => openPromptModal('custom')} disabled={isAnyLoading}>
                {loadingAction === 'custom' ? <Loader2 size={14} className="animate-spin" /> : <Type size={14} />}
                Custom Prompt
              </button>
              <button className={buttonClass} onClick={triggerImageUpload} disabled={isAnyLoading}>
                {loadingAction === 'upload' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Upload
              </button>
              <button className={buttonClass} onClick={() => setShowImageSearch(true)} disabled={isAnyLoading}>
                {loadingAction === 'stock' ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                Stock
              </button>
              <button className={buttonClass} onClick={() => openPromptModal('title')} disabled={isAnyLoading || !postTitle}>
                {loadingAction === 'title' ? <Loader2 size={14} className="animate-spin" /> : <Type size={14} />}
                Title Prompt
              </button>
            </div>
          </>
        ) : null}
      </div>

      {showPromptModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[4px] border border-[#E1E1E1] bg-white p-4 text-[13px]">
            <h3 className="mb-3 text-[14px] font-semibold">{promptMode === 'custom' ? 'Custom Prompt' : 'Title Prompt'}</h3>

            {promptMode === 'custom' ? (
              <div className="mb-3">
                <label className="mb-1 block text-[11px] font-semibold uppercase text-[#616161]">Prompt</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={4}
                  className="w-full rounded-[3px] border border-[#E1E1E1] px-2 py-1"
                  placeholder="Describe the image you want"
                />
              </div>
            ) : (
              <div className="mb-3 rounded-[3px] border border-[#E1E1E1] bg-[#F8F8F8] p-2 text-[12px]">Using post title: {postTitle || 'No post title available'}</div>
            )}

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-[#616161]">Quality</label>
              <select
                value={modalQuality}
                onChange={(e) => setModalQuality(Number(e.target.value) as 1 | 2 | 3)}
                className="h-8 w-full rounded-[3px] border border-[#E1E1E1] bg-white px-2"
              >
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-[3px] border border-[#E1E1E1] px-3 py-1.5" onClick={() => setShowPromptModal(false)} disabled={isAnyLoading}>Cancel</button>
              <button className="rounded-[3px] bg-[#0078D4] px-3 py-1.5 text-white disabled:opacity-60" onClick={submitPrompt} disabled={isAnyLoading || (promptMode === 'custom' && !customPrompt.trim())}>
                Generate
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <PexelsImageSearch
        modelValue={showImageSearch}
        initialSearchTerm={postTitle}
        onOpenChange={setShowImageSearch}
        onImageSelected={onStockImageSelected}
      />

      <div className="fixed right-4 top-4 z-[70] space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`rounded-[3px] border px-3 py-2 text-[12px] ${toast.type === 'success' ? 'border-green-300 bg-green-50 text-green-800' : 'border-red-300 bg-red-50 text-red-800'}`}>
            {toast.text}
          </div>
        ))}
      </div>
    </BaseElement>
  )
}
