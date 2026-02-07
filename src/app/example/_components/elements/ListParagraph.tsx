import { RichText } from './RichText'

type ListParagraphProps = {
  title: string
  items: string[]
  text_after_list?: string
}

export function ListParagraph({ title, items, text_after_list }: ListParagraphProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-neutral-700">
        {items.map((item) => (
          <li key={item}>
            <RichText html={item} className="text-[15px] leading-relaxed text-neutral-700" />
          </li>
        ))}
      </ul>
      {text_after_list ? <RichText html={text_after_list} className="text-[15px] leading-relaxed text-neutral-700" /> : null}
    </section>
  )
}
