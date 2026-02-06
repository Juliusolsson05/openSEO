'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ListSnippetBlockLoading() {
  return (
    <div className="relative my-[30px] border-[10px] border-primary/90 bg-[rgba(211,211,211,0.44)] p-[45px]">
      <div className="mb-5">
        <Skeleton className="h-8 w-1/2" />
      </div>

      <div className="space-y-3 pl-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6" style={{ width: `${95 - i * 3}%` }} />
        ))}
      </div>
    </div>
  )
}
