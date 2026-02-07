'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DictionaryData {
  total_words: number
  total_definitions: number
  isolated_words_count: number
}

interface DictionaryOverviewProps {
  dictionaryData: DictionaryData | null
}

function Ring({ value, color }: { value: number; color: string }) {
  const v = Math.max(0, Math.min(100, value))
  const size = 110
  const stroke = 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (v / 100) * c

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E1E1E1" /* theme: border */ strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[12px] font-semibold">{v.toFixed(1)}%</div>
    </div>
  )
}

export function DictionaryOverview({ dictionaryData }: DictionaryOverviewProps) {
  const totalWords = dictionaryData?.total_words ?? 0
  const defs = dictionaryData?.total_definitions ?? 0
  const isolated = dictionaryData?.isolated_words_count ?? 0

  const coverage = totalWords > 0 ? (defs / totalWords) * 100 : 0
  const isolation = totalWords > 0 ? (isolated / totalWords) * 100 : 0
  const isolationColor = isolation < 30 ? '#107C10' : isolation < 70 ? '#FFB900' : '#D13438' // theme: success/warning/destructive

  return (
    <Card className="h-full rounded-sm">
      <CardHeader>
        <CardTitle className="text-[13px] uppercase tracking-wide">Dictionary overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-sm border border-border p-3 text-center">
          <p className="text-[11px] uppercase text-muted-foreground">Total entries</p>
          <p className="text-[30px] font-bold">{totalWords}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col items-center rounded-sm border border-border p-3">
            <Ring value={coverage} color="#0078D4" /* theme: primary */ />
            <p className="mt-2 text-[11px] text-muted-foreground">Definition Coverage</p>
          </div>
          <div className="flex flex-col items-center rounded-sm border border-border p-3">
            <Ring value={isolation} color={isolationColor} />
            <p className="mt-2 text-[11px] text-muted-foreground">Isolation Percentage</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
