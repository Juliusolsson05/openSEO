'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  prompt: string
  setPrompt: (value: string) => void
  quality: 'low' | 'medium' | 'high'
  setQuality: (value: 'low' | 'medium' | 'high') => void
  size: '1024x1024' | '1536x1024' | '1024x1536' | 'auto'
  setSize: (value: '1024x1024' | '1536x1024' | '1024x1536' | 'auto') => void
  background: 'auto' | 'transparent' | 'opaque'
  setBackground: (value: 'auto' | 'transparent' | 'opaque') => void
  onGenerate: () => void
  isGenerating: boolean
}

export function GptImageControls({
  prompt,
  setPrompt,
  quality,
  setQuality,
  size,
  setSize,
  background,
  setBackground,
  onGenerate,
  isGenerating,
}: Props) {
  return (
    <div className="space-y-3 text-sm">
      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} className="w-full rounded border border-border bg-background px-3 py-2" />

      <div>
        <p className="mb-1 text-xs text-muted-foreground">Quality</p>
        <Select value={quality} onValueChange={(value) => setQuality(value as any)}>
          <SelectTrigger className="w-full rounded border border-border px-2 py-1">
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">low</SelectItem>
            <SelectItem value="medium">medium</SelectItem>
            <SelectItem value="high">high</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="mb-1 text-xs text-muted-foreground">Size</p>
        <Select value={size} onValueChange={(value) => setSize(value as any)}>
          <SelectTrigger className="w-full rounded border border-border px-2 py-1">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1024x1024">1024x1024</SelectItem>
            <SelectItem value="1536x1024">1536x1024</SelectItem>
            <SelectItem value="1024x1536">1024x1536</SelectItem>
            <SelectItem value="auto">auto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="mb-1 text-xs text-muted-foreground">Background</p>
        <Select value={background} onValueChange={(value) => setBackground(value as any)}>
          <SelectTrigger className="w-full rounded border border-border px-2 py-1">
            <SelectValue placeholder="Select background" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">auto</SelectItem>
            <SelectItem value="transparent">transparent</SelectItem>
            <SelectItem value="opaque">opaque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="button" onClick={onGenerate} disabled={!prompt.trim() || isGenerating} className="w-full">
        {isGenerating ? 'Generating...' : 'Generate'}
      </Button>
    </div>
  )
}
