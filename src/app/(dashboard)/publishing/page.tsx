'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  usePublishingSettingsQuery,
  useUpdatePublishingSettingsMutation,
} from '@/hooks/queries/settings'
import {
  useSyncAllPostsMutation,
  useSyncAllDictionariesMutation,
  useJobStatusQuery,
} from '@/hooks/queries/publishing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

export default function PublishingPage() {
  const { data: publishingData, isLoading } = usePublishingSettingsQuery()
  const updateSettings = useUpdatePublishingSettingsMutation()
  const syncPosts = useSyncAllPostsMutation()
  const syncDictionaries = useSyncAllDictionariesMutation()

  const [publishingEndpoint, setPublishingEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [hasExistingKey, setHasExistingKey] = useState(false)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState<'posts' | 'dictionaries' | null>(null)

  useEffect(() => {
    if (!publishingData) return
    setPublishingEndpoint(publishingData.api_endpoint ?? '')
    setHasExistingKey(Boolean(publishingData.has_api_key))
  }, [publishingData])

  const { data: jobData } = useJobStatusQuery(activeJobId, {
    enabled: !!activeJobId,
    refetchInterval: activeJobId ? 1500 : false,
  })
  const jobState = jobData?.status ?? null

  const submitForm = async (e: FormEvent) => {
    e.preventDefault()
    const payload: { api_endpoint: string; api_key?: string } = {
      api_endpoint: publishingEndpoint,
    }
    if (apiKey) payload.api_key = apiKey

    try {
      await updateSettings.mutateAsync(payload)
      if (apiKey) setHasExistingKey(true)
      setApiKey('')
    } catch {
    }
  }

  const triggerSync = async (kind: 'posts' | 'dictionaries') => {
    setIsSyncing(kind)
    try {
      const result =
        kind === 'posts'
          ? await syncPosts.mutateAsync()
          : await syncDictionaries.mutateAsync()
      setActiveJobId(result.jobId)
    } catch {
    } finally {
      setIsSyncing(null)
    }
  }

  const isConfigured = Boolean(publishingEndpoint.trim()) && hasExistingKey
  const isJobActive =
    activeJobId && jobState !== 'completed' && jobState !== 'failed' && jobState !== 'not_available'

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <h1 className="text-xl font-semibold">Publishing</h1>

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
                OpenSEO sends post and dictionary data to this URL when you sync.
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
              <Button type="submit" disabled={updateSettings.isPending}>
                {updateSettings.isPending ? 'Saving...' : 'Update API Settings'}
              </Button>
              <Link href="/settings/publishing-api" className="text-sm text-primary hover:underline">
                View JSON contract docs
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Sync Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[13px] text-muted-foreground">
            Push all generated content to your publishing endpoint. Posts must have status{' '}
            <Badge variant="outline" className="text-[10px]">GENERATED</Badge> to be included.
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

          {activeJobId && (
            <div className="rounded-sm border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Active job</p>
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
