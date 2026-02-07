'use client'

import { useMemo, useState } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdownInline } from '@/lib/markdown'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type CallToActionContent = {
  image_url?: string
  target_url?: string
  // Backward compatibility
  image?: string
  link?: string
  title?: string
}

const resolveImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')
  const normalizedPath = imageUrl.replace(/^\//, '')

  return `${baseUrl}/media/${normalizedPath}`
}

export function CallToAction({ content, blogId, elementId, onContentUpdated, onElementDeleted, onElementAdded }: ElementComponentProps) {
  const [openModal, setOpenModal] = useState(false)
  const parsedContent = (content ?? {}) as CallToActionContent

  const fullUrl = useMemo(
    () => resolveImageUrl(parsedContent.image_url ?? parsedContent.image),
    [parsedContent.image_url, parsedContent.image],
  )

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      allowEdit={false}
      allowRegenerate={false}
      allowEnhance={false}
      allowAddElement={false}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
      onElementAdded={onElementAdded}
    >
      <>
        {fullUrl ? (
          <img
            src={fullUrl}
            alt={parsedContent.title || 'Call to Action'}
            className="my-[50px] w-full cursor-pointer rounded-lg object-contain transition-transform duration-300 ease-in-out hover:scale-105"
            style={{ maxHeight: 400 }}
            onClick={() => setOpenModal(true)}
          />
        ) : null}

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="w-full max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Call to Action</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-foreground">
              <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline('This Call to Action leads to ') }} />
              <strong dangerouslySetInnerHTML={{ __html: renderMarkdownInline(parsedContent.target_url || parsedContent.link || '') }} />
            </p>
            <DialogFooter>
              <Button onClick={() => setOpenModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </BaseElement>
  )
}
