'use client'

import type { ImageStudioProvider } from './types'
import { Loader2 } from 'lucide-react'

interface Props {
  imageUrl: string | null
  provider: ImageStudioProvider
  isGenerating: boolean
}

const PROVIDER_LABELS: Record<ImageStudioProvider, string> = {
  ideogram: 'Ideogram',
  'gpt-image': 'GPT Image',
  'nano-banana': 'Nano Banana',
  imagen: 'Imagen',
  stock: 'Stock Photos',
  upload: 'Upload',
  photopea: 'Photopea',
}

export function ImagePreviewPanel({ imageUrl, provider, isGenerating }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-md border border-border bg-muted/30">
      {/* Image area — fills available space, never overflows */}
      <div className="relative flex flex-1 min-h-0 items-center justify-center overflow-hidden p-3">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm">Generating image…</span>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Preview"
            className="h-auto max-h-full w-auto max-w-full rounded object-contain"
          />
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <p className="text-lg mb-1">📷</p>
            <p>No image yet</p>
            <p className="text-xs mt-1">Generate or select an image</p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
        {PROVIDER_LABELS[provider] ?? provider}
      </div>
    </div>
  )
}
