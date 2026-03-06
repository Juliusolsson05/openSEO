'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import {
  useDeleteIntegrationMutation,
  useIntegrationsQuery,
  useTestIntegrationMutation,
  useUpsertIntegrationMutation,
} from '@/hooks/queries/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI providers',
  media: 'Media providers',
  system: 'System',
}

export default function IntegrationsPage() {
  const { data = [], isLoading } = useIntegrationsQuery()
  const saveIntegration = useUpsertIntegrationMutation()
  const deleteIntegration = useDeleteIntegrationMutation()
  const testIntegration = useTestIntegrationMutation()

  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, { ok: boolean; error?: string }>>({})

  const grouped = useMemo(() => {
    return data.reduce<Record<string, typeof data>>((acc, item) => {
      const key = item.category || 'system'
      acc[key] = [...(acc[key] ?? []), item]
      return acc
    }, {})
  }, [data])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Integrations</h1>
          <p className="text-sm text-muted-foreground">Manage provider keys stored in the encrypted OpenSEO vault.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/settings">Back to settings</Link>
        </Button>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <Card key={category} className="rounded-sm border-border bg-white">
          <CardHeader>
            <CardTitle>{CATEGORY_LABELS[category] ?? category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => {
              const draftValue = drafts[item.key] ?? ''
              const status = results[item.key]
              return (
                <div key={item.key} className="rounded-sm border border-border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.label}</p>
                        <Badge variant="outline">{item.key}</Badge>
                        <Badge variant="outline">{item.source}</Badge>
                      </div>
                      {item.hint ? <p className="mt-1 text-sm text-muted-foreground">{item.hint}</p> : null}
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.configured ? `Configured: ${item.maskedValue}` : 'Not configured yet'}
                      </p>
                    </div>
                    {status ? (
                      <Badge variant="outline" className={status.ok ? 'text-emerald-700' : 'text-destructive'}>
                        {status.ok ? 'Connection OK' : status.error ?? 'Failed'}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
                    <div className="space-y-1">
                      <Label>Value</Label>
                      <Input
                        value={draftValue}
                        placeholder={item.configured ? 'Paste a new value to replace the current one' : 'Paste value'}
                        onChange={(event) => setDrafts((prev) => ({ ...prev, [item.key]: event.target.value }))}
                      />
                    </div>
                    <Button
                      className="self-end"
                      disabled={saveIntegration.isPending || !draftValue.trim()}
                      onClick={async () => {
                        await saveIntegration.mutateAsync({ key: item.key, value: draftValue.trim() })
                        setDrafts((prev) => ({ ...prev, [item.key]: '' }))
                        setResults((prev) => ({ ...prev, [item.key]: { ok: true } }))
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      className="self-end"
                      disabled={testIntegration.isPending}
                      onClick={async () => {
                        const result = await testIntegration.mutateAsync({
                          key: item.key,
                          value: draftValue.trim() || undefined,
                        })
                        setResults((prev) => ({ ...prev, [item.key]: result }))
                      }}
                    >
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      className="self-end"
                      disabled={deleteIntegration.isPending || !item.configured || item.source === 'env'}
                      onClick={async () => {
                        await deleteIntegration.mutateAsync(item.key)
                        setResults((prev) => {
                          const next = { ...prev }
                          delete next[item.key]
                          return next
                        })
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {!isLoading && data.length === 0 ? (
        <Card className="rounded-sm border-border bg-white">
          <CardContent className="py-8 text-sm text-muted-foreground">No integrations are available yet.</CardContent>
        </Card>
      ) : null}
    </div>
  )
}
