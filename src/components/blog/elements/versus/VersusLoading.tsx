'use client'

import { Trophy } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function VersusLoading() {
  return (
    <div className="relative my-5 rounded-lg border p-4">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground">
        <Trophy className="h-4 w-4" />
        <span className="text-sm">Loading comparison…</span>
      </div>

      <Skeleton className="mb-4 h-7 w-2/5" />

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-2 gap-4 border-b bg-muted/40 p-4">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {Array.from({ length: 4 }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid grid-cols-1 gap-4 border-b p-4 last:border-b-0 md:grid-cols-[30%_1fr_1fr]">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[90%]" />
          </div>
        ))}
      </div>
    </div>
  )
}
