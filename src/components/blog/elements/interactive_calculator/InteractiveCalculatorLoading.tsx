import { Skeleton } from '@/components/ui/skeleton'

export function InteractiveCalculatorLoading() {
  return (
    <div className="relative my-5 rounded-lg border p-5">
      <Skeleton className="mb-3 h-7 w-1/2" />
      <Skeleton className="mb-4 h-5 w-4/5" />
      <Skeleton className="h-12 w-1/3" />
    </div>
  )
}
