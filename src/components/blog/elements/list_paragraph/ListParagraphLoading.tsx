'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ListParagraphLoading() {
  return (
    <div className="relative">
      <div className="mb-3">
        <Skeleton className="h-6 w-2/5" />
      </div>

      <div className="mb-4">
        <Skeleton className="h-5 w-[90%]" />
      </div>

      <div className="space-y-2 pl-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-[85%]" />
        ))}
      </div>

      <div className="mt-4">
        <Skeleton className="h-5 w-[70%]" />
      </div>
    </div>
  )
}
