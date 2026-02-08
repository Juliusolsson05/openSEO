'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { api, apiPost } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Globe, Loader2, RefreshCw, Sparkles, X } from 'lucide-react'
import { Label } from '@/components/ui/label'

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

const languageOptions = ['en', 'sv', 'de', 'fr', 'es', 'it', 'nl', 'no', 'da', 'fi']

const emptyProfile: CompanyProfile = {
  business_description: '',
  industry: '',
  target_audience: '',
  tone_of_voice: [],
  products_services: [],
  key_terminology: [],
  content_topics: [],
  differentiators: [],
  detected_language: 'en',
}

export default function CompanyProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile)
  const [companyName, setCompanyName] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeTaskId, setAnalyzeTaskId] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const hasProfileData = useMemo(() => {
    return Boolean(
      profile.business_description ||
      profile.industry ||
      profile.target_audience ||
      profile.tone_of_voice.length ||
      profile.products_services.length ||
      profile.key_terminology.length ||
      profile.content_topics.length ||
      profile.differentiators.length,
    )
  }, [profile])

  const load = async () => {
    setIsLoading(true)
    const { data } = await api<ProfileResponse>('/api/v1/company/profile')
    if (data) {
      setWebsiteUrl(data.website_url ?? '')
      setProfile(data.profile ? { ...emptyProfile, ...data.profile } : { ...emptyProfile, detected_language: data.language ?? 'en' })
      setCompanyName(data.name ?? '')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setTimeout(() => { void load() }, 0)
  }, [])

  useEffect(() => {
    if (!analyzeTaskId) return
    const interval = setInterval(async () => {
      const { data } = await api<TaskStatus>(`/api/v1/publishing/jobs/${analyzeTaskId}`)
      if (!data) return
      if (data.status === 'completed') {
        setIsAnalyzing(false)
        setAnalyzeTaskId(null)
        setStatus({ type: 'success', message: 'Website analyzed successfully.' })
        void load()
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

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setStatus(null)

    const { error } = await api('/api/v1/company/profile', {
      method: 'PATCH',
      body: JSON.stringify({ profile }),
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
            </div>
            <Button type="submit" disabled={isAnalyzing || !websiteUrl.trim()} className="gap-1.5">
              {isAnalyzing ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...</>
              ) : hasProfileData ? (
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

      {isLoading ? (
        <Card className="rounded-sm border-border bg-white">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-sm border-border bg-white">
          <CardHeader>
            <CardTitle>{companyName || 'Company'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Business Description</Label>
                <textarea
                  value={profile.business_description}
                  onChange={(e) => setProfile((prev) => ({ ...prev, business_description: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Industry</Label>
                  <Input
                    value={profile.industry}
                    onChange={(e) => setProfile((prev) => ({ ...prev, industry: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Detected Language</Label>
                  <select
                    value={profile.detected_language}
                    onChange={(e) => setProfile((prev) => ({ ...prev, detected_language: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px]"
                  >
                    {languageOptions.map((lang) => <option key={lang} value={lang}>{lang.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Target Audience</Label>
                <textarea
                  value={profile.target_audience}
                  onChange={(e) => setProfile((prev) => ({ ...prev, target_audience: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                />
              </div>

              <EditableTagField
                label="Tone of Voice"
                items={profile.tone_of_voice}
                onChange={(items) => setProfile((prev) => ({ ...prev, tone_of_voice: items }))}
              />
              <EditableTagField
                label="Products & Services"
                items={profile.products_services}
                onChange={(items) => setProfile((prev) => ({ ...prev, products_services: items }))}
              />
              <EditableTagField
                label="Key Terminology"
                items={profile.key_terminology}
                onChange={(items) => setProfile((prev) => ({ ...prev, key_terminology: items }))}
              />
              <EditableTagField
                label="Content Topics"
                items={profile.content_topics}
                onChange={(items) => setProfile((prev) => ({ ...prev, content_topics: items }))}
              />
              <EditableTagField
                label="Differentiators"
                items={profile.differentiators}
                onChange={(items) => setProfile((prev) => ({ ...prev, differentiators: items }))}
              />

              <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Profile'}</Button>

              {profile._scraped_at && (
                <p className="text-[11px] text-muted-foreground">
                  Last analyzed: {new Date(profile._scraped_at).toLocaleString()} · {profile._pages_analyzed} pages
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function EditableTagField({
  label,
  items,
  onChange,
}: {
  label: string
  items: string[]
  onChange: (next: string[]) => void
}) {
  const [value, setValue] = useState('')

  const addTag = () => {
    const nextValue = value.trim()
    if (!nextValue || items.includes(nextValue)) return
    onChange([...items, nextValue])
    setValue('')
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          placeholder={`Add ${label.toLowerCase()}...`}
        />
        <Button type="button" variant="outline" onClick={addTag}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="outline" className="flex items-center gap-1 text-[11px]">
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((tag) => tag !== item))}
              className="inline-flex"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
