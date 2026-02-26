'use client'

import { FormEvent, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { useUsersQuery, useApproveUserEmailMutation } from '@/hooks/queries/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function AdminUsersPage() {
  const userType = useAppSelector((s) => s.auth.userData?.userType)
  const isAdmin = userType === 4

  const { data: invites = [] } = useUsersQuery({ enabled: isAdmin })
  const approveEmail = useApproveUserEmailMutation()

  const [email, setEmail] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await approveEmail.mutateAsync({ email })
      setEmail('')
    } catch {
    }
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
              <Button type="submit" disabled={approveEmail.isPending}>
                {approveEmail.isPending ? 'Adding...' : 'Approve email'}
              </Button>
            </div>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Approved emails can sign up and then complete onboarding (company name + URL).
          </p>
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
