'use client'

import { Label } from '@/components/ui/label'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { api, apiPost } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

type SyncStartResponse = { job_id: string; status: 'accepted' | 'running' }
type SyncJobStatus = 'accepted' | 'running' | 'completed' | 'failed' | 'not_available'
type CompanyCredentials = { api_endpoint?: string | null; api_key?: string | null }

export default function PublishingPage() {
  const [publishingEndpoint, setPublishingEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [hasExistingKey, setHasExistingKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [jobState, setJobState] = useState<SyncJobStatus | null>(null)
  const [isSyncing, setIsSyncing] = useState<'posts' | 'dictionaries' | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await api<CompanyCredentials>('/api/nordtools/company/get')
      if (data) {
        setPublishingEndpoint(data.api_endpoint ?? '')
        setHasExistingKey(Boolean(data.api_key))
      }
      setIsLoading(false)
    }
    void load()
  }, [])

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setIsSaving(true)

    const { error } = await apiPost('/api/nordtools/company/credentials/update', {
      api_endpoint: publishingEndpoint,
      api_key: apiKey || undefined,
    })

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update credentials.' })
    } else {
      setStatus({ type: 'success', message: 'Credentials updated successfully.' })
      if (apiKey) setHasExistingKey(true)
      setApiKey('')
    }

    setIsSaving(false)
  }

  const triggerSync = async (kind: 'posts' | 'dictionaries') => {
    setStatus(null)
    setIsSyncing(kind)
    const endpoint = kind === 'posts' ? '/api/v1/publishing/sync/posts/all' : '/api/v1/publishing/sync/dictionaries/all'
    const { data, error } = await apiPost<SyncStartResponse | { data: SyncStartResponse }>(endpoint, {})

    if (error) {
      setStatus({ type: 'error', message: error.message || `Failed to start ${kind} sync.` })
      setIsSyncing(null)
      return
    }

    const payload = Array.isArray(data) ? null : (data && 'data' in data ? data.data : data)
    const jobId = payload?.job_id
    if (!jobId) {
      setStatus({ type: 'error', message: 'Could not read job id from sync response.' })
      setIsSyncing(null)
      return
    }

    setActiveJobId(jobId)
    setJobState(payload.status)
    setStatus({ type: 'success', message: `${kind === 'posts' ? 'Post' : 'Dictionary'} sync started.` })
    setIsSyncing(null)
  }

  const refreshJob = async () => {
    if (!activeJobId) return
    const { data, error } = await api<{ status: SyncJobStatus }>(`/api/v1/publishing/jobs/${activeJobId}`)
    if (error || !data) return
    setJobState(data.status)
  }

  const isConfigured = Boolean(publishingEndpoint.trim()) && hasExistingKey

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <h1 className="text-xl font-semibold">Publishing</h1>

      {/* API Config */}
      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            API Configuration
            {!isLoading && (
              isConfigured
                ? <Badge variant="success" className="text-[10px]">Connected</Badge>
                : <Badge variant="warning" className="text-[10px]">Not configured</Badge>
            )}
          </CardTitle>
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
                placeholder="https://example.com/api/example/inbound"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Aurora sends post and dictionary data to this URL when you sync.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                API Key {hasExistingKey && !apiKey && <span className="text-success">(set)</span>}
              </Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasExistingKey ? '••••••• (leave blank to keep current)' : 'Enter API key'}
              />
              <p className="text-[11px] text-muted-foreground">
                Sent as <code className="text-[10px]">Authorization: Bearer &lt;key&gt;</code> with each webhook.
              </p>
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

          {status && (
            <Badge variant={status.type === 'success' ? 'success' : 'destructive'}>
              {status.message}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Sync Controls */}
      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Sync Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[13px] text-muted-foreground">
            Push all generated content to your publishing endpoint. Posts must have status <Badge variant="outline" className="text-[10px]">GENERATED</Badge> to be included.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => triggerSync('posts')}
              disabled={!isConfigured || isSyncing !== null}
            >
              {isSyncing === 'posts' && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Sync all posts
            </Button>
            <Button
              onClick={() => triggerSync('dictionaries')}
              disabled={!isConfigured || isSyncing !== null}
            >
              {isSyncing === 'dictionaries' && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Sync all dictionaries
            </Button>
          </div>

          {!isConfigured && (
            <p className="text-[12px] text-destructive">
              Configure your publishing endpoint and API key above before syncing.
            </p>
          )}

          {/* Job tracker */}
          {activeJobId && (
            <div className="rounded-sm border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Active job</p>
                <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={refreshJob}>
                  Refresh status
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {jobState === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : jobState === 'failed' ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                <code className="text-[12px] text-muted-foreground">{activeJobId}</code>
                {jobState && (
                  <Badge
                    variant={
                      jobState === 'completed' ? 'success'
                      : jobState === 'failed' ? 'destructive'
                      : 'outline'
                    }
                    className="text-[10px]"
                  >
                    {jobState}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
