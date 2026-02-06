'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function FAQLoading() {
  return (
    <div className="relative">
      <Skeleton className="mt-12 mb-6 h-9 w-28" />

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card px-6 py-4">
            <Skeleton className="mb-3 h-5 w-[70%]" />
            <Skeleton className="h-4 w-[90%]" />
          </div>
        ))}
      </div>
    </div>
  )
}
