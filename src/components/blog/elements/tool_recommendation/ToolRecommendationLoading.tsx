import { Skeleton } from '@/components/ui/skeleton'

export function ToolRecommendationLoading() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-5 border-b border-border px-6 py-5">
        <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="mb-1.5 h-5 w-[40%]" />
          <Skeleton className="h-3.5 w-[20%]" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      <div className="px-6 py-5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-[90%]" />
        <Skeleton className="mt-2 h-4 w-[70%]" />
      </div>

      <div className="border-t border-border px-6 py-5">
        <Skeleton className="mb-3 h-3 w-24" />
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
