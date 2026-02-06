import { Megaphone } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface CallToActionLoadingProps {
  showQuillo?: boolean
}

export function CallToActionLoading({ showQuillo = true }: CallToActionLoadingProps) {
  return (
    <div className="relative my-[50px] w-full rounded-lg">
      <Skeleton className="h-[400px] w-full rounded-lg" />
      {showQuillo && (
        <div className="absolute right-3 top-3 text-muted-foreground">
          <Megaphone className="h-5 w-5 animate-pulse" />
        </div>
      )}
    </div>
  )
}
