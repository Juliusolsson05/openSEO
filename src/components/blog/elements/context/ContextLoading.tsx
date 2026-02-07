import { Skeleton } from '@/components/ui/skeleton'

interface ContextLoadingProps {
  showQuillo?: boolean
}

export function ContextLoading({ showQuillo: _showQuillo = true }: ContextLoadingProps) {
  return (
    <div className="relative mb-6 mt-2 border-l-4 border-primary bg-muted p-6">
      <div className="mb-4">
        <Skeleton className="h-8 w-[30%]" />
      </div>
      <div className="mb-4 border-t" />

      <div className="space-y-2 pl-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-5" style={{ width: `${85 - i * 5}%` }} />
        ))}
      </div>
    </div>
  )
}
