'use client'

import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { AnalyticsBlogTitle } from '@/types/analytics'

interface BlogCategoryDistributionProps {
  blogTitles: Pick<AnalyticsBlogTitle, 'categories'>[]
}

const COLORS = ['#0078D4', '#2899F5', '#50B0F9', '#7DCBF7', '#A6D8FF', '#0F6CBD', '#5C2D91'] // theme: primary scale

export function BlogCategoryDistribution({ blogTitles }: BlogCategoryDistributionProps) {
  const data = useMemo(() => {
    const map = new Map<string, number>()
    for (const post of blogTitles || []) {
      for (const category of post.categories || []) {
        map.set(category.name, (map.get(category.name) ?? 0) + 1)
      }
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [blogTitles])

  return (
    <Card className="h-full rounded-sm">
      <CardHeader>
        <CardTitle className="text-[13px] uppercase tracking-wide">Category distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        {data.length === 0 ? (
          <p className="pt-10 text-center text-[12px] text-muted-foreground">No categories found.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="38%" cy="50%" outerRadius={95} innerRadius={45}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
