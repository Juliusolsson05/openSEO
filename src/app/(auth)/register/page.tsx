import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an Account</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-4">Registration page under construction.</p>
        <Link href="/login" className="text-primary hover:underline">
          Back to Login
        </Link>
      </CardContent>
    </Card>
  )
}
