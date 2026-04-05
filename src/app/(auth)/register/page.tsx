'use client'

import { Label } from '@/components/ui/label'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { apiPost } from '@/lib/api'
import { ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await apiPost('/api/auth/register/', {
        name,
        email,
        password,
        password_confirm: confirm,
        company_name: companyName,
        company_url: companyUrl,
      })
      localStorage.setItem('openseo:show-welcome-tour', '1')
      router.push('/login')
    } catch (e: any) {
      setError(e?.message || 'Could not create account. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="text-[13px] font-semibold mb-1 block">Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" required />
          </div>
          <div>
            <Label className="text-[13px] font-semibold mb-1 block">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9" required />
          </div>
          <div>
            <Label className="text-[13px] font-semibold mb-1 block">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-9" required />
          </div>
          <div>
            <Label className="text-[13px] font-semibold mb-1 block">Confirm password</Label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-9" required />
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Onboarding</p>
            <div className="space-y-4">
              <div>
                <Label className="text-[13px] font-semibold mb-1 block">Company name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="h-9" required />
              </div>
              <div>
                <Label className="text-[13px] font-semibold mb-1 block">Company URL</Label>
                <Input value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} placeholder="https://example.com" className="h-9" required />
              </div>
            </div>
          </div>

          {error && <p className="text-[12px] text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">{error}</p>}

          <Button type="submit" className="w-full h-9" disabled={loading}>
            {loading ? 'Creating account...' : <>Create account <ArrowRight className="h-3.5 w-3.5" /></>}
          </Button>

          <p className="text-center text-[12px] text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
