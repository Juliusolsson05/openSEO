'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { AnalyticsBlogTitle } from '@/types/analytics'

interface BlogStatisticsProps {
  blogTitles: Pick<AnalyticsBlogTitle, 'id' | 'title_text' | 'post_linking'>[]
}

function Gauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value))
  const size = 120
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (v / 100) * c

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E1E1E1" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#0078D4" strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[12px] font-semibold">{v.toFixed(1)}%</div>
    </div>
  )
}

export function BlogStatistics({ blogTitles }: BlogStatisticsProps) {
  const stats = useMemo(() => {
    const n = blogTitles.length
    const links = blogTitles.reduce((sum, p) => sum + (p.post_linking?.length ?? 0), 0)
    const possible = n * Math.max(1, n - 1)
    const density = possible > 0 ? (links / possible) * 100 : 0
    const avg = n > 0 ? links / n : 0

    const knownIds = new Set<number>(blogTitles.map((p) => p.id))
    const indegree = new Map<number, number>()
    for (const id of knownIds) indegree.set(id, 0)
    for (const post of blogTitles) {
      for (const to of post.post_linking || []) {
        if (!knownIds.has(to)) continue
        indegree.set(to, (indegree.get(to) ?? 0) + 1)
      }
    }

    let centralId = -1
    let centralScore = -1
    for (const [id, score] of indegree.entries()) {
      if (score > centralScore) {
        centralId = id
        centralScore = score
      }
    }

    const centralPost = centralId >= 0 ? blogTitles.find((b) => b.id === centralId) : undefined
    const rating = avg >= 8 ? 'Excellent' : avg >= 5 ? 'Good' : avg >= 2 ? 'Decent' : 'Bad'

    return {
      density,
      avg,
      rating,
      central: centralPost?.title_text ?? 'N/A',
      centralScore: Math.max(0, centralScore),
    }
  }, [blogTitles])

  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="text-[13px] uppercase tracking-wide">Network statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col items-center">
            <Gauge value={stats.density} />
            <p className="mt-2 text-[11px] text-muted-foreground">Network Density</p>
          </div>
          <div className="rounded-sm border border-border p-3">
            <p className="text-[11px] uppercase text-muted-foreground">Avg links per post</p>
            <p className="mt-1 text-[24px] font-bold">{stats.avg.toFixed(2)}</p>
            <p className="mt-2 text-[12px]">Rating: <span className="font-semibold">{stats.rating}</span></p>
          </div>
          <div className="rounded-sm border border-border p-3">
            <p className="text-[11px] uppercase text-muted-foreground">Most central post</p>
            <p className="mt-1 line-clamp-3 text-[13px] font-semibold">{stats.central}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">Incoming links: {stats.centralScore}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
