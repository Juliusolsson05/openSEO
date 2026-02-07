'use client'

import { Label } from '@/components/ui/label'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { api, apiPost } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type SyncStartResponse = { job_id: string; status: 'accepted' | 'running' }
type SyncJobStatus = 'accepted' | 'running' | 'completed' | 'failed' | 'not_available'

export default function PublishingPage() {
  const [publishingEndpoint, setPublishingEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [jobState, setJobState] = useState<SyncJobStatus | null>(null)

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setIsSaving(true)

    const { error } = await apiPost('/api/nordtools/company/credentials/update', {
      api_endpoint: publishingEndpoint,
      api_key: apiKey,
    })

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update credentials.' })
    } else {
      setStatus({ type: 'success', message: 'Credentials updated successfully.' })
      setApiKey('')
    }

    setIsSaving(false)
  }

  const triggerSync = async (kind: 'posts' | 'dictionaries') => {
    setStatus(null)
    const endpoint = kind === 'posts' ? '/api/v1/publishing/sync/posts/all' : '/api/v1/publishing/sync/dictionaries/all'
    const { data, error } = await apiPost<SyncStartResponse | { data: SyncStartResponse }>(endpoint, {})

    if (error) {
      setStatus({ type: 'error', message: error.message || `Failed to start ${kind} sync.` })
      return
    }

    const payload = Array.isArray(data) ? null : (data && 'data' in data ? data.data : data)
    const jobId = payload?.job_id
    if (!jobId) {
      setStatus({ type: 'error', message: 'Could not read job id from sync response.' })
      return
    }

    setActiveJobId(jobId)
    setJobState(payload.status)
    setStatus({ type: 'success', message: `${kind === 'posts' ? 'Post' : 'Dictionary'} sync started.` })
  }

  const refreshJob = async () => {
    if (!activeJobId) return
    const { data, error } = await api<{ status: SyncJobStatus }>(`/api/v1/publishing/jobs/${activeJobId}`)
    if (error || !data) return
    setJobState(data.status)
  }

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <h1 className="text-xl font-semibold">Publishing</h1>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={submitForm} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Publishing Endpoint
              </Label>
              <Input
                value={publishingEndpoint}
                onChange={(e) => setPublishingEndpoint(e.target.value)}
                placeholder="https://example.com/api/publish"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                API Key
              </Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API key"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Update API Settings'}
              </Button>
              <Link href="/settings/publishing-api" className="text-sm text-primary hover:underline">
                View JSON contract docs
              </Link>
            </div>
          </form>

          <div className="rounded-sm border border-border p-3">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Bulk Sync</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => triggerSync('posts')}>Sync all posts</Button>
              <Button variant="outline" onClick={() => triggerSync('dictionaries')}>Sync all dictionaries</Button>
              <Button variant="outline" onClick={refreshJob} disabled={!activeJobId}>Refresh job status</Button>
            </div>
            {activeJobId ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Active job: <code>{activeJobId}</code> {jobState ? `· ${jobState}` : ''}
              </p>
            ) : null}
          </div>

          {status && (
            <div className="mt-1">
              <Badge variant={status.type === 'success' ? 'success' : 'destructive'}>
                {status.message}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
