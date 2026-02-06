import { Skeleton } from '@/components/ui/skeleton'

export function QuizLoading() {
  return (
    <div className="relative my-5 rounded-lg border p-5">
      <Skeleton className="mb-6 h-7 w-1/2" />

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-8">
          <Skeleton className="mb-4 h-5 w-4/5" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((__, j) => (
              <Skeleton key={j} className="h-12 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
