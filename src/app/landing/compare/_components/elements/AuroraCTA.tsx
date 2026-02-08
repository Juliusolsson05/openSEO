import Link from 'next/link'
import { AuroraLogo } from '@/components/brand/logo'
import type { AuroraCTAContent } from '../../_lib/types'

interface Props {
  content: AuroraCTAContent
}

export function AuroraCTA({ content }: Props) {
  const headline = content.headline || 'Looking for something better?'
  const text =
    content.text ||
    'Aurora generates complete, structured blog posts — not just text. 20+ element types, Autopilot enhancement, and built-in CMS publishing.'

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #002050, #0078D4)',
        borderRadius: 12,
        padding: 32,
        marginBottom: 32,
        color: '#fff',
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <AuroraLogo size={28} />
      </div>
      <h3
        style={{
          fontSize: 20,
          fontWeight: 600,
          margin: '0 0 12px',
          letterSpacing: '-0.01em',
        }}
      >
        {headline}
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          margin: '0 0 20px',
          opacity: 0.9,
          maxWidth: 520,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {text}
      </p>
      <Link
        href="/landing"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 24px',
          borderRadius: 6,
          background: '#fff',
          color: '#0078D4',
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'opacity 0.15s',
        }}
      >
        Try Aurora free →
      </Link>
    </div>
  )
}
