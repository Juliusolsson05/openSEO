'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  BookOpen,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Link2,
  AlertCircle,
} from 'lucide-react'
import { useAnalyticsStore } from '@/stores/analytics-store'

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#107C10' : score >= 50 ? '#FFB900' : '#D13438'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} strokeWidth={6} fill="none" stroke="#E1E1E1" />
        <circle cx={size/2} cy={size/2} r={radius} strokeWidth={6} fill="none" stroke={color}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute text-center">
        <span className="text-[24px] font-bold" style={{ color }}>{score}</span>
        <span className="text-[11px] text-muted-foreground block">/100</span>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const store = useAnalyticsStore()

  useEffect(() => { store.fetchAnalyticsData() }, [])

  if (store.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" /><Skeleton className="h-64 lg:col-span-2" />
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (store.error) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] font-semibold">Analytics Unavailable</p>
          <p className="text-[13px] text-muted-foreground mt-1">{store.error}</p>
          <Button variant="outline" className="mt-4 gap-1.5" onClick={() => store.fetchAnalyticsData()}>
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const seoScore = store.generalBlogData?.general_seo_score ?? 0
  const breakdown = store.generalBlogData?.score_breakdown ?? {}
  const totalPosts = store.blogTitles?.length ?? 0
  const dict = store.dictionaryData
  const meta = store.blogMetaData
  const oversizedTitles = meta?.oversized_seo_titles?.length ?? 0
  const oversizedDescs = meta?.oversized_meta_descriptions?.length ?? 0

  // Category distribution
  const categoryMap: Record<string, number> = {}
  store.blogTitles?.forEach((t: any) => {
    (t.categories || []).forEach((c: any) => {
      categoryMap[c.name] = (categoryMap[c.name] || 0) + 1
    })
  })
  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])
  const maxCatCount = categories[0]?.[1] || 1

  return (
    <div className="space-y-6 animate-in">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-info-light"><TrendingUp className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">SEO Score</p>
              <p className="text-[22px] font-bold leading-none mt-0.5">{seoScore}<span className="text-[13px] text-muted-foreground font-normal">/100</span></p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-info-light"><FileText className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Blog Posts</p>
              <p className="text-[22px] font-bold leading-none mt-0.5">{totalPosts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-success-light"><BookOpen className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Dictionary Words</p>
              <p className="text-[22px] font-bold leading-none mt-0.5">{dict?.total_words ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-warning-light">
              <AlertTriangle className="h-5 w-5 text-[#835C00]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">SEO Issues</p>
              <p className="text-[22px] font-bold leading-none mt-0.5">{oversizedTitles + oversizedDescs}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SEO Score Ring */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">SEO Health</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ScoreRing score={seoScore} />
            {Object.keys(breakdown).length > 0 && (
              <div className="w-full space-y-2">
                {Object.entries(breakdown).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[12px] text-muted-foreground flex-1 capitalize">{key.replace(/_/g, ' ')}</span>
                    <div className="w-24 h-[4px] rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(Number(value), 100)}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold w-8 text-right">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Category Distribution</CardTitle></CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-8">No categories found.</p>
            ) : (
              <div className="space-y-2">
                {categories.slice(0, 10).map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-[12px] w-32 truncate text-muted-foreground">{name}</span>
                    <div className="flex-1 h-5 rounded-sm bg-secondary overflow-hidden">
                      <div className="h-full bg-primary rounded-sm transition-all" style={{ width: `${(count / maxCatCount) * 100}%` }} />
                    </div>
                    <span className="text-[12px] font-semibold w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dictionary overview */}
      {dict && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Dictionary Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-[28px] font-bold">{dict.total_words}</p>
                <p className="text-[12px] text-muted-foreground">Total Words</p>
              </div>
              <div>
                <p className="text-[28px] font-bold text-success">{dict.total_definitions}</p>
                <p className="text-[12px] text-muted-foreground">Definitions</p>
              </div>
              <div>
                <p className="text-[28px] font-bold text-[#835C00]">{dict.isolated_words_count}</p>
                <p className="text-[12px] text-muted-foreground">Isolated Words</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Issues */}
      {(oversizedTitles > 0 || oversizedDescs > 0) && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">SEO Issues</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {oversizedTitles > 0 && (
              <div className="rounded-sm border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#835C00]" />
                  <span className="text-[13px] font-semibold">Oversized SEO Titles ({oversizedTitles})</span>
                </div>
                <div className="space-y-1">
                  {meta!.oversized_seo_titles.slice(0, 5).map((t) => (
                    <p key={t.id} className="text-[12px] text-muted-foreground truncate">{t.title}</p>
                  ))}
                  {oversizedTitles > 5 && <p className="text-[11px] text-muted-foreground">+{oversizedTitles - 5} more</p>}
                </div>
              </div>
            )}
            {oversizedDescs > 0 && (
              <div className="rounded-sm border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#835C00]" />
                  <span className="text-[13px] font-semibold">Oversized Meta Descriptions ({oversizedDescs})</span>
                </div>
                <div className="space-y-1">
                  {meta!.oversized_meta_descriptions.slice(0, 5).map((d) => (
                    <p key={d.id} className="text-[12px] text-muted-foreground truncate">{d.description}</p>
                  ))}
                  {oversizedDescs > 5 && <p className="text-[11px] text-muted-foreground">+{oversizedDescs - 5} more</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top linked words */}
      {store.linkedWords.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-[14px]">Top Linked Words</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {store.linkedWords.slice(0, 30).map((w) => (
                <Badge key={w.word} variant="outline" className="gap-1 text-[11px]">
                  <Link2 className="h-3 w-3" /> {w.word} <span className="text-muted-foreground">({w.link_count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
