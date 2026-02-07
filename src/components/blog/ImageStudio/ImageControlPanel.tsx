'use client'

import type { ImageStudioProvider } from './types'
import { IdeogramControls } from './providers/IdeogramControls'
import { GptImageControls } from './providers/GptImageControls'
import { StockPhotoControls } from './providers/StockPhotoControls'
import { UploadControls } from './providers/UploadControls'

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
  onGenerate: () => void
  isGenerating: boolean
  onStockSelect: (url: string) => void
  onUploadSelect: (file: File) => void
}

export function ImageControlPanel(props: Props) {
  const providers: Array<{ key: ImageStudioProvider; label: string }> = [
    { key: 'ideogram', label: 'Ideogram' },
    { key: 'gpt-image', label: 'GPT Image' },
    { key: 'stock', label: 'Stock Photos' },
    { key: 'upload', label: 'Upload' },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {providers.map((item) => (
          <button key={item.key} type="button" onClick={() => props.setProvider(item.key)} className={`rounded border px-2 py-1 text-sm ${props.provider === item.key ? 'border-primary bg-primary text-white' : 'border-border'}`}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button type="button" className="rounded border border-border px-2 py-1 text-xs" onClick={() => props.setPrompt(props.postTitle)}>Post Title</button>
        <button type="button" className="rounded border border-border px-2 py-1 text-xs" onClick={() => props.setPrompt(props.currentDescription)}>Image Description</button>
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

      {props.provider === 'stock' ? <StockPhotoControls onSelect={props.onStockSelect} initialQuery={props.postTitle} /> : null}
      {props.provider === 'upload' ? <UploadControls onSelect={props.onUploadSelect} /> : null}
    </div>
  )
}
