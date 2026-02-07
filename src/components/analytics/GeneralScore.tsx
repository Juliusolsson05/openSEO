'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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

  const entries = useMemo(() => Object.entries(scoreBreakdown || {}), [scoreBreakdown])

  const vbSize = 210
  const stroke = 14
  const radius = (vbSize - stroke) / 2
  const c = 2 * Math.PI * radius
  const offset = c - (score / 100) * c

  return (
    <>
      <Card className="h-full rounded-sm">
        <CardHeader>
          <CardTitle className="text-[13px] uppercase tracking-wide">General score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative w-[160px] sm:w-[200px] lg:w-[210px]">
            <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full">
              <circle cx={vbSize / 2} cy={vbSize / 2} r={radius} stroke="#E1E1E1" strokeWidth={stroke} fill="none" transform={`rotate(-90 ${vbSize / 2} ${vbSize / 2})`} />
              <circle cx={vbSize / 2} cy={vbSize / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${vbSize / 2} ${vbSize / 2})`} />
              <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="44" fontWeight="bold">{score}</text>
              <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" fill="#999" fontSize="11">SEO SCORE</text>
            </svg>
          </div>
          <Button variant="outline" size="sm" className="text-[12px]" onClick={() => setOpen(true)}>
            How is this calculated?
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[720px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Score Breakdown</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto rounded-sm border border-border">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-muted">
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
                    <td className="border-b border-border px-3 py-2">{item.weight <= 1 ? Math.round(item.weight * 100) : Math.round(item.weight)}%</td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr><td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">No breakdown data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
