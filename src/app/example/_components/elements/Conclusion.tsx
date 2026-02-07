type ConclusionProps = {
  title: string
  text: string
}

export function Conclusion({ title, text }: ConclusionProps) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Conclusion</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">{text}</p>
    </section>
  )
}
