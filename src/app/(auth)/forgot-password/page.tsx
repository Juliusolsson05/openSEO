import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-4">Password reset page under construction.</p>
        <Link href="/login" className="text-primary hover:underline">
          Back to Login
        </Link>
      </CardContent>
    </Card>
  )
}
