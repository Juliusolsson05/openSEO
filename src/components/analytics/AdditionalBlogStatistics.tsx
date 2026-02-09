'use client'

import { Card, CardContent } from '@/components/ui/card'
import { FileText, Send, Link2, ArrowUpRight, Wrench, FlaskConical } from 'lucide-react'

import type { BlogGeneralData } from '@/types/analytics'

interface AdditionalBlogStatisticsProps {
  generalBlogData: BlogGeneralData | null
}

export function AdditionalBlogStatistics({ generalBlogData }: AdditionalBlogStatisticsProps) {
  const total = generalBlogData?.total_blog_posts?.value ?? 0
  const published = generalBlogData?.published_blog_posts?.value ?? 0
  const rate = total > 0 ? Math.round((published / total) * 100) : 0

  const stats = [
    { title: 'Total Blog Posts', icon: FileText, value: total, rec: generalBlogData?.total_blog_posts?.value_recommendation ?? '' },
    { title: 'Published Posts', icon: Send, value: `${published} (${rate}%)`, rec: generalBlogData?.published_blog_posts?.value_recommendation ?? '' },
    { title: 'Avg Total Links', icon: Link2, value: (generalBlogData?.average_total_links?.value ?? 0).toFixed(1), rec: generalBlogData?.average_total_links?.value_recommendation ?? '' },
    { title: 'Avg Outgoing Links', icon: ArrowUpRight, value: (generalBlogData?.average_outgoing_links?.value ?? 0).toFixed(1), rec: generalBlogData?.average_outgoing_links?.value_recommendation ?? '' },
    { title: 'Avg Tool Recs', icon: Wrench, value: (generalBlogData?.average_tool_recommendations?.value ?? 0).toFixed(1), rec: generalBlogData?.average_tool_recommendations?.value_recommendation ?? '' },
    { title: 'Avg Case Studies', icon: FlaskConical, value: (generalBlogData?.average_case_studies?.value ?? 0).toFixed(1), rec: generalBlogData?.average_case_studies?.value_recommendation ?? '' },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((s) => (
        <Card key={s.title} className="rounded-sm">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <s.icon className="h-4 w-4 text-primary" />
              <p className="text-[12px] font-semibold">{s.title}</p>
            </div>
            <p className="text-[22px] font-bold leading-none">{s.value}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">{s.rec || 'No recommendation available.'}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
