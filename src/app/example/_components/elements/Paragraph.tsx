import { SafeHtml } from '@/components/SafeHtml'

type ParagraphProps = {
  title?: string
  text: string
}

export function Paragraph({ title, text }: ParagraphProps) {
  return (
    <section className="space-y-3">
      {title ? <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2> : null}
      <SafeHtml className="prose prose-neutral max-w-none text-lg font-light leading-[1.78] text-neutral-700" html={text} />
    </section>
  )
}
