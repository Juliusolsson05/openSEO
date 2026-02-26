import { Skeleton } from '@/components/ui/skeleton'

export function CaseStudyLoading() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="bg-primary/20 px-8 py-7">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <Skeleton className="mb-3 h-7 w-[65%]" />
            <Skeleton className="h-4 w-[35%]" />
          </div>
          <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-[85%]" />
          </div>
          <div>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-[90%]" />
          </div>
        </div>

        <div>
          <Skeleton className="mb-3 h-3 w-20" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-secondary/30 px-6 py-5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-[70%]" />
          <Skeleton className="mt-3 ml-auto h-3 w-[30%]" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-8 py-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}
