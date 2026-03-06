import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getSetupStatus } from '@/server/setup'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const setup = await getSetupStatus()
  if (!setup.complete) {
    redirect('/setup')
  }

  const session = await auth()

  if (session?.user) {
    redirect('/blog')
  }

  redirect('/login')
}
