type FaqItem = { question: string; answer: string }

type FaqProps = {
  title?: string
  items: FaqItem[]
}

export function Faq({ title = 'Frequently asked questions', items }: FaqProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <details key={item.question} className="group rounded-lg border border-neutral-200 bg-white p-4">
            <summary className="cursor-pointer list-none pr-6 text-sm font-medium text-neutral-900">
              {item.question}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
