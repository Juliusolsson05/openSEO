import { Table2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function TableLoading() {
  return (
    <div className="relative my-5 rounded-lg border p-4">
      <div className="mb-4 flex items-center gap-2 text-muted-foreground">
        <Table2 className="h-4 w-4" />
        <span className="text-sm">Loading table…</span>
      </div>

      <Skeleton className="mb-4 h-7 w-1/3" />

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-4 gap-4 border-b bg-muted/40 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 w-4/5" />
          ))}
        </div>

        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid grid-cols-4 gap-4 border-b p-4 last:border-b-0">
            {Array.from({ length: 4 }).map((_, cellIndex) => (
              <Skeleton key={`cell-${rowIndex}-${cellIndex}`} className="h-4 w-4/5" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
