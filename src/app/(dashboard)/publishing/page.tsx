'use client'

import { FormEvent, useState } from 'react'
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

      <Card className="rounded-sm border-[#E1E1E1] bg-white">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitForm} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Publishing Endpoint
              </label>
              <Input
                value={publishingEndpoint}
                onChange={(e) => setPublishingEndpoint(e.target.value)}
                placeholder="https://example.com/api/publish"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                API Key
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API key"
                required
              />
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Update API Settings'}
            </Button>
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
