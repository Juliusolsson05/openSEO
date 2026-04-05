'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  useCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
  useAnalyzeCompanyMutation,
  type CompanyProfile,
} from '@/hooks/queries/company'
import { useJobStatusQuery } from '@/hooks/queries/publishing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Globe, Loader2, RefreshCw, Sparkles, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

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
  const { data: profileData, isLoading } = useCompanyProfileQuery()
  const updateProfile = useUpdateCompanyProfileMutation()
  const analyzeCompany = useAnalyzeCompanyMutation()

  const [websiteUrl, setWebsiteUrl] = useState('')
  const [analyzeTaskId, setAnalyzeTaskId] = useState<string | null>(null)
  const [localProfile, setLocalProfile] = useState<CompanyProfile>(emptyProfile)
  const [profileSynced, setProfileSynced] = useState(false)

  // Sync server profile data into local editable state once per load.
  useEffect(() => {
    if (!profileData || profileSynced) return
    setWebsiteUrl(profileData.website_url ?? '')
    setLocalProfile(
      profileData.profile
        ? { ...emptyProfile, ...profileData.profile }
        : { ...emptyProfile, detected_language: profileData.language ?? 'en' }
    )
    setProfileSynced(true)
  }, [profileData, profileSynced])

  const companyName = profileData?.name ?? ''

  const { data: jobData } = useJobStatusQuery(analyzeTaskId, {
    enabled: !!analyzeTaskId,
    refetchInterval: analyzeTaskId ? 2000 : false,
  })

  const jobStatus = jobData?.status
  // React to analyze-job terminal states: clear the polling id and surface a toast.
  useEffect(() => {
    if (!analyzeTaskId) return
    if (jobStatus === 'completed') {
      setAnalyzeTaskId(null)
      toast.success('Website analyzed successfully.')
      setProfileSynced(false) // force re-sync when query refetches
    } else if (jobStatus === 'failed') {
      setAnalyzeTaskId(null)
      toast.error(jobData?.error ?? 'Analysis failed.')
    }
  }, [jobStatus, analyzeTaskId, jobData?.error])

  const isAnalyzing = !!analyzeTaskId || analyzeCompany.isPending

  const hasProfileData = useMemo(
    () =>
      Boolean(
        localProfile.business_description ||
          localProfile.industry ||
          localProfile.target_audience ||
          localProfile.tone_of_voice.length ||
          localProfile.products_services.length ||
          localProfile.key_terminology.length ||
          localProfile.content_topics.length ||
          localProfile.differentiators.length
      ),
    [localProfile]
  )

  const handleAnalyze = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!websiteUrl.trim()) return
    try {
      const result = await analyzeCompany.mutateAsync({ websiteUrl })
      if (result.task_id) setAnalyzeTaskId(result.task_id)
    } catch {
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(localProfile)
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
                  value={localProfile.business_description}
                  onChange={(e) => setLocalProfile((prev) => ({ ...prev, business_description: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Industry</Label>
                  <Input
                    value={localProfile.industry}
                    onChange={(e) => setLocalProfile((prev) => ({ ...prev, industry: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Detected Language</Label>
                  <select
                    value={localProfile.detected_language}
                    onChange={(e) => setLocalProfile((prev) => ({ ...prev, detected_language: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px]"
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Target Audience</Label>
                <textarea
                  value={localProfile.target_audience}
                  onChange={(e) => setLocalProfile((prev) => ({ ...prev, target_audience: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                />
              </div>

              <EditableTagField
                label="Tone of Voice"
                items={localProfile.tone_of_voice}
                onChange={(items) => setLocalProfile((prev) => ({ ...prev, tone_of_voice: items }))}
              />
              <EditableTagField
                label="Products & Services"
                items={localProfile.products_services}
                onChange={(items) => setLocalProfile((prev) => ({ ...prev, products_services: items }))}
              />
              <EditableTagField
                label="Key Terminology"
                items={localProfile.key_terminology}
                onChange={(items) => setLocalProfile((prev) => ({ ...prev, key_terminology: items }))}
              />
              <EditableTagField
                label="Content Topics"
                items={localProfile.content_topics}
                onChange={(items) => setLocalProfile((prev) => ({ ...prev, content_topics: items }))}
              />
              <EditableTagField
                label="Differentiators"
                items={localProfile.differentiators}
                onChange={(items) => setLocalProfile((prev) => ({ ...prev, differentiators: items }))}
              />

              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
              </Button>

              {localProfile._scraped_at && (
                <p className="text-[11px] text-muted-foreground">
                  Last analyzed: {new Date(localProfile._scraped_at).toLocaleString()} · {localProfile._pages_analyzed} pages
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
