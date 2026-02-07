'use client'

import { Label } from '@/components/ui/label'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

type ShareStatus = {
  share_enabled: boolean
  share_token: string | null
  share_url: string | null
  share_expires_at: string | null
}

interface ShareDialogProps {
  postId: number | string
}

export default function ShareDialog({ postId }: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<ShareStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const statusLabel = useMemo(() => {
    if (!status) return 'Unknown'
    if (!status.share_enabled) return 'Revoked'
    if (status.share_expires_at && new Date(status.share_expires_at).getTime() < Date.now()) return 'Expired'
    return 'Active'
  }, [status])

  const refreshStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/aurora/blog/share?post_id=${Number(postId)}`, { method: 'GET' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Failed to load share status')
      setStatus(data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load share status')
    } finally {
      setLoading(false)
    }
  }

  const generateLink = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/aurora/blog/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: Number(postId) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Failed to generate link')
      setStatus({ share_enabled: true, share_token: data.share_token, share_url: data.share_url, share_expires_at: null })
    } catch (e: any) {
      setError(e?.message || 'Failed to generate link')
    } finally {
      setLoading(false)
    }
  }

  const revokeLink = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/aurora/blog/share', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ post_id: Number(postId) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Failed to revoke link')
      if (data?.success) {
        setStatus((prev) => prev ? { ...prev, share_enabled: false, share_url: null } : { share_enabled: false, share_token: null, share_url: null, share_expires_at: null })
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to revoke link')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    if (!status?.share_url) return
    await navigator.clipboard.writeText(status.share_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const openDialog = async () => { setOpen(true); await refreshStatus() }

  return (
    <>
      <Button onClick={openDialog}>Share</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-xl">
          <DialogHeader className="flex-row items-center justify-between">
            <DialogTitle className="text-[16px]">Share Blog Post</DialogTitle>
            <Badge variant="outline">{statusLabel}</Badge>
          </DialogHeader>

          {status?.share_url ? (
            <div className="space-y-2">
              <Label className="text-[12px] text-muted-foreground">Share link</Label>
              <div className="flex gap-2">
                <Input value={status.share_url} readOnly />
                <Button variant="outline" onClick={copyLink}>{copied ? 'Copied' : 'Copy'}</Button>
              </div>
            </div>
          ) : <p className="text-[13px] text-muted-foreground">No active share link for this post.</p>}

          {status?.share_expires_at ? <p className="text-[12px] text-muted-foreground">Expires: {new Date(status.share_expires_at).toLocaleString()}</p> : null}
          {error ? <p className="text-[12px] text-destructive">{error}</p> : null}

          <div className="mt-2 flex justify-end gap-2">
            {!status?.share_enabled ? (
              <Button onClick={generateLink} disabled={loading}>{loading ? 'Generating...' : 'Generate Link'}</Button>
            ) : (
              <Button variant="outline" onClick={revokeLink} disabled={loading}>{loading ? 'Revoking...' : 'Revoke Link'}</Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
