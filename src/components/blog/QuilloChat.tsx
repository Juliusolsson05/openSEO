'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  X,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { useQuilloAnalyzeMutation } from '@/hooks/queries/quillo'
import QuilloChatInterface from './QuilloChatInterface'

interface AnalysisResult {
  overall_analysis?: {
    overall_score: number
    summary: string
    strengths: string[]
    weaknesses: string[]
  }
  seo_improvements?: Array<{
    suggestion: string
    reason: string
    importance: string
  }>
  content_improvements?: Array<{
    suggestion: string
    reason: string
    proposed_changes?: string
  }>
}

interface Props {
  blogPostId: number
}

function ScoreGauge({ score }: { score: number }) {
  const r = 70
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 80 ? '#107C10' : score >= 50 ? '#FFB900' : '#D13438' // theme: success/warning/destructive

  return (
    <div className="relative flex items-center justify-center w-[140px] h-[140px] mx-auto">
      <svg viewBox="0 0 180 180" width={140} height={140} className="-rotate-90">
        <circle cx={90} cy={90} r={r} strokeWidth={10} fill="none" stroke="#E1E1E1" /* theme: border */ />
        <circle cx={90} cy={90} r={r} strokeWidth={10} fill="none" stroke={color}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <span className="absolute text-[28px] font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

export default function QuilloChat({ blogPostId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [tab, setTab] = useState<'overall' | 'seo' | 'content'>('overall')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const quilloAnalyze = useQuilloAnalyzeMutation()

  const fetchAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await quilloAnalyze.mutateAsync({ blogPostId })
      if (data) setAnalysis(data as AnalysisResult)
      else throw new Error('No data')
    } catch {
      setError('Could not analyze. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggle = () => {
    const next = !isOpen
    setIsOpen(next)
    if (next && !analysis) fetchAnalysis()
  }

  const importanceColor = (imp: string) => {
    switch (imp.toLowerCase()) {
      case 'high': return 'destructive'
      case 'medium': return 'warning'
      default: return 'outline'
    }
  }

  return createPortal(
    <>
      {!isOpen && (
        <Button
          onClick={toggle}
          className="fixed bottom-6 right-6 z-40 h-auto rounded-full bg-sidebar px-4 py-3 text-white shadow-lg hover:bg-sidebar-muted"
        >
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-[13px] font-semibold">Quillo Assistant</span>
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-40 w-[420px] max-h-[70vh] flex flex-col shadow-lg">
          <CardHeader className="flex-row items-center justify-between bg-sidebar text-white rounded-t-sm px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-white text-[14px]">Quillo Analysis</CardTitle>
              <Badge variant="warning" className="text-[9px] px-1.5 py-0">BETA</Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10" onClick={toggle}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-10 px-4">
                <p className="text-[13px] text-muted-foreground mb-3">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchAnalysis}>Retry</Button>
              </div>
            ) : analysis ? (
              <>
                <div className="flex border-b border-border">
                  {(['overall', 'seo', 'content'] as const).map((t) => (
                    <Button
                      key={t}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setTab(t)}
                      className={`h-auto flex-1 rounded-none py-2 text-[12px] font-semibold uppercase tracking-wide ${tab === t ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {t}
                    </Button>
                  ))}
                </div>

                <div className="p-4">
                  {tab === 'overall' && analysis.overall_analysis && (
                    <div className="space-y-4">
                      <ScoreGauge score={analysis.overall_analysis.overall_score} />
                      <p className="text-[13px] text-muted-foreground">{analysis.overall_analysis.summary}</p>

                      {analysis.overall_analysis.strengths?.length > 0 && (
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Strengths</p>
                          {analysis.overall_analysis.strengths.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 mb-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                              <span className="text-[12px]">{s}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {analysis.overall_analysis.weaknesses?.length > 0 && (
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Weaknesses</p>
                          {analysis.overall_analysis.weaknesses.map((w, i) => (
                            <div key={i} className="flex items-start gap-2 mb-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-warning-foreground shrink-0 mt-0.5" />
                              <span className="text-[12px]">{w}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {tab === 'seo' && (
                    <div className="space-y-3">
                      {(analysis.seo_improvements ?? []).map((imp, i) => (
                        <div key={i} className="border border-border rounded-sm p-3">
                          <p className="text-[13px] font-semibold mb-1">{imp.suggestion}</p>
                          <p className="text-[12px] text-muted-foreground mb-2">{imp.reason}</p>
                          <Badge variant={importanceColor(imp.importance) as any} className="text-[10px]">{imp.importance}</Badge>
                        </div>
                      ))}
                      {(analysis.seo_improvements ?? []).length === 0 && (
                        <p className="text-[13px] text-muted-foreground text-center py-6">No SEO improvements suggested.</p>
                      )}
                    </div>
                  )}

                  {tab === 'content' && (
                    <div className="space-y-3">
                      {(analysis.content_improvements ?? []).map((imp, i) => (
                        <div key={i} className="border border-border rounded-sm p-3">
                          <p className="text-[13px] font-semibold mb-1">{imp.suggestion}</p>
                          <p className="text-[12px] text-muted-foreground mb-1">{imp.reason}</p>
                          {imp.proposed_changes && (
                            <p className="text-[12px] text-muted-foreground"><span className="font-semibold">Proposed:</span> {imp.proposed_changes}</p>
                          )}
                        </div>
                      ))}
                      {(analysis.content_improvements ?? []).length === 0 && (
                        <p className="text-[13px] text-muted-foreground text-center py-6">No content improvements suggested.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </CardContent>

          {analysis && (
            <div className="border-t border-border p-3 shrink-0">
              <Button className="w-full gap-1.5" onClick={() => { setShowChat(true); setIsOpen(false) }}>
                <MessageSquare className="h-3.5 w-3.5" /> Chat with Quillo
              </Button>
            </div>
          )}
        </Card>
      )}

      <QuilloChatInterface isOpen={showChat} blogPostId={blogPostId} onClose={() => setShowChat(false)} />
    </>,
    document.body
  )
}
