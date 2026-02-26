'use client'

import { useMemo } from 'react'
import type { BlogPostElement } from '@/types/blog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Keyword = {
  keyword: string
  description: string
  count: number
}

interface BlogGlossaryProps {
  elements: BlogPostElement[]
}

export default function BlogGlossary({ elements }: BlogGlossaryProps) {
  const keywordCountMap: Record<string, Keyword> = {}

  elements.forEach((element) => {
    const textArray = element.hyperlink?.matched_keywords?.text
    if (!Array.isArray(textArray)) return

    textArray.forEach((keyword) => {
      if (!keywordCountMap[keyword.keyword]) {
        keywordCountMap[keyword.keyword] = {
          keyword: keyword.keyword,
          description: keyword.description,
          count: 0,
        }
      }

      keywordCountMap[keyword.keyword].count += keyword.matched_positions?.length ?? 0
    })
  })

  const topKeywords = Object.values(keywordCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-[13px] font-semibold">Glossary</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2.5">
        {topKeywords.length > 0 ? (
          topKeywords.map((item) => (
            <div key={item.keyword} className="border-b border-border pb-2 last:border-0 last:pb-0">
              <p className="text-[13px] font-semibold text-primary">{item.keyword}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))
        ) : (
          <p className="text-[13px] text-muted-foreground">No linked keywords</p>
        )}
      </CardContent>
    </Card>
  )
}
