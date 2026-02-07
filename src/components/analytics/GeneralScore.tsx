'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

interface ScoreBreakdownItem {
  score: number
  weight: number
}

interface GeneralScoreProps {
  generalSeoScore: number
  scoreBreakdown: Record<string, ScoreBreakdownItem>
}

export function GeneralScore({ generalSeoScore, scoreBreakdown }: GeneralScoreProps) {
  const [open, setOpen] = useState(false)

  const score = Math.max(0, Math.min(100, generalSeoScore || 0))
  const color = score >= 80 ? '#107C10' : score >= 50 ? '#FFB900' : '#D13438'
  const size = 210
  const stroke = 14
  const radius = (size - stroke) / 2
  const c = 2 * Math.PI * radius
  const offset = c - (score / 100) * c

  const entries = useMemo(() => Object.entries(scoreBreakdown || {}), [scoreBreakdown])

  return (
    <>
      <Card className="h-full rounded-sm">
        <CardHeader>
          <CardTitle className="text-[13px] uppercase tracking-wide">General score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E1E1E1" strokeWidth={stroke} fill="none" />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={c}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-[44px] font-bold leading-none" style={{ color }}>
                {score}
              </p>
              <p className="text-[11px] text-muted-foreground">SEO SCORE</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            How is this calculated?
          </Button>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="w-[720px] max-w-[95vw] rounded-sm border border-border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold">Score Breakdown</h3>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <div className="max-h-[60vh] overflow-auto rounded-sm border border-border">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#F8F8F8]">
                <tr>
                  <th className="border-b border-border px-3 py-2">Metric</th>
                  <th className="border-b border-border px-3 py-2">Score</th>
                  <th className="border-b border-border px-3 py-2">Weight</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([key, item]) => (
                  <tr key={key}>
                    <td className="border-b border-border px-3 py-2 capitalize">{key.replace(/_/g, ' ')}</td>
                    <td className="border-b border-border px-3 py-2">{Math.round(item.score)}</td>
                    <td className="border-b border-border px-3 py-2">{Math.round(item.weight * 100)}%</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                      No breakdown data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </>
  )
}
