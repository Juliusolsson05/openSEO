'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function AffiliateRecommendationsLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-48" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 p-3 border border-border rounded-md">
            <Skeleton className="w-16 h-16 rounded shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
