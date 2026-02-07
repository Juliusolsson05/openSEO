import { Check, X } from 'lucide-react'

type Props = { title?: string; pros: string[]; cons: string[] }

export function ProsAndCons({ title, pros, cons }: Props) {
  return (
    <div>
      {title && <h3 className="mb-4 text-[18px] font-semibold text-neutral-900">{title}</h3>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-5">
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-emerald-700">Pros</p>
          <ul className="space-y-2">
            {pros.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px] text-neutral-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-5">
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-red-700">Cons</p>
          <ul className="space-y-2">
            {cons.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px] text-neutral-700">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
