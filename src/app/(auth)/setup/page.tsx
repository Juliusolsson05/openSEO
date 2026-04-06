'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiPost } from '@/lib/api'

const AI_FIELDS = [
  { key: 'OPENAI_API_KEY', label: 'OpenAI API key' },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API key' },
  { key: 'GEMINI_API_KEY', label: 'Gemini API key' },
] as const

const MEDIA_FIELDS = [
  { key: 'PEXELS', label: 'Pexels API key' },
  { key: 'IDEOGRAM', label: 'Ideogram API key' },
] as const

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [tests, setTests] = useState<Record<string, { ok: boolean; error?: string }>>({})
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    websiteUrl: '',
    integrations: {} as Record<string, string>,
  })

  useEffect(() => {
    async function checkStatus() {
      const res = await fetch('/api/setup/status', { cache: 'no-store' })
      const payload = await res.json().catch(() => null)
      if (payload?.data?.complete) {
        router.replace('/login')
        return
      }
      setLoading(false)
    }

    checkStatus()
  }, [router])

  const hasAtLeastOneAiKey = useMemo(
    () => AI_FIELDS.some((field) => form.integrations[field.key]?.trim()),
    [form.integrations],
  )

  async function testKey(key: string) {
    const value = form.integrations[key]?.trim()
    if (!value) {
      setTests((prev) => ({ ...prev, [key]: { ok: false, error: 'Enter a value first' } }))
      return
    }

    try {
      const result = await apiPost<{ ok: boolean; error?: string }>(
        '/api/setup/test',
        { key, value },
      )
      setTests((prev) => ({
        ...prev,
        [key]: result ?? { ok: false, error: 'Unknown error' },
      }))
    } catch (e: any) {
      setTests((prev) => ({
        ...prev,
        [key]: { ok: false, error: e?.message ?? 'Request failed' },
      }))
    }
  }

  async function submitSetup(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await apiPost('/api/setup', form)
    } catch (e: any) {
      setSubmitting(false)
      setError(e?.message ?? 'Setup failed')
      return
    }

    const login = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setSubmitting(false)

    if (login?.error) {
      router.push('/login')
      return
    }

    router.push('/blog?welcome=1')
  }

  if (loading) return null

  return (
    <Card className="border-border bg-white">
      <CardHeader>
        <CardTitle>Initial setup</CardTitle>
        <p className="text-sm text-muted-foreground">Create the first admin account and configure at least one AI provider.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitSetup} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <Field label="Your name">
                <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              </Field>
              <Field label="Password">
                <Input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
              </Field>
              <Field label="Company name">
                <Input value={form.companyName} onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))} />
              </Field>
              <Field label="Website URL">
                <Input value={form.websiteUrl} onChange={(e) => setForm((prev) => ({ ...prev, websiteUrl: e.target.value }))} placeholder="https://example.com" />
              </Field>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              {AI_FIELDS.map((field) => (
                <IntegrationField
                  key={field.key}
                  label={field.label}
                  value={form.integrations[field.key] ?? ''}
                  result={tests[field.key]}
                  onChange={(value) => setForm((prev) => ({
                    ...prev,
                    integrations: { ...prev.integrations, [field.key]: value },
                  }))}
                  onTest={() => testKey(field.key)}
                />
              ))}
              <p className="text-sm text-muted-foreground">At least one tested AI provider key is required to continue.</p>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              {MEDIA_FIELDS.map((field) => (
                <IntegrationField
                  key={field.key}
                  label={field.label}
                  value={form.integrations[field.key] ?? ''}
                  result={tests[field.key]}
                  onChange={(value) => setForm((prev) => ({
                    ...prev,
                    integrations: { ...prev.integrations, [field.key]: value },
                  }))}
                  onTest={() => testKey(field.key)}
                />
              ))}
              <p className="text-sm text-muted-foreground">These are optional. You can add or change them later from the integrations page.</p>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="outline" disabled={step === 1} onClick={() => setStep((prev) => prev - 1)}>
              Back
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep((prev) => prev + 1)}
                disabled={step === 1 ? !form.name || !form.email || !form.password || !form.companyName : !hasAtLeastOneAiKey}
              >
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={submitting || !hasAtLeastOneAiKey}>
                {submitting ? 'Finishing setup...' : 'Finish setup'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function IntegrationField({
  label,
  value,
  result,
  onChange,
  onTest,
}: {
  label: string
  value: string
  result?: { ok: boolean; error?: string }
  onChange: (value: string) => void
  onTest: () => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        {result ? <span className={`text-xs ${result.ok ? 'text-emerald-700' : 'text-destructive'}`}>{result.ok ? 'Connection OK' : result.error ?? 'Failed'}</span> : null}
      </div>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
        <Button type="button" variant="outline" onClick={onTest}>Test</Button>
      </div>
    </div>
  )
}
