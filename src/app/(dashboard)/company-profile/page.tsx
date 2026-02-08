'use client'

import { FormEvent, useEffect, useState } from 'react'
import { api, apiPost } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Globe, Loader2, RefreshCw, Sparkles } from 'lucide-react'

type CompanyProfile = {
  business_description: string
  industry: string
  target_audience: string
  tone_of_voice: string[]
  products_services: string[]
  key_terminology: string[]
  content_topics: string[]
  differentiators: string[]
  detected_language: string
  _scraped_at?: string
  _pages_analyzed?: number
}

type ProfileResponse = {
  website_url: string | null
  profile: CompanyProfile | null
  name: string
  business_type: string
  language: string
  keywords: unknown
}

type AnalyzeResponse = { task_id: string; status: string }
type TaskStatus = { status: string; logs?: unknown[]; error?: string | null }

export default function CompanyProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeTaskId, setAnalyzeTaskId] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const load = async () => {
    setIsLoading(true)
    const { data } = await api<ProfileResponse>('/api/v1/company/profile')
    if (data) {
      setWebsiteUrl(data.website_url ?? '')
      setProfile(data.profile ?? null)
      setCompanyName(data.name ?? '')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setTimeout(() => { void load() }, 0)
  }, [])

  // Poll analyze task
  useEffect(() => {
    if (!analyzeTaskId) return
    const interval = setInterval(async () => {
      const { data } = await api<TaskStatus>(`/api/v1/publishing/jobs/${analyzeTaskId}`)
      if (!data) return
      if (data.status === 'completed') {
        setIsAnalyzing(false)
        setAnalyzeTaskId(null)
        setStatus({ type: 'success', message: 'Website analyzed successfully.' })
        void load() // Reload profile
      } else if (data.status === 'failed') {
        setIsAnalyzing(false)
        setAnalyzeTaskId(null)
        setStatus({ type: 'error', message: data.error ?? 'Analysis failed.' })
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [analyzeTaskId])

  const handleAnalyze = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!websiteUrl.trim()) return
    setStatus(null)
    setIsAnalyzing(true)

    const { data, error } = await apiPost<AnalyzeResponse>('/api/v1/company/analyze', {
      website_url: websiteUrl,
    })

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to start analysis.' })
      setIsAnalyzing(false)
      return
    }

    if (data?.task_id) {
      setAnalyzeTaskId(data.task_id)
    }
  }

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <h1 className="text-xl font-semibold">Company Profile</h1>

      {/* Website URL + Analyze */}
      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-[11px] uppercase tracking-wide text-muted-foreground">Website URL</label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="h-9"
              />
              <p className="text-[11px] text-muted-foreground">
                We&apos;ll analyze your website to build a company profile that shapes all generated content.
              </p>
            </div>
            <Button type="submit" disabled={isAnalyzing || !websiteUrl.trim()} className="gap-1.5">
              {isAnalyzing ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...</>
              ) : profile ? (
                <><RefreshCw className="h-3.5 w-3.5" /> Re-analyze</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5" /> Analyze Website</>
              )}
            </Button>
          </form>

          {status && (
            <div className="mt-3">
              <Badge variant={status.type === 'success' ? 'success' : 'destructive'}>
                {status.message}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Profile */}
      {isLoading ? (
        <Card className="rounded-sm border-border bg-white">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : profile ? (
        <>
          <Card className="rounded-sm border-border bg-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{companyName}</span>
                <div className="flex gap-2">
                  <Badge variant="outline">{profile.industry}</Badge>
                  <Badge variant="outline">{profile.detected_language.toUpperCase()}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ProfileSection title="Business Description" text={profile.business_description} />
              <ProfileSection title="Target Audience" text={profile.target_audience} />

              <div className="grid grid-cols-2 gap-4">
                <TagList title="Tone of Voice" items={profile.tone_of_voice} />
                <TagList title="Products & Services" items={profile.products_services} />
                <TagList title="Key Terminology" items={profile.key_terminology} />
                <TagList title="Content Topics" items={profile.content_topics} />
                <TagList title="Differentiators" items={profile.differentiators} />
              </div>

              {profile._scraped_at && (
                <p className="text-[11px] text-muted-foreground">
                  Last analyzed: {new Date(profile._scraped_at).toLocaleString()} · {profile._pages_analyzed} pages
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="rounded-sm border-border bg-white">
          <CardContent className="py-12 text-center">
            <p className="text-[14px] font-semibold">No profile yet</p>
            <p className="text-[13px] text-muted-foreground mt-1">Enter your website URL above and click Analyze to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ProfileSection({ title, text }: { title: string; text: string }) {
  if (!text) return null
  return (
    <div className="space-y-1">
      <h3 className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{title}</h3>
      <p className="text-[13px] text-foreground leading-relaxed">{text}</p>
    </div>
  )
}

function TagList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <div className="space-y-1.5">
      <h3 className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="outline" className="text-[11px]">{item}</Badge>
        ))}
      </div>
    </div>
  )
}
