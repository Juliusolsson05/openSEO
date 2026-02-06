import { Skeleton } from '@/components/ui/skeleton'

export function IntroductionLoading() {
  return (
    <div className="relative space-y-3">
      <div className="flex items-center gap-2 mt-4 mb-3">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-7 w-40" />
      </div>
      <Skeleton className="h-5 w-[95%]" />
      <Skeleton className="h-5 w-[90%]" />
      <Skeleton className="h-5 w-[85%]" />
    </div>
  )
}
