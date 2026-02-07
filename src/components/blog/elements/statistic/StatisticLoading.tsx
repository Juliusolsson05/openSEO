import { Skeleton } from '@/components/ui/skeleton'

interface StatisticLoadingProps {
  showQuillo?: boolean
}

export function StatisticLoading({ showQuillo: _showQuillo = true }: StatisticLoadingProps) {
  return (
    <div className="my-5 rounded-lg bg-secondary p-[30px] text-center">
      <div className="mx-auto mb-4">
        <Skeleton className="mx-auto h-7 w-[40%]" />
      </div>

      <div className="my-5 flex justify-center">
        <Skeleton className="h-[200px] w-[200px] rounded-full" />
      </div>

      <Skeleton className="mx-auto mt-4 h-6 w-[80%]" />
    </div>
  )
}
