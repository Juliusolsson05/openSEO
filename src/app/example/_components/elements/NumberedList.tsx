type Props = { title?: string; items: string[] }

export function NumberedList({ title, items }: Props) {
  return (
    <div>
      {title && <h3 className="mb-3 text-[18px] font-semibold text-neutral-900">{title}</h3>}
      <ol className="list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-neutral-700 marker:text-neutral-400">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    </div>
  )
}
