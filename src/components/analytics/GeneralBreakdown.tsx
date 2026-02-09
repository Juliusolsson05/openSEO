'use client'

import { Card, CardContent } from '@/components/ui/card'

import type { BlogGeneralData } from '@/types/analytics'

interface GeneralBreakdownProps {
  generalBlogData: BlogGeneralData | null
}

function MetricRing({ value, max, unit = '' }: { value: number; max: number; unit?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const size = 78
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E1E1E1" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#0078D4" strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">{value.toFixed(1)}{unit}</div>
    </div>
  )
}

export function GeneralBreakdown({ generalBlogData }: GeneralBreakdownProps) {
  const metrics = [
    { key: 'average_keyword_density', label: 'Keyword Density', max: 1.5, unit: '%', data: generalBlogData?.average_keyword_density },
    { key: 'average_post_length', label: 'Post Length', max: 2000, unit: '', data: generalBlogData?.average_post_length },
    { key: 'average_link_density', label: 'Link Density', max: 2.5, unit: '%', data: generalBlogData?.average_link_density },
    { key: 'average_internal_links', label: 'Internal Links', max: 30, unit: '', data: generalBlogData?.average_internal_links },
  ] as const

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const value = metric.data?.value ?? 0
        const improveBy = Math.max(0, metric.max - value)
        const good = value <= metric.max
        return (
          <Card key={metric.key} className="rounded-sm">
            <CardContent className="flex items-start gap-3 p-4">
              <MetricRing value={value} max={metric.max} unit={metric.unit} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold">{metric.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{metric.data?.value_description ?? `Recommended max: ${metric.max}${metric.unit}`}</p>
                <div className="mt-2 inline-flex rounded-sm border border-border px-2 py-1 text-[11px]" title={metric.data?.value_recommendation ?? ''}>
                  {good ? 'Good!' : `Improve by ${improveBy.toFixed(1)}${metric.unit}`}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
