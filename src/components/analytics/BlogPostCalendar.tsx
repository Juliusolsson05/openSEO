'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { AnalyticsBlogTitle } from '@/types/analytics'

interface BlogPostCalendarProps {
  blogTitles: Pick<AnalyticsBlogTitle, 'generated_date'>[]
}

const CELL = 12
const GAP = 2
const COL = CELL + GAP // 14px per column

const BLUE_STEPS = ['#F2F2F2', '#C7E0F4', '#71AFE5', '#2B88D8', '#0078D4'] // design system blue scale

function dateKey(d: Date) {
  // Local calendar date (yyyy-MM-dd). Avoid toISOString(), which shifts to UTC
  // and buckets posts on the wrong day near midnight for users east/west of UTC.
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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

    // Build weeks starting from the Sunday before Jan 1
    const start = new Date(firstDay)
    start.setDate(start.getDate() - start.getDay())

    const days: Array<{ date: Date; count: number }> = []
    const cursor = new Date(start)
    while (cursor <= lastDay || cursor.getDay() !== 0) {
      days.push({ date: new Date(cursor), count: counts.get(dateKey(cursor)) ?? 0 })
      cursor.setDate(cursor.getDate() + 1)
    }

    const result: Array<Array<{ date: Date; count: number }>> = []
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7))

    // Compute month label positions based on first week where month appears
    const labels: Array<{ weekIndex: number; month: string }> = []
    let previousMonth = -1
    result.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0]?.date
      if (!firstDayOfWeek) return
      const month = firstDayOfWeek.getMonth()
      if (month !== previousMonth) {
        labels.push({
          weekIndex,
          month: new Date(year, month, 1).toLocaleString('en-US', { month: 'short' }),
        })
        previousMonth = month
      }
    })

    const max = Math.max(0, ...Array.from(counts.values()))

    return { weeks: result, monthLabels: labels, maxCount: max }
  }, [blogTitles])

  const colorForCount = (count: number): string => {
    if (count <= 0) return BLUE_STEPS[0]
    const level = Math.min(4, Math.ceil((count / Math.max(1, maxCount)) * 4))
    return BLUE_STEPS[level]
  }

  const LEFT_LABEL_W = 32 // px for day-of-week labels

  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="text-[13px] uppercase tracking-wide">Post frequency calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Month labels — absolutely positioned by week column */}
          <div className="relative mb-1 text-[10px] text-muted-foreground" style={{ height: 16, marginLeft: LEFT_LABEL_W }}>
            {monthLabels.map((m) => (
              <span
                key={`${m.month}-${m.weekIndex}`}
                className="absolute"
                style={{ left: m.weekIndex * COL }}
              >
                {m.month}
              </span>
            ))}
          </div>

          <div className="flex gap-0">
            <div className="grid grid-rows-7 pr-1 text-[10px] text-muted-foreground" style={{ width: LEFT_LABEL_W }}>
              {['Sun', '', 'Tue', '', 'Thu', '', 'Sat'].map((d, i) => (
                <div key={i} style={{ height: CELL, lineHeight: `${CELL}px` }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="flex" style={{ gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-rows-7" style={{ gap: GAP }}>
                  {week.map((day, di) => (
                    <div
                      key={`${wi}-${di}`}
                      className="rounded-[2px] border border-border"
                      style={{ width: CELL, height: CELL, background: colorForCount(day.count) }}
                      title={`${day.date.toDateString()} — ${day.count} post${day.count === 1 ? '' : 's'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground" style={{ marginLeft: LEFT_LABEL_W }}>
            <span>Less</span>
            {BLUE_STEPS.map((color, i) => (
              <div key={i} className="rounded-[2px] border border-border" style={{ width: CELL, height: CELL, background: color }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
