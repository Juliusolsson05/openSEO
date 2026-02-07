import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Awesome SaaS — Ship faster, scale smarter',
  description: 'The all-in-one platform for modern teams.',
}

export default function ExampleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
