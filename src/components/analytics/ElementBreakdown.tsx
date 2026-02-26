'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ElementBreakdownProps {
  elementBreakdown: {
    total_posts: number
    element_counts: Record<string, number>
    total_elements_per_post: number[]
  } | null
}

const ELEMENT_COLORS: Record<string, string> = { // theme: chart palette
  paragraph: '#0078D4',
  introduction: '#106EBE',
  conclusion: '#005A9E',
  image: '#2B88D8',
  faq: '#71AFE5',
  list_paragraph: '#C7E0F4',
  numbered_list_paragraph: '#DEECF9',
  quote: '#004578',
  table: '#00BCF2',
  checklist: '#009E49',
  pros_and_cons: '#FFB900',
  versus: '#FF8C00',
  case_study: '#E81123',
  tool_recommendation: '#5C2D91',
  product_recommendations: '#B4009E',
  affiliate_recommendations: '#E3008C',
  statistic: '#00B294',
  timeline: '#107C10',
  featured_snippet_block: '#767676',
  call_to_action: '#D13438',
  bar_chart: '#498205',
}

function formatElementName(type: string) {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ElementBreakdown({ elementBreakdown }: ElementBreakdownProps) {
  const { chartData, totalElements, avgPerPost, uniqueTypes } = useMemo(() => {
    if (!elementBreakdown) return { chartData: [], totalElements: 0, avgPerPost: 0, uniqueTypes: 0 }

    const entries = Object.entries(elementBreakdown.element_counts)
      .map(([type, count]) => ({ name: formatElementName(type), type, count }))
      .sort((a, b) => b.count - a.count)

    const total = entries.reduce((s, e) => s + e.count, 0)
    const perPost = elementBreakdown.total_posts > 0 ? total / elementBreakdown.total_posts : 0

    return { chartData: entries, totalElements: total, avgPerPost: perPost, uniqueTypes: entries.length }
  }, [elementBreakdown])

  if (!elementBreakdown || chartData.length === 0) {
    return (
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="text-[13px] uppercase tracking-wide">Element breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-[13px] text-muted-foreground">No element data available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="text-[13px] uppercase tracking-wide">Element breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-sm border border-border p-3 text-center">
            <p className="text-[22px] font-bold">{elementBreakdown.total_posts}</p>
            <p className="text-[11px] text-muted-foreground">Total Posts</p>
          </div>
          <div className="rounded-sm border border-border p-3 text-center">
            <p className="text-[22px] font-bold">{totalElements}</p>
            <p className="text-[11px] text-muted-foreground">Total Elements</p>
          </div>
          <div className="rounded-sm border border-border p-3 text-center">
            <p className="text-[22px] font-bold">{avgPerPost.toFixed(1)}</p>
            <p className="text-[11px] text-muted-foreground">Avg per Post</p>
          </div>
          <div className="rounded-sm border border-border p-3 text-center">
            <p className="text-[22px] font-bold">{uniqueTypes}</p>
            <p className="text-[11px] text-muted-foreground">Unique Types</p>
          </div>
        </div>

        <div style={{ height: Math.max(300, chartData.length * 32 + 40) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={160}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 3, border: '1px solid #E1E1E1' /* theme: border */ }}
                formatter={(value) => [String(value), 'Count']}
              />
              <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.type} fill={ELEMENT_COLORS[entry.type] ?? '#0078D4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {elementBreakdown.total_elements_per_post.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Elements per post distribution
            </p>
            <div className="flex flex-wrap gap-1">
              {elementBreakdown.total_elements_per_post.map((count, i) => {
                const max = Math.max(...elementBreakdown.total_elements_per_post, 1)
                const intensity = Math.round((count / max) * 100)
                return (
                  <div
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-[9px]"
                    style={{ backgroundColor: `rgba(0, 120, 212, ${Math.max(0.05, intensity / 100)})`, color: intensity > 50 ? '#fff' : '#333' /* theme: foreground */ }}
                    title={`Post ${i + 1}: ${count} elements`}
                  >
                    {count}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
