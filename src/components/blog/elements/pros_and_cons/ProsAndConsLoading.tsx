import { Skeleton } from '@/components/ui/skeleton'

export function ProsAndConsLoading() {
  return (
    <div className="relative my-5 rounded-lg border p-4">
      <Skeleton className="mb-6 h-7 w-2/5" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <Skeleton className="mb-4 h-6 w-1/4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`pro-${i}`} className="h-5 w-[90%]" />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="mb-4 h-6 w-1/4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`con-${i}`} className="h-5 w-[90%]" />
            ))}
          </div>
        </div>
      </div>

      <Skeleton className="mt-6 h-5 w-4/5" />
    </div>
  )
}
