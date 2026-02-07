'use client'

import { ResponsiveContainer, Treemap, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LinkedWord {
  word: string
  link_count: number
}

interface KeywordsOverviewProps {
  linkedWords: LinkedWord[]
}

const COLORS = ['#E7F7E7', '#CCEECC', '#9DDC9D', '#69C369', '#2FA82F', '#107C10'] // theme: success scale

export function KeywordsOverview({ linkedWords }: KeywordsOverviewProps) {
  const data = linkedWords.map((w) => ({ name: w.word, size: w.link_count || 1, value: w.link_count || 0 }))

  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="text-[13px] uppercase tracking-wide">Keywords overview</CardTitle>
      </CardHeader>
      <CardContent className="h-[340px]">
        {data.length === 0 ? (
          <p className="pt-8 text-center text-[12px] text-muted-foreground">No keyword-link data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data}
              dataKey="size"
              stroke="#FFFFFF"
              fill="#69C369"
              content={(props: any) => {
                const { x, y, width, height, name, depth, index } = props
                if (depth !== 1 || width < 35 || height < 20) return <g />
                return (
                  <g>
                    <rect x={x} y={y} width={width} height={height} fill={COLORS[index % COLORS.length]} stroke="#fff" />
                    <text x={x + 4} y={y + 14} fill="#1B1B1F" fontSize={11}>{name}</text>
                  </g>
                )
              }}
            >
              <Tooltip />
            </Treemap>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
