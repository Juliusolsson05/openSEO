import { FileText, Loader2 } from 'lucide-react'

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

      <div className="mb-3 h-5 w-2/5 animate-pulse rounded bg-muted" />
      <div className="mb-6 h-4 w-3/4 animate-pulse rounded bg-muted" />

      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="h-[200px] w-full animate-pulse rounded bg-muted md:w-1/2" />
              <div className="w-full space-y-3 md:w-1/2">
                <div className="h-5 w-3/5 animate-pulse rounded bg-muted" />
                <div className="h-4 w-[90%] animate-pulse rounded bg-muted" />
                <div className="h-4 w-[80%] animate-pulse rounded bg-muted" />
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="h-7 w-20 animate-pulse rounded-full bg-muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
