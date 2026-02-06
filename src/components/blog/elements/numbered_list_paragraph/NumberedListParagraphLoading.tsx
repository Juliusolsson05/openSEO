import { Skeleton } from '@/components/ui/skeleton'

export function NumberedListParagraphLoading() {
  return (
    <div className="relative space-y-3">
      <Skeleton className="h-7 w-[40%]" />
      <Skeleton className="h-5 w-[90%]" />

      <div className="ml-5 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="min-w-6 text-sm font-semibold text-muted-foreground">{i}.</span>
            <Skeleton className="h-5 w-[85%]" />
          </div>
        ))}
      </div>

      <Skeleton className="h-5 w-[70%] mt-4" />
    </div>
  )
}
