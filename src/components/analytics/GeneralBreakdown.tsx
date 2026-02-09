'use client'

import { Card, CardContent } from '@/components/ui/card'

import type { BlogGeneralData } from '@/types/analytics'

interface GeneralBreakdownProps {
  generalBlogData: BlogGeneralData | null
}

interface MetricConfig {
  key: string
  title: string
  description: string
  recommendation: string
  maxRecommended: number
  unit: string
  data: { value?: number; value_recommendation?: string } | undefined
}

function RadialBar({ value, max, unit, title }: { value: number; max: number; unit: string; title: string }) {
  const pct = Math.min((value / max) * 100, 100)
  const isComplete = value >= max
  const size = 120
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  const color = isComplete ? '#107C10' : '#0078D4'

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E1E1E1" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[13px] font-bold">{value.toFixed(1)}{unit}</span>
        {isComplete && <span className="text-[10px] text-green-600">Good!</span>}
      </div>
    </div>
  )
}

export function GeneralBreakdown({ generalBlogData }: GeneralBreakdownProps) {
  const metrics: MetricConfig[] = [
    {
      key: 'keyword_density',
      title: 'Keyword Density',
      description: 'Focus keyword frequency in posts',
      recommendation: 'Maintain a keyword density between 1–2% for optimal SEO without keyword stuffing.',
      maxRecommended: 1.5,
      unit: '%',
      data: generalBlogData?.average_keyword_density,
    },
    {
      key: 'post_length',
      title: 'Post Length',
      description: 'Average words per blog post',
      recommendation: 'Aim for posts between 1,500 to 2,500 words for in-depth coverage and better SEO performance.',
      maxRecommended: 2000,
      unit: '',
      data: generalBlogData?.average_post_length,
    },
    {
      key: 'link_density',
      title: 'Link Density',
      description: 'Link frequency per 100 words',
      recommendation: 'Aim for a link density of 1–3%. Balance is key for engagement without distraction.',
      maxRecommended: 2.5,
      unit: '%',
      data: generalBlogData?.average_link_density,
    },
    {
      key: 'internal_links',
      title: 'Internal Links',
      description: 'Average internal links per post',
      recommendation: 'Include about 1 internal link per 50 words. For a 1,400-word post, aim for around 28–30.',
      maxRecommended: 30,
      unit: '',
      data: generalBlogData?.average_internal_links,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => {
        const value = m.data?.value ?? 0
        const isComplete = value >= m.maxRecommended
        const improveDiff = Math.max(0, m.maxRecommended - value)

        return (
          <Card key={m.key} className="rounded-sm">
            <CardContent className="flex flex-col items-center gap-3 p-4">
              <RadialBar value={value} max={m.maxRecommended} unit={m.unit} title={m.title} />
              <div className="text-center">
                <p className="text-[13px] font-semibold">{m.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{m.description}</p>
                {isComplete ? (
                  <p className="mt-2 text-[11px] font-medium text-green-600">
                    Recommended: {m.maxRecommended}{m.unit}
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] font-medium text-red-500">
                    Improve by {improveDiff.toFixed(1)}{m.unit}
                  </p>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground" title={m.recommendation}>
                  {m.data?.value_recommendation ?? m.recommendation}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
