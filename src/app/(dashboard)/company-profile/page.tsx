'use client'

import { Label } from '@/components/ui/label'

import { FormEvent, useEffect, useState } from 'react'
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

export default function CompanyProfilePage() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companyData, setCompanyData] = useState<CompanyMetadata | null>(null)
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
      setStatus({ type: 'error', message: error.message || 'Failed to fetch metadata.' })
      setCompanyData(null)
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
    setIsSubmitting(true)

    const { data, error } = await apiPost<CompanyMetadata>(
      '/api/nordtools/company/metadata/scrape',
      {
        website_url: websiteUrl,
      }
    )

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to submit URL.' })
      setCompanyData(null)
    } else {
      setCompanyData(data)
      setStatus({ type: 'success', message: 'Metadata scraped and updated successfully.' })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <h1 className="text-xl font-semibold">Company Profile</h1>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Company Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : hasCompanyData ? (
            <div className="space-y-3">
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
            <form onSubmit={submitUrl} className="space-y-4">
              <p className="text-muted-foreground">
                Teach AI about your business for personalized content. Enter your website URL to get started.
              </p>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Website URL
                </Label>
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <Button type="submit" disabled={!isValidUrl || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Get Started'}
              </Button>
            </form>
          )}

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
