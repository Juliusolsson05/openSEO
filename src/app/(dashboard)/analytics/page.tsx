'use client'

import { useEffect, useState } from 'react'
import { useAnalyticsStore } from '@/stores/analytics-store'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { GeneralScore } from '@/components/analytics/GeneralScore'
import { BlogPostCalendar } from '@/components/analytics/BlogPostCalendar'
import { GeneralBreakdown } from '@/components/analytics/GeneralBreakdown'
import { AdditionalBlogStatistics } from '@/components/analytics/AdditionalBlogStatistics'
import { BlogCategoryDistribution } from '@/components/analytics/BlogCategoryDistribution'
import { BlogNetworkPreview } from '@/components/analytics/BlogNetworkPreview'
import { BlogStatistics } from '@/components/analytics/BlogStatistics'
import { KeywordsOverview } from '@/components/analytics/KeywordsOverview'
import { DictionaryOverview } from '@/components/analytics/DictionaryOverview'
import { PostMeta } from '@/components/analytics/PostMeta'
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview'

function SectionLabel({ children }: { children: string }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{children}</p>
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-72" />
      <div className="grid grid-cols-12 gap-4">
        <Skeleton className="col-span-12 h-72 lg:col-span-4" />
        <Skeleton className="col-span-12 h-72 lg:col-span-8" />
        <Skeleton className="col-span-12 h-64" />
        <Skeleton className="col-span-12 h-64 lg:col-span-4" />
        <Skeleton className="col-span-12 h-64 lg:col-span-8" />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [fullView, setFullView] = useState(false)
  const {
    isLoading,
    error,
    fetchAnalyticsData,
    generalBlogData,
    blogTitles,
    dictionaryData,
    blogMetaData,
    linkedWords,
  } = useAnalyticsStore()

  useEffect(() => {
    void fetchAnalyticsData()
  }, [fetchAnalyticsData])

  if (isLoading) return <AnalyticsSkeleton />

  if (error) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-[14px] font-semibold">Analytics Unavailable</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4 gap-1.5" onClick={() => void fetchAnalyticsData()}>
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const scoreBreakdown = generalBlogData?.score_breakdown ?? {}

  return (
    <div className="space-y-4 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-[16px] font-semibold">Analytics</h1>
        <Button variant={fullView ? 'secondary' : 'default'} onClick={() => setFullView((v) => !v)}>
          {fullView ? 'This looks scary, bring me back 😨' : 'I know what I am doing 😎'}
        </Button>
      </div>

      {!fullView ? (
        <AnalyticsOverview generalBlogData={generalBlogData} scoreBreakdown={scoreBreakdown} />
      ) : (
        <div className="space-y-4">
          <SectionLabel>GENERAL</SectionLabel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4">
              <GeneralScore generalSeoScore={generalBlogData?.general_seo_score ?? 0} scoreBreakdown={scoreBreakdown} />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <BlogPostCalendar blogTitles={blogTitles} />
            </div>
          </div>

          <SectionLabel>GENERAL BREAKDOWN</SectionLabel>
          <GeneralBreakdown generalBlogData={generalBlogData} />

          <SectionLabel>CATEGORY AND FREQUENCY</SectionLabel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4">
              <BlogCategoryDistribution blogTitles={blogTitles} />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <AdditionalBlogStatistics generalBlogData={generalBlogData} />
            </div>
          </div>

          <SectionLabel>RELATED POSTS INTERNAL LINKING</SectionLabel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-4">
              <BlogNetworkPreview blogTitles={blogTitles} />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <BlogStatistics blogTitles={blogTitles} />
            </div>
          </div>

          <SectionLabel>DICTIONARY OVERVIEW</SectionLabel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-8">
              <KeywordsOverview linkedWords={linkedWords} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <DictionaryOverview dictionaryData={dictionaryData} />
            </div>
          </div>

          <SectionLabel>SEO ISSUES</SectionLabel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-8">
              <PostMeta
                oversizedSeoTitles={blogMetaData?.oversized_seo_titles ?? []}
                oversizedMetaDescriptions={blogMetaData?.oversized_meta_descriptions ?? []}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
