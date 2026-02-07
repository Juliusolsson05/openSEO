import { FileText, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ParagraphLoadingProps {
  showQuillo?: boolean
}

export function ParagraphLoading({ showQuillo = true }: ParagraphLoadingProps) {
  return (
    <div className="relative my-[15px] rounded-md border bg-background p-4">
      {showQuillo && (
        <div className="absolute right-3 top-3 flex items-center gap-1 text-muted-foreground">
          <FileText className="h-4 w-4" />
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      <Skeleton className="mb-3 h-5 w-2/5" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  )
}
