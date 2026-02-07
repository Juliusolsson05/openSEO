'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      setStatus({
        share_enabled: true,
        share_token: data.share_token,
        share_url: data.share_url,
        share_expires_at: null,
      })
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
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: Number(postId) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Failed to revoke link')
      if (data?.success) {
        setStatus((prev) =>
          prev
            ? { ...prev, share_enabled: false, share_url: null }
            : { share_enabled: false, share_token: null, share_url: null, share_expires_at: null },
        )
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

  const openDialog = async () => {
    setOpen(true)
    await refreshStatus()
  }

  return (
    <>
      <Button onClick={openDialog} className="bg-[#0078D4] text-white hover:bg-[#106EBE]">
        Share
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-xl rounded-[4px] border border-[#E1E1E1] bg-white p-5"
            style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#1B1A19]">Share Blog Post</h3>
              <span className="rounded-[4px] border border-[#C7E0F4] bg-[#EFF6FC] px-2 py-1 text-[11px] font-semibold text-[#0078D4]">
                {statusLabel}
              </span>
            </div>

            {status?.share_url ? (
              <div className="space-y-2">
                <label className="text-[12px] text-[#605E5C]">Share link</label>
                <div className="flex gap-2">
                  <Input value={status.share_url} readOnly className="rounded-[4px] border-[#C8C6C4]" />
                  <Button variant="outline" onClick={copyLink} className="rounded-[4px] border-[#C8C6C4]">
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-[#605E5C]">No active share link for this post.</p>
            )}

            {status?.share_expires_at ? (
              <p className="mt-2 text-[12px] text-[#605E5C]">
                Expires: {new Date(status.share_expires_at).toLocaleString()}
              </p>
            ) : null}

            {error ? <p className="mt-3 text-[12px] text-[#A4262C]">{error}</p> : null}

            <div className="mt-5 flex justify-end gap-2">
              {!status?.share_enabled ? (
                <Button onClick={generateLink} disabled={loading} className="bg-[#0078D4] text-white hover:bg-[#106EBE]">
                  {loading ? 'Generating...' : 'Generate Link'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={revokeLink}
                  disabled={loading}
                  className="rounded-[4px] border-[#C8C6C4] text-[#A4262C]"
                >
                  {loading ? 'Revoking...' : 'Revoke Link'}
                </Button>
              )}
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-[4px] border-[#C8C6C4]">
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
