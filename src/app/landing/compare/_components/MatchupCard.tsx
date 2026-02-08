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
        padding: 24,
        borderRadius: 8,
        border: '1px solid #E1E1E1',
        background: '#fff',
        textDecoration: 'none',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#0078D4'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,120,212,0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E1E1E1'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Tool names with VS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>
          {comparison.tool_a.name}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#0078D4',
            padding: '2px 8px',
            borderRadius: 10,
            background: '#F0F6FF',
          }}
        >
          vs
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>
          {comparison.tool_b.name}
        </span>
      </div>

      {/* Title */}
      {comparison.title && (
        <p
          style={{
            fontSize: 13,
            color: '#616161',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {comparison.title}
        </p>
      )}
    </Link>
  )
}
