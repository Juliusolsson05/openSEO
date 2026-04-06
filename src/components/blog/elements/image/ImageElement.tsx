'use client'

import { useMemo, useState } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { usePostQuery } from '@/hooks/queries/blog'
import { useAppDispatch } from '@/store/hooks'
import { invalidatePost } from '@/store/slices/blogUiSlice'
import { ImageStudio } from '@/components/blog/ImageStudio'
import { Button } from '@/components/ui/button'
import { resolveMediaUrl } from '@/lib/media'

type ImageContent = {
  url?: string
  description?: string
  image_number?: number
}

const DEFAULT_IMAGE = 'https://via.placeholder.com/800x400?text=No+Image'

export function ImageElement({ content, blogId, elementId, onContentUpdated, onElementDeleted, onElementAdded }: ElementComponentProps) {
  const parsedContent = (content ?? {}) as ImageContent
  const [studioOpen, setStudioOpen] = useState(false)
  const dispatch = useAppDispatch()
  const { data: post } = usePostQuery(blogId)

  const imageNumber = useMemo(() => {
    if (typeof parsedContent.image_number === 'number' && parsedContent.image_number > 1) {
      return parsedContent.image_number
    }
    if (!post?.elements?.length) return 1

    const imageElements = post.elements.filter((element) => String(element.element_type).toLowerCase() === 'image')
    const index = imageElements.findIndex((element) => element.id === elementId)

    // Backend contract: 1 = cover image, first in-post image starts at 2.
    return index >= 0 ? index + 2 : 1
  }, [elementId, parsedContent.image_number, post?.elements])

  const src = resolveMediaUrl(parsedContent.url) || DEFAULT_IMAGE
  const alt = parsedContent.description || 'Blog image'

  const onApplied = async (newUrl: string) => {
    dispatch(invalidatePost(blogId) as any)
    onContentUpdated?.({ ...parsedContent, url: newUrl })
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
