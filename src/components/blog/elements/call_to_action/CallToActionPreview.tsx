'use client'

import { useMemo, useState } from 'react'
import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdownInline } from '@/lib/markdown'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  type CallToActionContent,
  getCtaTargetUrl,
  resolveCtaImageUrl,
} from './shared'

export function CallToActionPreview({ content }: PreviewComponentProps) {
  const [openModal, setOpenModal] = useState(false)
  const parsedContent = (content ?? {}) as CallToActionContent

  const fullUrl = useMemo(() => resolveCtaImageUrl(parsedContent), [parsedContent])
  const targetUrl = getCtaTargetUrl(parsedContent)

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

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="w-full max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Call to Action</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-foreground">
            <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline('This Call to Action leads to ') }} />
            <strong dangerouslySetInnerHTML={{ __html: renderMarkdownInline(targetUrl) }} />
          </p>
          <DialogFooter>
            <Button onClick={() => setOpenModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BasePreview>
  )
}
