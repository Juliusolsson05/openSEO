'use client'

import { FormEvent, ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  useGenerationSettingsQuery,
  useUpdateGenerationSettingsMutation,
  useApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
  type GenerationSettings,
} from '@/hooks/queries/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import {
  DEFAULT_GENERATION_ELEMENTS,
  GENERATION_ELEMENT_OPTIONS,
  MODEL_OPTIONS,
} from '@/lib/constants/generation'
import { useAppSelector } from '@/store/hooks'
import { USER_TYPES } from '@/types/auth'

const pretty = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

export default function SettingsPage() {
  const userData = useAppSelector((s) => s.auth.userData)
  const isAdmin = userData?.userType === USER_TYPES.Administrator
  const { data: savedSettings, isLoading: isLoadingGeneration } = useGenerationSettingsQuery()
  const updateGeneration = useUpdateGenerationSettingsMutation()
  const { data: inboundKeys = [] } = useApiKeysQuery()
  const createApiKey = useCreateApiKeyMutation()
  const revokeApiKey = useRevokeApiKeyMutation()

  const [generation, setGeneration] = useState<GenerationSettings>({
    blog_post_structure_model: 'gpt-5.2',
    blog_post_content_model: 'gpt-5-mini',
    initial_generation_elements: { ...DEFAULT_GENERATION_ELEMENTS },
  })
  const [newInboundKeyName, setNewInboundKeyName] = useState('')
  const [newInboundKeyValue, setNewInboundKeyValue] = useState<string | null>(null)

  useEffect(() => {
    if (!savedSettings) return
    const saved = savedSettings.initial_generation_elements
    const hasKeys = saved && Object.keys(saved).length > 0
    setGeneration({
      ...savedSettings,
      initial_generation_elements: hasKeys ? saved : { ...DEFAULT_GENERATION_ELEMENTS },
    })
  }, [savedSettings])

  const saveGeneration = async (e: FormEvent) => {
    e.preventDefault()
    updateGeneration.mutate(generation)
  }

  const createInboundKey = async (e: FormEvent) => {
    e.preventDefault()
    if (!newInboundKeyName.trim()) return
    try {
      const payload = await createApiKey.mutateAsync({ name: newInboundKeyName.trim() })
      setNewInboundKeyValue(payload?.key ?? null)
      setNewInboundKeyName('')
    } catch {
    }
  }

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Settings</h1>
        <div className="flex items-center gap-4 text-sm">
          {isAdmin ? (
            <Link href="/settings/integrations" className="text-primary hover:underline">
              Manage integrations
            </Link>
          ) : null}
          <Link href="/settings/publishing-api" className="text-primary hover:underline">
            View Publishing API docs
          </Link>
        </div>
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
                <Field label="Structure Model">
                  <select
                    value={generation.blog_post_structure_model}
                    onChange={(e) => setGeneration((prev) => ({ ...prev, blog_post_structure_model: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px]"
                  >
                    {MODEL_OPTIONS.map((model) => <option key={model} value={model}>{model}</option>)}
                  </select>
                </Field>

                <Field label="Content Model">
                  <select
                    value={generation.blog_post_content_model}
                    onChange={(e) => setGeneration((prev) => ({ ...prev, blog_post_content_model: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-[13px]"
                  >
                    {MODEL_OPTIONS.map((model) => <option key={model} value={model}>{model}</option>)}
                  </select>
                </Field>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Initial Generation Elements</Label>
                <p className="text-[12px] text-muted-foreground">Controls which element types are included when generating a new blog post.</p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {GENERATION_ELEMENT_OPTIONS.map((element) => (
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

              <Button type="submit" disabled={updateGeneration.isPending}>
                {updateGeneration.isPending ? 'Saving...' : 'Save Generation Settings'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-sm border-border bg-white">
        <CardHeader>
          <CardTitle>Inbound API Keys (client → OpenSEO)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={createInboundKey} className="flex flex-wrap items-center gap-2">
            <Input
              value={newInboundKeyName}
              onChange={(e) => setNewInboundKeyName(e.target.value)}
              placeholder="Key name (e.g. production-webhook)"
              className="max-w-sm"
            />
            <Button type="submit" disabled={createApiKey.isPending}>Create inbound key</Button>
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
                  <Button
                    variant="outline"
                    className="h-8"
                    disabled={revokeApiKey.isPending}
                    onClick={() => revokeApiKey.mutate(key.id)}
                  >
                    Revoke
                  </Button>
                ) : (
                  <Badge variant="outline">Revoked</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
