import { Skeleton } from '@/components/ui/skeleton'

export function GlossaryLoading() {
  return (
    <div>
      <Skeleton className="mb-4 h-7 w-48" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border p-4">
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="mt-1 h-3.5 w-[75%]" />
          </div>
        ))}
      </div>
    </div>
  )
}
