import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Aurora by Nordtools',
  description: 'Get in touch with the Nordtools team. Questions, feedback, or support for Aurora.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
