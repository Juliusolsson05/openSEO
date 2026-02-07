'use client'

export function SaveIndicator({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (status === 'idle') return null

  return (
    <span className="text-[11px] text-muted-foreground animate-in fade-in">
      {status === 'saving' && '● Saving...'}
      {status === 'saved' && '✓ Saved'}
      {status === 'error' && <span className="text-destructive">✗ Error saving</span>}
    </span>
  )
}
