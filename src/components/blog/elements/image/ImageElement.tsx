'use client'

import NextImage from 'next/image'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'

type ImageContent = {
  url?: string
  description?: string
}

const DEFAULT_IMAGE = 'https://via.placeholder.com/800x400?text=No+Image'

const resolveImageUrl = (url?: string) => {
  if (!url) return DEFAULT_IMAGE
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedPath = url.startsWith('/') ? url : `/${url}`

  return `${normalizedBase}${normalizedPath}`
}

export function ImageElement({ content, blogId, elementId, onContentUpdated, onElementDeleted, onElementAdded }: ElementComponentProps) {
  const parsedContent = (content ?? {}) as ImageContent
  const src = resolveImageUrl(parsedContent.url)
  const alt = parsedContent.description || 'Blog image'

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
      <div className="relative my-8 h-[250px] w-full overflow-hidden rounded-lg md:h-[400px]">
        <NextImage
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1024px"
          unoptimized={src.startsWith('http://') || src.startsWith('https://')}
        />
      </div>
    </BaseElement>
  )
}
