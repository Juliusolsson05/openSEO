'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/')
    } catch {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          Welcome to <span className="capitalize">Aurora</span>! 👋🏻
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Please sign-in to your account
        </p>
      </CardHeader>
      <CardContent>
        {/* Demo credentials */}
        <div className="mb-6 rounded-lg bg-primary/10 p-3 text-sm">
          <p className="text-primary">
            Admin: <strong>admin@demo.com</strong> / <strong>admin</strong>
          </p>
          <p className="text-primary">
            Client: <strong>client@demo.com</strong> / <strong>client</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="johndoe@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="············"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <p className="text-center text-sm">
            New on our platform?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
