import { ImageIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ImageLoadingProps {
  showQuillo?: boolean
}

export function ImageLoading({ showQuillo = true }: ImageLoadingProps) {
  return (
    <div className="relative my-8 h-[250px] w-full overflow-hidden rounded-lg md:h-[400px]">
      <Skeleton className="h-full w-full rounded-lg" />
      {showQuillo && (
        <div className="absolute right-3 top-3 text-muted-foreground">
          <ImageIcon className="h-5 w-5 animate-pulse" />
        </div>
      )}
    </div>
  )
}
