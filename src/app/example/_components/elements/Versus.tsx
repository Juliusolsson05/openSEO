type Props = { title?: string; option_a: { name: string; points: string[] }; option_b: { name: string; points: string[] } }

export function Versus({ title, option_a, option_b }: Props) {
  return (
    <div>
      {title && <h3 className="mb-4 text-[18px] font-semibold text-neutral-900">{title}</h3>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-5">
          <p className="mb-3 text-[14px] font-bold text-neutral-900">{option_a.name}</p>
          <ul className="space-y-1.5">
            {option_a.points.map((p, i) => (
              <li key={i} className="text-[13px] text-neutral-600 leading-relaxed">• {p}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-neutral-200 p-5">
          <p className="mb-3 text-[14px] font-bold text-neutral-900">{option_b.name}</p>
          <ul className="space-y-1.5">
            {option_b.points.map((p, i) => (
              <li key={i} className="text-[13px] text-neutral-600 leading-relaxed">• {p}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
