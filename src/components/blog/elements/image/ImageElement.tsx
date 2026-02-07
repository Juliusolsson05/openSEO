'use client'

import { useMemo, useState } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { useBlogStore } from '@/stores/blog-store'
import { ImageStudio } from '@/components/blog/ImageStudio'
import { Button } from '@/components/ui/button'

type ImageContent = {
  url?: string
  description?: string
  image_number?: number
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
  const [studioOpen, setStudioOpen] = useState(false)
  const post = useBlogStore((s) => s.post)
  const fetchPost = useBlogStore((s) => s.fetchPost)

  const imageNumber = useMemo(() => {
    if (typeof parsedContent.image_number === 'number') return parsedContent.image_number
    if (!post?.elements?.length) return 1

    const imageElements = post.elements.filter((element) => element.element_type === 'image')
    const index = imageElements.findIndex((element) => element.id === elementId)
    return index >= 0 ? index + 1 : 1
  }, [elementId, parsedContent.image_number, post?.elements])

  const src = resolveImageUrl(parsedContent.url)
  const alt = parsedContent.description || 'Blog image'

  const onApplied = async () => {
    if (post?.id) await fetchPost(post.id, true)
    onContentUpdated?.({ ...parsedContent, url: src })
  }

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
      <Button type="button" variant="outline" className="group relative my-8 block w-full overflow-hidden p-0 h-auto" onClick={() => setStudioOpen(true)}>
        <img src={src} alt={alt} className="w-full h-auto max-h-[600px] object-contain" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
          ✏️ Edit in Studio
        </div>
      </Button>

      {post ? (
        <ImageStudio
          open={studioOpen}
          onClose={() => setStudioOpen(false)}
          blogId={post.id}
          imageNumber={imageNumber}
          currentUrl={parsedContent.url}
          currentDescription={parsedContent.description}
          postTitle={post.title_text}
          onImageApplied={onApplied}
        />
      ) : null}
    </BaseElement>
  )
}
