'use client'

import type { ImageStudioProvider } from './types'

interface Props {
  imageUrl: string | null
  provider: ImageStudioProvider
  isGenerating: boolean
}

export function ImagePreviewPanel({ imageUrl, provider, isGenerating }: Props) {
  return (
    <div className="flex h-full flex-col rounded border border-border bg-muted/20 p-3">
      <div className="relative flex-1 overflow-hidden rounded border border-border bg-background">
        {isGenerating ? <div className="h-full w-full animate-pulse bg-muted" /> : imageUrl ? <img src={imageUrl} alt="Image preview" className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image selected</div>}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Provider: {provider}</p>
    </div>
  )
}
