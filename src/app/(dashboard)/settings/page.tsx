'use client'

import { FormEvent, ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { api, apiPost } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

type GenerationSettings = {
  default_language: string
  tone_of_voice: string
  auto_internal_linking: boolean
  default_post_length: number
  blog_post_structure_model: string
  blog_post_content_model: string
  initial_generation_elements: Record<string, boolean>
}

type IntegrationsSettings = {
  wordpress_enabled: boolean
  shopify_enabled: boolean
  quillo_enabled: boolean
  aurora_enabled: boolean
  pulse_enabled: boolean
  echo_enabled: boolean
}

type QuilloSettings = {
  brand_voice_prompt: string
  autopilot_enabled: boolean
  default_channels: string[]
}

type SettingsDomainResponse<T> = {
  success?: boolean
  data?: {
    settings?: T
  }
}

type InboundKey = {
  id: number
  name: string
  key_prefix: string
  is_active: boolean
}

type InboundKeyCreateResponse = InboundKey & {
  key?: string
}

const languageOptions = ['en', 'sv', 'de', 'fr', 'es', 'it', 'nl', 'no', 'da', 'fi']
const postLengthOptions = [
  { label: 'Short (~800 words)', value: 800 },
  { label: 'Medium (~1200 words)', value: 1200 },
  { label: 'Long (~1800 words)', value: 1800 },
]
const modelOptions = ['gpt-5-mini', 'gpt-5.2', 'claude-sonnet-4-5-20250929']
const generationElementOptions = [
  'paragraph',
  'list_paragraph',
  'numbered_list_paragraph',
  'image',
  'introduction',
  'conclusion',
  'table',
  'quote',
  'featured_snippet_block',
  'list_featured_snippet_block',
  'pros_and_cons',
  'faq',
  'timeline',
  'versus',
  'statistic',
  'bar_chart',
  'case_study',
  'tool_recommendation',
  'glossary',
  'context',
  'code_cluster',
  'poll',
  'quiz',
  'interactive_calculator',
]

const pretty = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

export default function SettingsPage() {
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [isLoadingGeneration, setIsLoadingGeneration] = useState(true)
  const [isSavingGeneration, setIsSavingGeneration] = useState(false)
  const [generation, setGeneration] = useState<GenerationSettings>({
    default_language: 'en',
    tone_of_voice: '',
    auto_internal_linking: true,
    default_post_length: 1200,
    blog_post_structure_model: 'gpt-5.2',
    blog_post_content_model: 'gpt-5-mini',
    initial_generation_elements: {},
  })

  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true)
  const [isSavingIntegrations, setIsSavingIntegrations] = useState(false)
  const [integrations, setIntegrations] = useState<IntegrationsSettings>({
    wordpress_enabled: false,
    shopify_enabled: false,
    quillo_enabled: true,
    aurora_enabled: false,
    pulse_enabled: false,
    echo_enabled: false,
  })

  const [isLoadingQuillo, setIsLoadingQuillo] = useState(true)
  const [isSavingQuillo, setIsSavingQuillo] = useState(false)
  const [quillo, setQuillo] = useState<QuilloSettings>({
    brand_voice_prompt: '',
    autopilot_enabled: false,
    default_channels: ['facebook'],
  })

  const [inboundKeys, setInboundKeys] = useState<InboundKey[]>([])
  const [newInboundKeyName, setNewInboundKeyName] = useState('')
  const [newInboundKeyValue, setNewInboundKeyValue] = useState<string | null>(null)

  const fetchInboundKeys = async () => {
    const { data, error } = await api<InboundKey[] | { data: InboundKey[] }>('/api/v1/publishing/api-keys')
    if (error) return
    const items = Array.isArray(data) ? data : (data?.data ?? [])
    setInboundKeys(items)
  }

  useEffect(() => {
    const load = async () => {
      const [generationRes, integrationsRes, quilloRes] = await Promise.all([
        api<SettingsDomainResponse<GenerationSettings>>('/api/v1/settings/generation'),
        api<SettingsDomainResponse<IntegrationsSettings>>('/api/v1/settings/integrations'),
        api<SettingsDomainResponse<QuilloSettings>>('/api/v1/settings/quillo'),
      ])

      if (generationRes.error) {
        setStatus({ type: 'error', message: generationRes.error.message || 'Failed to load generation settings.' })
      } else {
        const data = generationRes.data?.data?.settings
        if (data) {
          setGeneration({
            ...data,
            initial_generation_elements: data.initial_generation_elements ?? {},
          })
        }
      }
      setIsLoadingGeneration(false)

      if (integrationsRes.error) {
        setStatus({ type: 'error', message: integrationsRes.error.message || 'Failed to load integration settings.' })
      } else if (integrationsRes.data?.data?.settings) {
        setIntegrations(integrationsRes.data.data.settings)
      }
      setIsLoadingIntegrations(false)

      if (quilloRes.error) {
        setStatus({ type: 'error', message: quilloRes.error.message || 'Failed to load Quillo settings.' })
      } else if (quilloRes.data?.data?.settings) {
        setQuillo(quilloRes.data.data.settings)
      }
      setIsLoadingQuillo(false)

      void fetchInboundKeys()
    }

    void load()
  }, [])

  const saveGeneration = async (e: FormEvent) => {
    e.preventDefault()
    setIsSavingGeneration(true)
    setStatus(null)

    const { error } = await api('/api/v1/settings/generation', {
      method: 'PATCH',
      body: JSON.stringify(generation),
    })

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to save generation settings.' })
    } else {
      setStatus({ type: 'success', message: 'Generation settings saved.' })
    }
    setIsSavingGeneration(false)
  }

  const saveIntegrations = async (e: FormEvent) => {
    e.preventDefault()
    setIsSavingIntegrations(true)
    setStatus(null)

    const { error } = await api('/api/v1/settings/integrations', {
      method: 'PATCH',
      body: JSON.stringify(integrations),
    })

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to save integration settings.' })
    } else {
      setStatus({ type: 'success', message: 'Integration settings saved.' })
    }
    setIsSavingIntegrations(false)
  }

  const saveQuillo = async (e: FormEvent) => {
    e.preventDefault()
    setIsSavingQuillo(true)
    setStatus(null)

    const { error } = await api('/api/v1/settings/quillo', {
      method: 'PATCH',
      body: JSON.stringify(quillo),
    })

    if (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to save Quillo settings.' })
    } else {
      setStatus({ type: 'success', message: 'Quillo settings saved.' })
    }
    setIsSavingQuillo(false)
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

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Settings</h1>
        <Link href="/settings/publishing-api" className="text-sm text-primary hover:underline">
          View Publishing API docs
        </Link>
      </div>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Generation Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingGeneration ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <form onSubmit={saveGeneration} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Default Language">
                  <select
                    value={generation.default_language}
                    onChange={(e) => setGeneration((prev) => ({ ...prev, default_language: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px]"
                  >
                    {languageOptions.map((lang) => <option key={lang} value={lang}>{lang.toUpperCase()}</option>)}
                  </select>
                </Field>

                <Field label="Default Post Length">
                  <select
                    value={generation.default_post_length}
                    onChange={(e) => setGeneration((prev) => ({ ...prev, default_post_length: Number(e.target.value) }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px]"
                  >
                    {postLengthOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </Field>

                <Field label="Structure Model">
                  <select
                    value={generation.blog_post_structure_model}
                    onChange={(e) => setGeneration((prev) => ({ ...prev, blog_post_structure_model: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px]"
                  >
                    {modelOptions.map((model) => <option key={model} value={model}>{model}</option>)}
                  </select>
                </Field>

                <Field label="Content Model">
                  <select
                    value={generation.blog_post_content_model}
                    onChange={(e) => setGeneration((prev) => ({ ...prev, blog_post_content_model: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px]"
                  >
                    {modelOptions.map((model) => <option key={model} value={model}>{model}</option>)}
                  </select>
                </Field>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Tone of Voice</Label>
                  <Input
                    value={generation.tone_of_voice}
                    onChange={(e) => setGeneration((prev) => ({ ...prev, tone_of_voice: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-sm border border-border p-3 md:col-span-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Auto Internal Linking</p>
                    <p className="text-[12px] text-muted-foreground">Automatically include internal link suggestions.</p>
                  </div>
                  <Switch
                    checked={generation.auto_internal_linking}
                    onCheckedChange={(checked) => setGeneration((prev) => ({ ...prev, auto_internal_linking: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Initial Generation Elements</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {generationElementOptions.map((element) => (
                    <label key={element} className="flex items-center gap-2 rounded-sm border border-border p-2 text-[12px]">
                      <input
                        type="checkbox"
                        checked={Boolean(generation.initial_generation_elements[element])}
                        onChange={(e) => setGeneration((prev) => ({
                          ...prev,
                          initial_generation_elements: {
                            ...prev.initial_generation_elements,
                            [element]: e.target.checked,
                          },
                        }))}
                      />
                      <span>{pretty(element)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={isSavingGeneration}>{isSavingGeneration ? 'Saving...' : 'Save Generation Settings'}</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingIntegrations ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <form onSubmit={saveIntegrations} className="space-y-3">
              {(Object.keys(integrations) as Array<keyof IntegrationsSettings>).map((key) => (
                <div key={key} className="flex items-center justify-between rounded-sm border border-border p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{pretty(key.replace('_enabled', ''))}</p>
                  <Switch
                    checked={integrations[key]}
                    onCheckedChange={(checked) => setIntegrations((prev) => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
              <Button type="submit" disabled={isSavingIntegrations}>{isSavingIntegrations ? 'Saving...' : 'Save Integration Settings'}</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Quillo / Autopilot Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingQuillo ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <form onSubmit={saveQuillo} className="space-y-4">
              <Field label="Default Channels (comma-separated)">
                <Input
                  value={quillo.default_channels.join(', ')}
                  onChange={(e) => setQuillo((prev) => ({
                    ...prev,
                    default_channels: e.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                  }))}
                />
              </Field>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Brand Voice Prompt</Label>
                <textarea
                  value={quillo.brand_voice_prompt}
                  onChange={(e) => setQuillo((prev) => ({ ...prev, brand_voice_prompt: e.target.value }))}
                  rows={5}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px]"
                />
              </div>

              <div className="flex items-center justify-between rounded-sm border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Autopilot Enabled</p>
                <Switch
                  checked={quillo.autopilot_enabled}
                  onCheckedChange={(checked) => setQuillo((prev) => ({ ...prev, autopilot_enabled: checked }))}
                />
              </div>

              <Button type="submit" disabled={isSavingQuillo}>{isSavingQuillo ? 'Saving...' : 'Save Quillo Settings'}</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Inbound API Keys (client → Aurora)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>

      {status && (
        <Badge variant={status.type === 'success' ? 'success' : 'destructive'}>
          {status.message}
        </Badge>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}
