type IntroductionProps = {
  title: string
  text: string
}

export function Introduction({ title, text }: IntroductionProps) {
  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Introduction</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">{text}</p>
    </section>
  )
}
