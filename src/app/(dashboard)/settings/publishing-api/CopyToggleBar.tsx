'use client'

import { useState, useCallback } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function CopyToggleBar({
  markdown,
  children,
}: {
  markdown: string
  children: React.ReactNode
}) {
  const [rawMode, setRawMode] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [markdown])

  return (
    <>
      <Card className="rounded-sm border-border bg-white">
        <CardContent className="flex items-center justify-between py-3">
          <p className="text-sm text-muted-foreground">
            Copy the full documentation as markdown to paste into your AI agent or codebase.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setRawMode(!rawMode)}>
              {rawMode ? 'Rendered view' : 'Raw markdown'}
            </Button>
            <Button size="sm" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy Markdown'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {rawMode ? (
        <Card className="rounded-sm border-border bg-white">
          <CardContent className="p-0">
            <pre className="overflow-auto whitespace-pre-wrap p-4 text-xs leading-relaxed font-mono text-muted-foreground">
              {markdown}
            </pre>
          </CardContent>
        </Card>
      ) : (
        children
      )}
    </>
  )
}
