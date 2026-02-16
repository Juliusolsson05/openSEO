import { RichText } from './RichText'

type Props = { title?: string; items: string[] }

export function NumberedList({ title, items }: Props) {
  return (
    <section>
      {title && <h3 className="mb-3 text-[1.5rem] font-medium leading-tight text-neutral-900">{title}</h3>}
      <ol className="my-4 list-decimal space-y-2 pl-5 text-lg font-light leading-[1.78] text-neutral-700 marker:text-neutral-400">
        {items.map((item, i) => (
          <li key={i}>
            <RichText html={item} className="text-lg font-light leading-[1.78] text-neutral-700" />
          </li>
        ))}
      </ol>
    </section>
  )
}
