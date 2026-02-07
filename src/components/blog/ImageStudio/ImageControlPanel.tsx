'use client'

import type { ImageStudioProvider } from './types'
import { IdeogramControls } from './providers/IdeogramControls'
import { GptImageControls } from './providers/GptImageControls'
import { StockPhotoControls } from './providers/StockPhotoControls'
import { UploadControls } from './providers/UploadControls'
import { NanoBananaControls } from './providers/NanoBananaControls'
import { ImagenControls } from './providers/ImagenControls'
import { Button } from '@/components/ui/button'

interface Props {
  provider: ImageStudioProvider
  setProvider: (provider: ImageStudioProvider) => void
  prompt: string
  setPrompt: (value: string) => void
  postTitle: string
  currentDescription: string
  ideogramQuality: 1 | 2 | 3
  setIdeogramQuality: (value: 1 | 2 | 3) => void
  magicPrompt: boolean
  setMagicPrompt: (value: boolean) => void
  gptQuality: 'low' | 'medium' | 'high'
  setGptQuality: (value: 'low' | 'medium' | 'high') => void
  gptSize: '1024x1024' | '1536x1024' | '1024x1536' | 'auto'
  setGptSize: (value: '1024x1024' | '1536x1024' | '1024x1536' | 'auto') => void
  gptBackground: 'auto' | 'transparent' | 'opaque'
  setGptBackground: (value: 'auto' | 'transparent' | 'opaque') => void
  nanoModel: 'flash' | 'pro'
  setNanoModel: (value: 'flash' | 'pro') => void
  nanoAspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
  setNanoAspectRatio: (value: '1:1' | '3:4' | '4:3' | '9:16' | '16:9') => void
  imagenAspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
  setImagenAspectRatio: (value: '1:1' | '3:4' | '4:3' | '9:16' | '16:9') => void
  onGenerate: () => void
  isGenerating: boolean
  onStockSelect: (url: string) => void
  onUploadSelect: (file: File) => void
  currentImageUrl: string | null
  onOpenPhotopea: () => void
}

export function ImageControlPanel(props: Props) {
  const providers: Array<{ key: ImageStudioProvider; label: string }> = [
    { key: 'ideogram', label: 'Ideogram' },
    { key: 'gpt-image', label: 'GPT Image' },
    { key: 'nano-banana', label: 'Nano Banana ✨' },
    { key: 'imagen', label: 'Imagen (Google)' },
    { key: 'stock', label: 'Stock Photos' },
    { key: 'upload', label: 'Upload' },
    { key: 'photopea', label: 'Photopea' },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {providers.map((item) => (
          <Button key={item.key} type="button" size="sm" variant={props.provider === item.key ? 'default' : 'outline'} onClick={() => props.setProvider(item.key)}>
            {item.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => props.setPrompt(props.postTitle)}>Post Title</Button>
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => props.setPrompt(props.currentDescription)}>Image Description</Button>
      </div>

      {props.provider === 'ideogram' ? (
        <IdeogramControls
          prompt={props.prompt}
          setPrompt={props.setPrompt}
          quality={props.ideogramQuality}
          setQuality={props.setIdeogramQuality}
          magicPrompt={props.magicPrompt}
          setMagicPrompt={props.setMagicPrompt}
          onGenerate={props.onGenerate}
          isGenerating={props.isGenerating}
        />
      ) : null}

      {props.provider === 'gpt-image' ? (
        <GptImageControls
          prompt={props.prompt}
          setPrompt={props.setPrompt}
          quality={props.gptQuality}
          setQuality={props.setGptQuality}
          size={props.gptSize}
          setSize={props.setGptSize}
          background={props.gptBackground}
          setBackground={props.setGptBackground}
          onGenerate={props.onGenerate}
          isGenerating={props.isGenerating}
        />
      ) : null}

      {props.provider === 'nano-banana' ? (
        <NanoBananaControls
          prompt={props.prompt}
          setPrompt={props.setPrompt}
          model={props.nanoModel}
          setModel={props.setNanoModel}
          aspectRatio={props.nanoAspectRatio}
          setAspectRatio={props.setNanoAspectRatio}
          onGenerate={props.onGenerate}
          isGenerating={props.isGenerating}
        />
      ) : null}

      {props.provider === 'imagen' ? (
        <ImagenControls
          prompt={props.prompt}
          setPrompt={props.setPrompt}
          aspectRatio={props.imagenAspectRatio}
          setAspectRatio={props.setImagenAspectRatio}
          onGenerate={props.onGenerate}
          isGenerating={props.isGenerating}
        />
      ) : null}

      {props.provider === 'stock' ? <StockPhotoControls onSelect={props.onStockSelect} initialQuery={props.postTitle} /> : null}
      {props.provider === 'upload' ? <UploadControls onSelect={props.onUploadSelect} /> : null}
      {props.provider === 'photopea' ? (
        <div className="rounded border border-border bg-muted/20 p-3">
          <p className="mb-2 text-sm font-medium">Edit with Photopea</p>
          <p className="mb-3 text-xs text-muted-foreground">Edit your image with a full Photoshop-like editor.</p>
          {props.currentImageUrl ? <img src={props.currentImageUrl} alt="Current image" className="mb-3 h-20 w-20 rounded border border-border object-cover" /> : null}
          <Button
            type="button"
            size="sm"
            onClick={props.onOpenPhotopea}
            disabled={!props.currentImageUrl}
          >
            Open in Editor
          </Button>
        </div>
      ) : null}
    </div>
  )
}
