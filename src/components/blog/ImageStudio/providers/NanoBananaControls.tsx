'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  prompt: string
  setPrompt: (value: string) => void
  model: 'flash' | 'pro'
  setModel: (value: 'flash' | 'pro') => void
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
  setAspectRatio: (value: '1:1' | '3:4' | '4:3' | '9:16' | '16:9') => void
  onGenerate: () => void
  isGenerating: boolean
}

export function NanoBananaControls({ prompt, setPrompt, model, setModel, aspectRatio, setAspectRatio, onGenerate, isGenerating }: Props) {
  return (
    <div className="space-y-3 text-sm">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        className="w-full rounded border border-border bg-background px-3 py-2"
        placeholder="Describe the image you want..."
      />

      <div>
        <p className="mb-1 text-xs text-muted-foreground">Model</p>
        <Select value={model} onValueChange={(value) => setModel(value as any)}>
          <SelectTrigger className="w-full rounded border border-border px-2 py-1">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flash">Flash (fast, free tier)</SelectItem>
            <SelectItem value="pro">Pro (best quality, paid)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="mb-1 text-xs text-muted-foreground">Aspect ratio</p>
        <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as any)}>
          <SelectTrigger className="w-full rounded border border-border px-2 py-1">
            <SelectValue placeholder="Select aspect ratio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1:1">1:1</SelectItem>
            <SelectItem value="16:9">16:9</SelectItem>
            <SelectItem value="9:16">9:16</SelectItem>
            <SelectItem value="3:4">3:4</SelectItem>
            <SelectItem value="4:3">4:3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">Powered by Google Gemini</p>

      <Button type="button" onClick={onGenerate} disabled={!prompt.trim() || isGenerating} className="w-full">
        {isGenerating ? 'Generating...' : 'Generate'}
      </Button>
    </div>
  )
}
