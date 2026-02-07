'use client'

import { Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function CodeClusterLoading() {
  return (
    <div className="relative transition-all duration-300 ease-in-out">
      <Sparkles className="absolute right-0 top-0 h-5 w-5 animate-pulse text-muted-foreground" />

      <div className="mb-[15px] rounded border-2 border-destructive bg-destructive/10 p-[15px]">
        <Skeleton className="mb-3 h-7 w-[30%]" />
        <Skeleton className="h-5 w-[20%]" />
      </div>

      <div className="mt-[15px] rounded border border-border bg-secondary p-[15px]">
        <Skeleton className="mb-2 h-6 w-[40%]" />
        <Skeleton className="mb-4 h-5 w-full" />
        <Skeleton className="mb-4 h-5 w-full" />
        <Skeleton className="h-5 w-[90%]" />
      </div>
    </div>
  )
}
