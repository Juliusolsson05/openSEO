type ListParagraphProps = {
  title: string
  items: string[]
}

export function ListParagraph({ title, items }: ListParagraphProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-neutral-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
