'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { uploadBlogPostImage } from '@/lib/blog/images'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onClose: () => void
  imageUrl: string
  blogId: number
  imageNumber: number
  onSaved: (newUrl: string) => void
}

export function PhotopeaEditor({ open, onClose, imageUrl, blogId, imageNumber, onSaved }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const resolvedImageUrl = useMemo(() => {
    if (!imageUrl) return ''
    if (typeof window === 'undefined') return imageUrl
    try {
      return new URL(imageUrl, window.location.origin).toString()
    } catch {
      return imageUrl
    }
  }, [imageUrl])

  const iframeSrc = useMemo(() => {
    if (!resolvedImageUrl) return ''

    const config = {
      files: [resolvedImageUrl],
      environment: {
        theme: 2,
        customIO: {
          save: "app.activeDocument.saveToOE('png');",
          exportAs: true,
        },
        localsave: false,
      },
    }

    return `https://www.photopea.com#${encodeURIComponent(JSON.stringify(config))}`
  }, [resolvedImageUrl])

  useEffect(() => {
    if (!open) return
    setIsReady(false)
    setMessage(null)
  }, [open, imageUrl])

  useEffect(() => {
    if (!open) return

    const handler = (e: MessageEvent) => {
      if (e.origin !== 'https://www.photopea.com') return

      if (e.data === 'done') {
        setIsReady(true)
        setIsSaving(false)
        return
      }

      if (e.data instanceof ArrayBuffer) {
        void handleImageSave(e.data)
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [open, blogId, imageNumber])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        triggerSave()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, isReady, isSaving])

  const triggerSave = () => {
    if (!isReady || isSaving) return
    const iframe = iframeRef.current
    if (iframe?.contentWindow) {
      setIsSaving(true)
      iframe.contentWindow.postMessage("app.activeDocument.saveToOE('png');", '*')
    }
  }

  const handleImageSave = async (arrayBuffer: ArrayBuffer) => {
    setIsSaving(true)
    try {
      const file = new File([arrayBuffer], 'edited-image.png', { type: 'image/png' })
      const data = await uploadBlogPostImage({
        post_id: blogId,
        image_number: imageNumber,
        image: file,
      })

      if (data?.new_url) {
        onSaved(data.new_url)
        setMessage('Image saved successfully')
        window.setTimeout(() => {
          onClose()
        }, 400)
      } else {
        setMessage('Could not save image')
      }
    } catch {
      setMessage('Failed to save image')
    } finally {
      setIsSaving(false)
    }
  }

  if (!open || !iframeSrc) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="flex items-center justify-between border-b border-white/20 bg-zinc-900 px-4 py-2 text-white">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">✕</Button>
          <h2 className="text-sm font-semibold">Image Editor</h2>
          <p className="text-xs text-white/70">Click Save or Ctrl+S to save</p>
        </div>
        <Button
          type="button"
          onClick={triggerSave}
          disabled={!isReady || isSaving}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <div className="relative flex-1">
        {!isReady ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950 text-sm text-white/80">
            Loading Photopea…
          </div>
        ) : null}
        <iframe
          ref={iframeRef}
          title="Photopea Editor"
          src={iframeSrc}
          className="h-full w-full"
          allow="clipboard-read; clipboard-write"
        />
      </div>

      {message ? (
        <div className="pointer-events-none absolute right-4 top-14 rounded bg-black/80 px-3 py-2 text-xs text-white">{message}</div>
      ) : null}
    </div>,
    document.body,
  )
}
