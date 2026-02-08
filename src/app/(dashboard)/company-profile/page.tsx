'use client'

import { FormEvent, useEffect, useState } from 'react'

import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type GeneralSettings = {
  settings?: {
    name?: string
    language?: string
    business_type?: string
    business_description?: string
    industry_description?: string
  }
}

export default function CompanyProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [businessDescription, setBusinessDescription] = useState('')
  const [industryDescription, setIndustryDescription] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const load = async () => {
    setIsLoading(true)
    const { data, error } = await api<GeneralSettings>('/api/v1/settings/general')

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to load company profile.' })
    } else {
      const settings = data?.settings
      setBusinessDescription(String(settings?.business_description ?? ''))
      setIndustryDescription(String(settings?.industry_description ?? ''))
    }

    setIsLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setIsSaving(true)

    const { error } = await api('/api/v1/settings/general', {
      method: 'PATCH',
      body: JSON.stringify({
        business_description: businessDescription,
        industry_description: industryDescription,
      }),
    })

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to save company profile.' })
    } else {
      setStatus({ type: 'success', message: 'Company profile updated.' })
    }

    setIsSaving(false)
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
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Business Description</label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                  placeholder="Describe what your company does, your audience, and positioning."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Industry Description</label>
                <textarea
                  value={industryDescription}
                  onChange={(e) => setIndustryDescription(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                  placeholder="Describe your industry context, terminology, and constraints."
                />
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Profile'}
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
