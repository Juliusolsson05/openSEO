import { Skeleton } from '@/components/ui/skeleton'

export function TimelineLoading() {
  return (
    <div className="mx-auto max-w-3xl rounded-lg bg-background p-6">
      <Skeleton className="mb-3 h-7 w-[40%]" />
      <Skeleton className="mb-8 h-5 w-[80%]" />

      <div className="relative my-8 py-8 before:absolute before:bottom-0 before:left-1/2 before:top-0 before:w-0.5 before:-translate-x-1/2 before:bg-border max-md:before:left-0 max-md:before:translate-x-0">
        {Array.from({ length: 4 }).map((_, index) => {
          const isLeft = index % 2 === 0

          return (
            <div key={index} className="relative mb-12 flex w-full justify-center max-md:ml-6 max-md:block">
              <div
                className={[
                  'w-[45%] rounded-lg border-l-4 border-l-primary/70 bg-background p-6',
                  isLeft
                    ? 'mr-[50%] pr-8 max-md:mr-0 max-md:ml-4 max-md:w-[calc(100%-2rem)] max-md:p-4'
                    : 'ml-[50%] pl-8 max-md:ml-4 max-md:w-[calc(100%-2rem)] max-md:p-4',
                ].join(' ')}
              >
                <Skeleton className="mb-2 h-4 w-[30%]" />
                <Skeleton className="mb-2 h-5 w-[60%]" />
                <Skeleton className="h-4 w-[90%]" />
              </div>

              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary max-md:left-0 max-md:translate-x-0" />
            </div>
          )
        })}
      </div>

      <Skeleton className="mt-8 h-5 w-[70%]" />
    </div>
  )
}
