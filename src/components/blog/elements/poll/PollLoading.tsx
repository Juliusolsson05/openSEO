import { Skeleton } from '@/components/ui/skeleton'

export function PollLoading() {
  return (
    <div className="relative my-5 rounded-lg border p-5">
      <Skeleton className="mb-5 h-7 w-3/5" />

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      <Skeleton className="mt-5 h-5 w-2/5" />
    </div>
  )
}
