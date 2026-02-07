'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  prompt: string
  setPrompt: (value: string) => void
  quality: 1 | 2 | 3
  setQuality: (value: 1 | 2 | 3) => void
  magicPrompt: boolean
  setMagicPrompt: (value: boolean) => void
  onGenerate: () => void
  isGenerating: boolean
}

export function IdeogramControls({ prompt, setPrompt, quality, setQuality, magicPrompt, setMagicPrompt, onGenerate, isGenerating }: Props) {
  return (
    <div className="space-y-3">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
        placeholder="Describe the image you want..."
      />

      <div className="flex gap-2">
        {[
          { label: 'Low (v1)', value: 1 as const },
          { label: 'Medium (v2 turbo)', value: 2 as const },
          { label: 'High (v2)', value: 3 as const },
        ].map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={quality === option.value ? 'default' : 'outline'}
            onClick={() => setQuality(option.value)}
            className="rounded-full text-xs"
          >
            {option.label}
          </Button>
        ))}
      </div>

      <Label className="flex items-center gap-2 text-sm">
        <Checkbox checked={magicPrompt} onCheckedChange={(checked) => setMagicPrompt(checked === true)} />
        Magic Prompt
      </Label>

      <Button
        type="button"
        onClick={onGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="w-full"
      >
        {isGenerating ? 'Generating...' : 'Generate'}
      </Button>
    </div>
  )
}
