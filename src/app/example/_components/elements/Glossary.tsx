import { RichText } from './RichText'

type GlossaryItem = { term: string; definition: string }
type Props = { title?: string; items: GlossaryItem[] }

export function Glossary({ title, items }: Props) {
  return (
    <div>
      {title && <h3 className="mb-4 text-[18px] font-semibold text-neutral-900">{title}</h3>}
      <dl className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 px-4 py-3">
            <dt className="text-[14px] font-semibold text-neutral-900">{item.term}</dt>
            <dd className="mt-1 text-[13px] text-neutral-500 leading-relaxed">
              <RichText html={item.definition} className="text-[13px] text-neutral-500 leading-relaxed" />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
