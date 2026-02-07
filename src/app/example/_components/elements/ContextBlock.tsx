import { RichText } from './RichText'

type Props = { text: string; title?: string }

export function ContextBlock({ title, text }: Props) {
  return (
    <aside className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 space-y-3">
      {title ? <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">{title}</h3> : <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Context</h3>}
      <RichText html={text} className="text-neutral-600 text-sm" />
    </aside>
  )
}
