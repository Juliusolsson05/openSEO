'use client'

import { Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function ConclusionLoading() {
  return (
    <div className="relative space-y-3">
      <Sparkles className="absolute right-0 top-0 h-5 w-5 animate-pulse text-muted-foreground" />
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-[95%]" />
    </div>
  )
}
