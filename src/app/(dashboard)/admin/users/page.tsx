'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { api, apiPost } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type InviteItem = {
  id: string
  email: string | null
}

export default function AdminUsersPage() {
  const userType = useAuthStore((s) => s.userData?.userType)
  const isAdmin = userType === 4

  const [invites, setInvites] = useState<InviteItem[]>([])
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const { data, error } = await api<{ data: InviteItem[] }>('/api/admin/users')
    if (error) {
      setStatus(error.message)
      return
    }
    setInvites(data?.data ?? [])
  }

  useEffect(() => {
    if (!isAdmin) return
    const t = setTimeout(() => { void load() }, 0)
    return () => clearTimeout(t)
  }, [isAdmin])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('')

    const { error } = await apiPost('/api/admin/users', { email })
    if (error) {
      setStatus(error.message)
      setLoading(false)
      return
    }

    setEmail('')
    await load()
    setLoading(false)
    setStatus('Email approved for signup.')
  }

  if (!isAdmin) {
    return <p className="text-sm text-muted-foreground">Admin access required.</p>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Admin · Approved Signup Emails</h1>

      <Card>
        <CardHeader><CardTitle>Add valid email</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={submit}>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="self-end">
              <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Approve email'}</Button>
            </div>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Approved emails can sign up and then complete onboarding (company name + URL).
          </p>
          {status ? <p className="mt-2 text-xs text-muted-foreground">{status}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Approved emails</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {invites.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-sm border border-border p-2">
              <p className="text-sm font-medium">{u.email}</p>
            </div>
          ))}
          {!invites.length ? <p className="text-xs text-muted-foreground">No approved emails yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
