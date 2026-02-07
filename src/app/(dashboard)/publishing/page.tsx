'use client'

import { Label } from '@/components/ui/label'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { apiPost } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function PublishingPage() {
  const [publishingEndpoint, setPublishingEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

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

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <h1 className="text-xl font-semibold">Publishing</h1>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
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

          {status && (
            <div className="mt-4">
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
