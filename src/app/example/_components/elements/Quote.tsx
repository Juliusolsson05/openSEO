import { RichText } from './RichText'

type QuoteProps = {
  text: string
  attribution?: string
}

export function Quote({ text, attribution }: QuoteProps) {
  return (
    <blockquote className="rounded-xl border-l-4 border-blue-600 bg-blue-50 px-5 py-4">
      <RichText html={text} className="text-[15px] italic leading-relaxed text-neutral-700" />
      {attribution ? <footer className="mt-3 text-sm font-medium text-neutral-600">— {attribution}</footer> : null}
    </blockquote>
  )
}
