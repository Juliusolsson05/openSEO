'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ChecklistLoading() {
  return (
    <div className="relative mx-auto max-w-[800px] rounded-lg border p-6 shadow-sm">
      <Skeleton className="mb-4 h-8 w-3/5" />
      <Skeleton className="mb-6 h-5 w-4/5" />

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-5 w-[90%]" />
          </div>
        ))}
      </div>

      <Skeleton className="mt-4 h-5 w-2/5" />
    </div>
  )
}
