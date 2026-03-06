'use client'

import { Label } from '@/components/ui/label'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/store/authActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Loader2 } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      const callbackUrl = searchParams.get('callbackUrl')
      const destination = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/blog'
      router.push(destination)
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-[24px] font-semibold text-foreground leading-tight">
        Sign in
      </h2>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        to continue to OpenSEO
      </p>

      <div className="mt-6 rounded-sm border border-info-light bg-info-light p-3">
        <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1.5">
          Demo Accounts
        </p>
        <div className="space-y-0.5 text-[12px] text-muted-foreground">
          <p>Admin: <span className="font-semibold text-foreground">admin@demo.com</span> / <span className="font-semibold text-foreground">admin</span></p>
          <p>Client: <span className="font-semibold text-foreground">client@demo.com</span> / <span className="font-semibold text-foreground">client</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label className="block text-[13px] font-semibold text-foreground mb-1">
            Email
          </Label>
          <Input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9"
            autoFocus
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-[13px] font-semibold text-foreground">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9"
          />
        </div>

        {error && (
          <div className="rounded-sm border border-destructive/20 bg-destructive/10 px-3 py-2">
            <p className="text-[12px] text-destructive">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full h-9" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-[12px] text-muted-foreground pt-1">
          No account?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-sm" />}>
      <LoginForm />
    </Suspense>
  )
}
