'use client'

import Link from 'next/link'
import type { ComparisonListItem } from '../_lib/types'

interface MatchupCardProps {
  comparison: ComparisonListItem
}

export function MatchupCard({ comparison }: MatchupCardProps) {
  return (
    <Link
      href={`/landing/compare/${comparison.slug}`}
      style={{
        display: 'block',
        borderRadius: 12,
        background: '#fff',
        textDecoration: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #E1E1E1',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = '#0078D4'
        const bar = e.currentTarget.querySelector('[data-accent]') as HTMLElement
        if (bar) bar.style.background = '#005A9E'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = '#E1E1E1'
        const bar = e.currentTarget.querySelector('[data-accent]') as HTMLElement
        if (bar) bar.style.background = '#0078D4'
      }}
    >
      {/* Accent bar */}
      <div
        data-accent="true"
        style={{
          height: 4,
          background: '#0078D4',
          transition: 'background 0.2s',
        }}
      />

      <div style={{ padding: '24px 24px 20px' }}>
        {/* Tool initials + names */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            marginBottom: 16,
          }}
        >
          {/* Tool A initial */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#F0F6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#0078D4',
              flexShrink: 0,
            }}
          >
            {comparison.tool_a.name.charAt(0)}
          </div>

          <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>
            {comparison.tool_a.name}
          </span>

          {/* VS Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #002050, #0078D4)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.03em',
              flexShrink: 0,
            }}
          >
            VS
          </span>

          <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>
            {comparison.tool_b.name}
          </span>

          {/* Tool B initial */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#F3F0FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#6B4FBB',
              flexShrink: 0,
            }}
          >
            {comparison.tool_b.name.charAt(0)}
          </div>
        </div>

        {/* Title */}
        {comparison.title && (
          <p
            style={{
              fontSize: 14,
              color: '#616161',
              margin: 0,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {comparison.title}
          </p>
        )}

        {/* Read arrow */}
        <div
          style={{
            marginTop: 16,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 500,
            color: '#0078D4',
          }}
        >
          Read comparison →
        </div>
      </div>
    </Link>
  )
}
