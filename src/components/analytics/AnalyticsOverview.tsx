'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { BlogGeneralData, ScoreBreakdownItem } from '@/types/analytics'

interface AnalyticsOverviewProps {
  generalBlogData: BlogGeneralData | null
  scoreBreakdown: Record<string, ScoreBreakdownItem>
}

function ScoreRing({ value, size = 200, stroke = 14, color = '#0078D4' }: { value: number; size?: number; stroke?: number; color?: string }) {
  const v = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (v / 100) * c
  const scoreColor = v >= 80 ? '#107C10' : v >= 50 ? '#FFB900' : '#D13438'
  const fill = color === 'auto' ? scoreColor : color

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E1E1E1" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={fill} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-bold leading-none sm:text-[34px]">{Math.round(v)}</span>
        <span className="text-[11px] text-muted-foreground">/100</span>
      </div>
    </div>
  )
}

function SmallRing({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value))
  const size = 72
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - (v / 100) * c

  return (
    <div className="rounded-sm border border-border p-2 text-center">
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="#E1E1E1" strokeWidth={stroke} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={r} stroke="#0078D4" strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[11px] font-semibold">{Math.round(v)}</div>
      </div>
      <p className="mt-2 text-[11px] capitalize text-muted-foreground">{label.replace(/_/g, ' ')}</p>
    </div>
  )
}

export function AnalyticsOverview({ generalBlogData, scoreBreakdown }: AnalyticsOverviewProps) {
  const score = generalBlogData?.general_seo_score ?? 0
  const entries = useMemo(() => Object.entries(scoreBreakdown || {}), [scoreBreakdown])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <Card className="rounded-sm md:col-span-5 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-[13px] uppercase tracking-wide">Overall SEO score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-6">
          <ScoreRing value={score} color="auto" />
        </CardContent>
      </Card>

      <Card className="rounded-sm md:col-span-7 lg:col-span-8">
        <CardHeader>
          <CardTitle className="text-[13px] uppercase tracking-wide">Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {entries.map(([key, value]) => (
                <SmallRing key={key} value={value.score} label={key} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-[13px] text-muted-foreground">No breakdown data available yet.</p>
          )}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-sm border border-border p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Content Volume</p>
              <p className="text-[12px] sm:text-[13px]">Assess total publishing throughput and posting consistency across the year.</p>
            </div>
            <div className="rounded-sm border border-border p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Content Depth</p>
              <p className="text-[12px] sm:text-[13px]">Evaluate average post length, case studies, and tool recommendation richness.</p>
            </div>
            <div className="rounded-sm border border-border p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Keyword Strategy</p>
              <p className="text-[12px] sm:text-[13px]">Track density and placement quality for focus keywords and supporting term links.</p>
            </div>
            <div className="rounded-sm border border-border p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Link Strategy</p>
              <p className="text-[12px] sm:text-[13px]">Measure internal linking quality, outgoing references, and overall link distribution.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
