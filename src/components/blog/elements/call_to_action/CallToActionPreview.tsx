'use client'

import { useMemo, useState } from 'react'
import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdownInline } from '@/lib/markdown'
import { Button } from '@/components/ui/button'

type CallToActionContent = {
  image_url?: string
  target_url?: string
  title?: string
}

const resolveImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')
  const normalizedPath = imageUrl.replace(/^\//, '')

  return `${baseUrl}/media/${normalizedPath}`
}

export function CallToActionPreview({ content }: PreviewComponentProps) {
  const [openModal, setOpenModal] = useState(false)
  const parsedContent = (content ?? {}) as CallToActionContent

  const fullUrl = useMemo(() => resolveImageUrl(parsedContent.image_url), [parsedContent.image_url])

  return (
    <BasePreview content={content}>
      {fullUrl ? (
        <img
          src={fullUrl}
          alt={parsedContent.title || 'Call to Action'}
          className="my-[50px] w-full cursor-pointer rounded-lg object-contain transition-transform duration-300 ease-in-out hover:scale-105"
          style={{ maxHeight: 400 }}
          onClick={() => setOpenModal(true)}
        />
      ) : null}

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[500px] rounded-lg bg-background p-6 shadow-lg">
            <h3 className="mb-3 text-lg font-semibold">Call to Action</h3>
            <p className="mb-6 text-sm text-foreground">
              <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline('This Call to Action leads to ') }} />
              <strong dangerouslySetInnerHTML={{ __html: renderMarkdownInline(parsedContent.target_url || '') }} />
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setOpenModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </BasePreview>
  )
}
