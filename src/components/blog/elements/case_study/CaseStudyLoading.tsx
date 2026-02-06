import { Skeleton } from '@/components/ui/skeleton'

interface CaseStudyLoadingProps {
  showQuillo?: boolean
}

export function CaseStudyLoading({ showQuillo: _showQuillo = true }: CaseStudyLoadingProps) {
  return (
    <div className="relative max-w-5xl overflow-visible rounded-lg bg-white shadow-md">
      <div className="flex items-center justify-between gap-5 bg-black/5 p-8">
        <div className="w-[90%] flex-1">
          <Skeleton className="mb-3 h-7 w-[70%]" />
          <Skeleton className="h-7 w-[40%] bg-white" />
        </div>
        <Skeleton className="h-20 w-20 rounded-md" />
      </div>

      <div className="p-8">
        <div className="mb-8">
          <Skeleton className="mb-3 h-6 w-[30%]" />
          <Skeleton className="h-5 w-full" />
        </div>

        <div className="mb-8">
          <Skeleton className="mb-3 h-6 w-[30%]" />
          <Skeleton className="h-5 w-full" />
        </div>

        <div className="mb-8">
          <Skeleton className="mb-3 h-6 w-[30%]" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-[90%]" />
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-md bg-slate-50 p-6">
          <Skeleton className="mb-3 h-5 w-full" />
          <Skeleton className="ml-auto h-5 w-[30%]" />
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-50 p-6">
        <Skeleton className="h-5 w-[30%]" />
        <Skeleton className="h-5 w-[30%]" />
      </div>
    </div>
  )
}
