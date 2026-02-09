import Link from 'next/link'
import { AuroraLogo } from '@/components/brand/logo'
import type { AuroraCTAContent } from '../../_lib/types'

interface Props {
  content: AuroraCTAContent
}

export function AuroraCTA({ content }: Props) {
  const headline = content.headline || 'Looking for something better?'
  const text = content.text || 'Aurora generates complete, structured blog posts — not just text. 20+ element types, Autopilot enhancement, and built-in CMS publishing.'

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #002050 0%, #0078D4 100%)', padding: '48px 32px', marginBottom: 0, borderRadius: 2 }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <AuroraLogo size={32} light />
        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', margin: '16px 0 8px', letterSpacing: '-0.01em' }}>
          {headline}
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 auto 20px', maxWidth: 440, lineHeight: 1.6 }}>
          {text}
        </p>
        <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#0078D4', background: '#FFFFFF', borderRadius: 2, textDecoration: 'none' }}>
          Try Aurora free →
        </Link>
      </div>
    </section>
  )
}
