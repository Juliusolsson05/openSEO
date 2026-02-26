import { RichText } from './RichText'

type ListParagraphProps = {
  title: string
  items: string[]
  text_before_list?: string
  text_after_list?: string
}

export function ListParagraph({ title, items, text_before_list, text_after_list }: ListParagraphProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      {text_before_list ? <RichText html={text_before_list} className="my-4 text-lg font-light leading-[1.78] text-neutral-700" /> : null}
      <ul className="my-4 list-disc space-y-2 pl-5 text-lg font-light leading-[1.78] text-neutral-700">
        {items.map((item, index) => (
          <li key={`${index}-${item.slice(0, 20)}`}>
            <RichText html={item} className="text-lg font-light leading-[1.78] text-neutral-700" />
          </li>
        ))}
      </ul>
      {text_after_list ? <RichText html={text_after_list} className="my-4 text-lg font-light leading-[1.78] text-neutral-700" /> : null}
    </section>
  )
}
