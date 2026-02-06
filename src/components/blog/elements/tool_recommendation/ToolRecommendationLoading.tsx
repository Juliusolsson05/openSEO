'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ToolRecommendationLoading() {
  return (
    <div className="relative my-5 overflow-hidden rounded-xl border-2 border-border">
      <div className="flex items-center justify-between gap-4 bg-black/5 p-6">
        <div className="w-full">
          <Skeleton className="mb-2 h-7 w-2/5" />
          <Skeleton className="h-5 w-1/5" />
        </div>
        <Skeleton className="h-[60px] w-[60px] rounded-lg" />
      </div>

      <div className="p-6">
        <div className="mb-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
        </div>

        <div className="mt-4">
          <Skeleton className="mb-3 h-5 w-1/3" />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-[90%]" />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6">
        <Skeleton className="h-9 w-[150px]" />
      </div>
    </div>
  )
}
