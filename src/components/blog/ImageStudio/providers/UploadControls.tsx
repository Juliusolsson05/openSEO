'use client'

import { Label } from '@/components/ui/label'

import type { ChangeEvent } from 'react'

interface Props {
  onSelect: (file: File) => void
}

export function UploadControls({ onSelect }: Props) {
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onSelect(file)
  }

  return (
    <div className="space-y-3 text-sm">
      <Label className="flex min-h-28 cursor-pointer items-center justify-center rounded border border-dashed border-border p-4 text-center text-muted-foreground">
        Drag & drop or click to choose file
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </Label>
      <p className="text-xs text-muted-foreground">Accepted: JPG, PNG, WEBP. Keep file size reasonable for fast uploads.</p>
    </div>
  )
}
