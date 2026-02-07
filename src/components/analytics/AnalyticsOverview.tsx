'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BreakdownItem {
  score: number
  weight: number
}

interface GeneralBlogData {
  general_seo_score?: number
}

interface AnalyticsOverviewProps {
  generalBlogData: GeneralBlogData | null
  scoreBreakdown: Record<string, BreakdownItem>
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
  const chartData = useMemo(() => [{ name: 'Score', value: score }, { name: 'Remaining', value: 100 - score }], [score])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <Card className="rounded-sm md:col-span-5 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-[13px] uppercase tracking-wide">Overall SEO score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mx-auto h-[200px] w-[200px] sm:h-[260px] sm:w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" innerRadius={50} outerRadius={80} startAngle={90} endAngle={-270}>
                  <Cell fill="#0078D4" />
                  <Cell fill="#E1E1E1" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="-mt-28 text-center text-[28px] font-bold sm:-mt-32 sm:text-[34px]">{Math.round(score)}</p>
          <p className="text-center text-[11px] text-muted-foreground">/100</p>
        </CardContent>
      </Card>

      <Card className="rounded-sm md:col-span-7 lg:col-span-8">
        <CardHeader>
          <CardTitle className="text-[13px] uppercase tracking-wide">Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(scoreBreakdown || {}).map(([key, value]) => (
              <SmallRing key={key} value={value.score} label={key} />
            ))}
          </div>
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
