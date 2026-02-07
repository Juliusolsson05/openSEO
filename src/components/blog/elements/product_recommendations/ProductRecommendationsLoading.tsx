import { FileText, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductRecommendationsLoadingProps {
  showQuillo?: boolean
}

export function ProductRecommendationsLoading({ showQuillo = true }: ProductRecommendationsLoadingProps) {
  return (
    <div className="relative rounded-md border bg-background p-4">
      {showQuillo && (
        <div className="absolute right-3 top-3 flex items-center gap-1 text-muted-foreground">
          <FileText className="h-4 w-4" />
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      <Skeleton className="mb-3 h-5 w-2/5" />
      <Skeleton className="mb-6 h-4 w-3/4" />

      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <Skeleton className="h-[200px] w-full md:w-1/2" />
              <div className="w-full space-y-3 md:w-1/2">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((__, j) => (
                <Skeleton key={j} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
