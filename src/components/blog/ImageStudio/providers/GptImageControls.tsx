'use client'

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
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} className="w-full rounded border border-border bg-background px-3 py-2" />

      <div>
        <p className="mb-1 text-xs text-muted-foreground">Quality</p>
        <select value={quality} onChange={(e) => setQuality(e.target.value as any)} className="w-full rounded border border-border px-2 py-1">
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </div>

      <div>
        <p className="mb-1 text-xs text-muted-foreground">Size</p>
        <select value={size} onChange={(e) => setSize(e.target.value as any)} className="w-full rounded border border-border px-2 py-1">
          <option value="1024x1024">1024x1024</option>
          <option value="1536x1024">1536x1024</option>
          <option value="1024x1536">1024x1536</option>
          <option value="auto">auto</option>
        </select>
      </div>

      <div>
        <p className="mb-1 text-xs text-muted-foreground">Background</p>
        <select value={background} onChange={(e) => setBackground(e.target.value as any)} className="w-full rounded border border-border px-2 py-1">
          <option value="auto">auto</option>
          <option value="transparent">transparent</option>
          <option value="opaque">opaque</option>
        </select>
      </div>

      <button type="button" onClick={onGenerate} disabled={!prompt.trim() || isGenerating} className="w-full rounded bg-primary px-4 py-2 text-white disabled:opacity-60">
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>
    </div>
  )
}
