import { RichText } from './RichText'

type ConclusionProps = {
  title: string
  text: string
}

export function Conclusion({ title, text }: ConclusionProps) {
  return (
    <section>
      <h2 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      <RichText html={text} className="text-lg font-light leading-[1.78] text-neutral-700" />
    </section>
  )
}
