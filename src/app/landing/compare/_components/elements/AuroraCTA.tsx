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
        background: 'linear-gradient(135deg, #002050 0%, #0078D4 100%)',
        borderRadius: 16,
        padding: '44px 36px',
        marginBottom: 36,
        color: '#fff',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,120,212,0.2)',
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.12)',
            marginBottom: 20,
          }}
        >
          <AuroraLogo size={28} />
        </div>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 600,
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}
        >
          {headline}
        </h3>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            margin: '0 0 28px',
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
            gap: 8,
            padding: '14px 32px',
            borderRadius: 8,
            background: '#fff',
            color: '#0078D4',
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 2px 12px rgba(255,255,255,0.15)',
            transition: 'opacity 0.15s',
          }}
        >
          Try Aurora free →
        </Link>
      </div>
    </div>
  )
}
