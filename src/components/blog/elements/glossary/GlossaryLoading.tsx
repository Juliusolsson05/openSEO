import { Skeleton } from '@/components/ui/skeleton'

export function GlossaryLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-9 w-56" />

      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="mb-2 h-5 w-40" />
            <Skeleton className="ml-6 h-4 w-[85%]" />
          </div>
        ))}
      </div>
    </div>
  )
}
