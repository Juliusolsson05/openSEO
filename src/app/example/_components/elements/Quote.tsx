import { RichText } from './RichText'

type QuoteProps = {
  text: string
  attribution?: string
  description?: string
}

export function Quote({ text, attribution, description }: QuoteProps) {
  return (
    <div className="rounded-lg bg-neutral-100/70 p-6">
      <div className="flex items-start">
        <span className="relative -top-2 mr-3 text-6xl font-bold leading-none text-blue-600">&#8220;</span>
        <div className="min-w-0 flex-1">
          <RichText html={text} className="ml-2 text-3xl font-normal leading-tight text-neutral-900" />
          {attribution ? (
            <p className="mt-4 text-2xl text-neutral-900">
              — <span className="underline">{attribution}</span>
              {description ? <span className="ml-1 text-base font-light text-neutral-600">, {description}</span> : null}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
