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

type CompanyMetadata = {
  business_description?: string
  industry_description?: string
}

const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i

export default function SettingsPage() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false)
  const [isSavingApi, setIsSavingApi] = useState(false)
  const [companyData, setCompanyData] = useState<CompanyMetadata | null>(null)
  const [publishingEndpoint, setPublishingEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const hasCompanyData = Boolean(
    companyData?.business_description?.trim() || companyData?.industry_description?.trim()
  )

  const isValidUrl = urlRegex.test(websiteUrl)

  const fetchCompanyMetadata = async () => {
    setIsLoading(true)
    const { data, error } = await api<CompanyMetadata>('/api/nordtools/company/metadata', {
      method: 'GET',
    })

    if (error) {
      setCompanyData(null)
      setStatus({ type: 'error', message: error.message || 'Error fetching company metadata.' })
    } else {
      setCompanyData(data)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchCompanyMetadata()
  }, [])

  const submitUrl = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidUrl) return

    setStatus(null)
    setIsSubmittingUrl(true)

    const { data, error } = await apiPost<CompanyMetadata>('/api/nordtools/company/metadata', {
      url: websiteUrl,
    })

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update company profile.' })
    } else {
      setCompanyData(data)
      setStatus({ type: 'success', message: 'Company profile updated successfully.' })
    }

    setIsSubmittingUrl(false)
  }

  const submitApiForm = async (e: FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setIsSavingApi(true)

    const { error } = await apiPost('/api/nordtools/company/credentials/update', {
      api_endpoint: publishingEndpoint,
      api_key: apiKey,
    })

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update API credentials.' })
    } else {
      setStatus({ type: 'success', message: 'API credentials updated successfully.' })
      setApiKey('')
    }

    setIsSavingApi(false)
  }

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
              ) : hasCompanyData ? (
                <div className="space-y-2">
                  <details className="rounded-sm border border-border bg-background/30">
                    <summary className="cursor-pointer px-3 py-2 text-[11px] uppercase tracking-wide">
                      Business Description
                    </summary>
                    <div className="border-t border-border bg-white px-3 py-2 whitespace-pre-wrap">
                      {companyData?.business_description || 'No business description available.'}
                    </div>
                  </details>

                  <details className="rounded-sm border border-border bg-background/30">
                    <summary className="cursor-pointer px-3 py-2 text-[11px] uppercase tracking-wide">
                      Industry Description
                    </summary>
                    <div className="border-t border-border bg-white px-3 py-2 whitespace-pre-wrap">
                      {companyData?.industry_description || 'No industry description available.'}
                    </div>
                  </details>
                </div>
              ) : (
                <form onSubmit={submitUrl} className="space-y-3">
                  <p className="text-muted-foreground">
                    Teach AI about your business for personalized content. Enter your website URL to get started.
                  </p>
                  <Input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                  <Button type="submit" disabled={!isValidUrl || isSubmittingUrl}>
                    {isSubmittingUrl ? 'Submitting...' : 'Get Started'}
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
                    API Key
                  </Label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
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
