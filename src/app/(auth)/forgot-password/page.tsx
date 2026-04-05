'use client'

import { Label } from '@/components/ui/label'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { apiPost } from '@/lib/api'
import { Mail, ArrowRight } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // Always show the same neutral message whether or not the account
    // exists — matches the backend stub which always returns 200.
    const neutralMessage =
      "If that email exists, you'll receive instructions shortly."
    try {
      await apiPost('/api/auth/forgot-password/', { email })
      setMessage(neutralMessage)
      setEmail('')
    } catch {
      setError('Unable to send reset email right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[13px] text-muted-foreground mb-4">
          Enter your account email and we’ll send password reset instructions.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="text-[13px] font-semibold mb-1 block">Email</Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-8 h-9" required />
            </div>
          </div>

          {message && <p className="text-[12px] text-success bg-success-light border border-success/20 rounded-sm px-3 py-2">{message}</p>}
          {error && <p className="text-[12px] text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">{error}</p>}

          <Button type="submit" className="w-full h-9" disabled={loading}>
            {loading ? 'Sending...' : <>Send reset link <ArrowRight className="h-3.5 w-3.5" /></>}
          </Button>

          <p className="text-center text-[12px] text-muted-foreground">
            Remembered your password? <Link href="/login" className="text-primary font-semibold hover:underline">Back to sign in</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
