'use client'

import { Label } from '@/components/ui/label'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { api, apiPost } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type GeneralSettingsResponse = {
  settings?: {
    business_description?: string
    industry_description?: string
    api_endpoint?: string | null
    has_api_key?: boolean
  }
}

type InboundKey = {
  id: number
  name: string
  key_prefix: string
  is_active: boolean
  last_used_at?: string | null
}

type InboundKeyCreateResponse = InboundKey & {
  key?: string
}

export default function SettingsPage() {
  const [businessDescription, setBusinessDescription] = useState('')
  const [industryDescription, setIndustryDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [isSavingApi, setIsSavingApi] = useState(false)
  const [publishingEndpoint, setPublishingEndpoint] = useState('')
  const [hasExistingApiKey, setHasExistingApiKey] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [inboundKeys, setInboundKeys] = useState<InboundKey[]>([])
  const [newInboundKeyName, setNewInboundKeyName] = useState('')
  const [newInboundKeyValue, setNewInboundKeyValue] = useState<string | null>(null)

  const fetchSettings = async () => {
    setIsLoading(true)

    const [generalRes, publishingRes] = await Promise.all([
      api<GeneralSettingsResponse>('/api/v1/settings/general'),
      api<GeneralSettingsResponse>('/api/v1/settings/publishing'),
    ])

    if (generalRes.error) {
      setStatus({ type: 'error', message: generalRes.error.message || 'Error fetching company metadata.' })
    } else {
      setBusinessDescription(String(generalRes.data?.settings?.business_description ?? ''))
      setIndustryDescription(String(generalRes.data?.settings?.industry_description ?? ''))
    }

    if (!publishingRes.error) {
      setPublishingEndpoint(String(publishingRes.data?.settings?.api_endpoint ?? ''))
      setHasExistingApiKey(Boolean(publishingRes.data?.settings?.has_api_key))
    }

    setIsLoading(false)
  }

  const submitProfile = async (e: FormEvent) => {
    e.preventDefault()

    setStatus(null)
    setIsSubmittingProfile(true)

    const { error } = await api('/api/v1/settings/general', {
      method: 'PATCH',
      body: JSON.stringify({
        business_description: businessDescription,
        industry_description: industryDescription,
      }),
    })

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update company profile.' })
    } else {
      setStatus({ type: 'success', message: 'Company profile updated successfully.' })
    }

    setIsSubmittingProfile(false)
  }

  const submitApiForm = async (e: FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setIsSavingApi(true)

    const { error } = await api('/api/v1/settings/publishing', {
      method: 'PATCH',
      body: JSON.stringify({
        api_endpoint: publishingEndpoint,
        ...(apiKey ? { api_key: apiKey } : {}),
      }),
    })

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update API credentials.' })
    } else {
      setStatus({ type: 'success', message: 'API credentials updated successfully.' })
      if (apiKey) setHasExistingApiKey(true)
      setApiKey('')
    }

    setIsSavingApi(false)
  }

  async function fetchInboundKeys() {
    const { data, error } = await api<InboundKey[] | { data: InboundKey[] }>('/api/v1/publishing/api-keys')
    if (error) return
    const items = Array.isArray(data) ? data : (data?.data ?? [])
    setInboundKeys(items)
  }

  const createInboundKey = async (e: FormEvent) => {
    e.preventDefault()
    if (!newInboundKeyName.trim()) return

    const { data, error } = await apiPost<InboundKeyCreateResponse | { data: InboundKeyCreateResponse }>('/api/v1/publishing/api-keys', { name: newInboundKeyName.trim() })
    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to create inbound key.' })
      return
    }

    const payload = data && typeof data === 'object' && 'data' in data
      ? (data.data as InboundKeyCreateResponse)
      : (data as InboundKeyCreateResponse | null)
    setNewInboundKeyValue(payload?.key ?? null)
    setNewInboundKeyName('')
    setStatus({ type: 'success', message: 'Inbound key created. Copy it now.' })
    await fetchInboundKeys()
  }

  const revokeInboundKey = async (id: number) => {
    const { error } = await apiPost(`/api/v1/publishing/api-keys/${id}/revoke`, {})
    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to revoke key.' })
      return
    }
    await fetchInboundKeys()
  }


  useEffect(() => {
    fetchSettings()
    fetchInboundKeys()
  }, [])

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Settings Panels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <details className="rounded-sm border border-border" open>
            <summary className="cursor-pointer bg-background px-3 py-2 text-[11px] uppercase tracking-wide">
              Company Profile
            </summary>
            <div className="space-y-3 border-t border-border p-3">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : (
                <form onSubmit={submitProfile} className="space-y-3">
                  <p className="text-muted-foreground">
                    Keep your business and industry context updated so generation stays accurate.
                  </p>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Business Description
                    </Label>
                    <textarea
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      rows={5}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Industry Description
                    </Label>
                    <textarea
                      value={industryDescription}
                      onChange={(e) => setIndustryDescription(e.target.value)}
                      rows={5}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                    />
                  </div>

                  <Button type="submit" disabled={isSubmittingProfile}>
                    {isSubmittingProfile ? 'Saving...' : 'Save profile'}
                  </Button>
                </form>
              )}
            </div>
          </details>

          <details className="rounded-sm border border-border">
            <summary className="cursor-pointer bg-background px-3 py-2 text-[11px] uppercase tracking-wide">
              API Configuration
            </summary>
            <div className="border-t border-border p-3">
              <form onSubmit={submitApiForm} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Publishing Endpoint
                  </Label>
                  <Input
                    value={publishingEndpoint}
                    onChange={(e) => setPublishingEndpoint(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    API Key {hasExistingApiKey && !apiKey && <span className="text-success">(set)</span>}
                  </Label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={hasExistingApiKey ? '••••••• (leave blank to keep current)' : 'Enter API key'}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={isSavingApi}>
                    {isSavingApi ? 'Saving...' : 'Update API Settings'}
                  </Button>
                  <Link href="/settings/publishing-api" className="text-sm text-primary hover:underline">
                    View publishing JSON docs
                  </Link>
                </div>
              </form>
            </div>
          </details>

          <details className="rounded-sm border border-border">
            <summary className="cursor-pointer bg-background px-3 py-2 text-[11px] uppercase tracking-wide">
              Inbound API Keys (client → Aurora)
            </summary>
            <div className="border-t border-border p-3 space-y-3">
              <form onSubmit={createInboundKey} className="flex flex-wrap items-center gap-2">
                <Input
                  value={newInboundKeyName}
                  onChange={(e) => setNewInboundKeyName(e.target.value)}
                  placeholder="Key name (e.g. production-webhook)"
                  className="max-w-sm"
                />
                <Button type="submit">Create inbound key</Button>
              </form>

              {newInboundKeyValue ? (
                <div className="rounded-sm border border-border bg-secondary/30 p-3 text-sm">
                  <p className="font-medium">Copy now (shown once)</p>
                  <code className="mt-1 block break-all">{newInboundKeyValue}</code>
                </div>
              ) : null}

              <div className="space-y-2">
                {inboundKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between rounded-sm border border-border p-2 text-sm">
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-muted-foreground">{key.key_prefix}… {key.is_active ? 'active' : 'revoked'}</p>
                    </div>
                    {key.is_active ? (
                      <Button variant="outline" className="h-8" onClick={() => revokeInboundKey(key.id)}>Revoke</Button>
                    ) : (
                      <Badge variant="outline">Revoked</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </details>

          {status && (
            <Badge variant={status.type === 'success' ? 'success' : 'destructive'}>
              {status.message}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
