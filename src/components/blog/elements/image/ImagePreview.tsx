import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { resolveMediaUrl } from '@/lib/media'

type ImageContent = {
  url?: string
  description?: string
}

const DEFAULT_IMAGE = 'https://via.placeholder.com/800x400?text=No+Image'

export function ImagePreview({ content }: PreviewComponentProps) {
  const parsedContent = (content ?? {}) as ImageContent
  const src = resolveMediaUrl(parsedContent.url) || DEFAULT_IMAGE
  const alt = parsedContent.description || 'Blog image'

  return (
    <BasePreview content={content}>
      <div className="my-8 w-full overflow-hidden rounded-lg">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[600px] object-contain"
        />
      </div>
    </BasePreview>
  )
}
