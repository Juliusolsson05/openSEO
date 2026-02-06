import { Skeleton } from '@/components/ui/skeleton'

export function SnippetBlockLoading() {
  return (
    <div className="relative my-[30px] border-[10px] border-primary bg-[rgba(211,211,211,0.44)] p-[45px]">
      <Skeleton className="mb-5 h-8 w-1/2" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-5"
            style={{ width: `${95 - (index + 1) * 3}%`, marginLeft: '20px' }}
          />
        ))}
      </div>
    </div>
  )
}
