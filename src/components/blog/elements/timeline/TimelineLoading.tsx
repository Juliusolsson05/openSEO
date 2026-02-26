import { Skeleton } from '@/components/ui/skeleton'

export function TimelineLoading() {
  return (
    <div>
      <Skeleton className="mb-4 h-7 w-[40%]" />
      <Skeleton className="mb-6 h-5 w-[75%]" />

      <div className="relative ml-4 border-l-2 border-border pl-8 space-y-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="relative">
            <div className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-border bg-card">
              <div className="h-2 w-2 rounded-full bg-border" />
            </div>
            <Skeleton className="mb-1.5 h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-[50%]" />
            <Skeleton className="mt-1.5 h-4 w-[85%]" />
          </div>
        ))}
      </div>
    </div>
  )
}
