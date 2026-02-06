import { Skeleton } from '@/components/ui/skeleton'

export function QuoteLoading() {
  return (
    <div className="rounded-lg bg-muted/60 p-6">
      <div className="flex items-start">
        <span className="relative -top-2 mr-3 text-6xl font-bold leading-none text-primary">&#8220;</span>
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-[90%]" />
          <Skeleton className="h-8 w-[70%]" />
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-6 w-[30%]" />
            <Skeleton className="h-5 w-[40%]" />
          </div>
        </div>
      </div>
    </div>
  )
}
