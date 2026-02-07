import { RichText } from './RichText'

type Props = { text: string; title?: string }

export function FeaturedSnippet({ title, text }: Props) {
  return (
    <section className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-6 space-y-3">
      {title ? <h2 className="text-xl font-semibold text-blue-900">{title}</h2> : null}
      <RichText html={text} className="text-blue-800" />
    </section>
  )
}
