'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { AnalyticsBlogTitle } from '@/stores/analytics-store'

interface BlogPostCalendarProps {
  blogTitles: Pick<AnalyticsBlogTitle, 'generated_date'>[]
}

const PURPLE_STEPS = ['#FFFFFF', '#EFE7FF', '#D5C0FF', '#B694FF', '#8B5CF6'] // theme: visualization palette

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function BlogPostCalendar({ blogTitles }: BlogPostCalendarProps) {
  const { weeks, monthLabels, maxCount } = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const firstDay = new Date(year, 0, 1)
    const lastDay = new Date(year, 11, 31)

    const counts = new Map<string, number>()
    for (const item of blogTitles || []) {
      if (!item.generated_date) continue
      const d = new Date(item.generated_date)
      if (!Number.isFinite(d.getTime()) || d.getFullYear() !== year) continue
      const key = dateKey(d)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    const start = new Date(firstDay)
    start.setDate(start.getDate() - start.getDay())

    const days: Array<{ date: Date; count: number }> = []
    const cursor = new Date(start)
    while (cursor <= lastDay || cursor.getDay() !== 0) {
      const key = dateKey(cursor)
      days.push({ date: new Date(cursor), count: counts.get(key) ?? 0 })
      cursor.setDate(cursor.getDate() + 1)
    }

    const result: Array<Array<{ date: Date; count: number }>> = []
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7))

    const labels: Array<{ index: number; month: string }> = []
    let previousMonth = -1
    result.forEach((week, index) => {
      const month = week[0]?.date.getMonth() ?? -1
      if (month !== previousMonth) {
        labels.push({ index, month: new Date(year, month, 1).toLocaleString('en-US', { month: 'short' }) })
        previousMonth = month
      }
    })

    const max = Math.max(0, ...Array.from(counts.values()))

    return { weeks: result, monthLabels: labels, maxCount: max }
  }, [blogTitles])

  const colorForCount = (count: number): string => {
    if (count <= 0) return PURPLE_STEPS[0]
    const level = Math.min(4, Math.ceil((count / Math.max(1, maxCount)) * 4))
    return PURPLE_STEPS[level]
  }

  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="text-[13px] uppercase tracking-wide">Post frequency calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="mb-2 ml-8 flex text-[11px] text-muted-foreground">
            {monthLabels.map((m) => (
              <div key={`${m.month}-${m.index}`} style={{ marginLeft: m.index === 0 ? 0 : (m.index - monthLabels[Math.max(0, monthLabels.findIndex((x) => x.index === m.index) - 1)].index) * 14 }}>
                {m.month}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <div className="mt-0 grid grid-rows-7 pr-2 text-[11px] text-muted-foreground">
              {['Sun', '', 'Tue', '', 'Thu', '', 'Sat'].map((d, i) => (
                <div key={i} className="h-[12px] leading-[12px]">{d}</div>
              ))}
            </div>
            <div className="flex gap-[2px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-rows-7 gap-[2px]">
                  {week.map((day, di) => (
                    <div
                      key={`${wi}-${di}`}
                      className="h-[12px] w-[12px] rounded-sm border border-border"
                      style={{ background: colorForCount(day.count) }}
                      title={`${day.date.toDateString()} — ${day.count} post${day.count === 1 ? '' : 's'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
