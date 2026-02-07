import { BarChart3 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function BarChartLoading() {
  return (
    <div className="relative my-5 rounded-lg bg-secondary p-8">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground">
        <BarChart3 className="h-4 w-4" />
        <span className="text-sm">Loading bar chart…</span>
      </div>

      <Skeleton className="mb-6 h-7 w-2/5" />
      <Skeleton className="mb-6 h-5 w-4/5" />

      <div className="mb-6 grid h-[320px] grid-cols-5 items-end gap-6 rounded border border-slate-200 bg-white/50 p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            <Skeleton className="w-10" style={{ height: `${80 + ((index * 37) % 120)}px` }} />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>

      <Skeleton className="h-5 w-3/4" />
    </div>
  )
}
