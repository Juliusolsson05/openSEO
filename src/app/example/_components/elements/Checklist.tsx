import { CheckSquare } from 'lucide-react'

type Props = { title?: string; introduction?: string; items: string[] }

export function Checklist({ title, introduction, items }: Props) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      {title && <h3 className="mb-2 text-[18px] font-semibold text-neutral-900">{title}</h3>}
      {introduction && <p className="mb-4 text-[13px] text-neutral-500">{introduction}</p>}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[14px] text-neutral-700">
            <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
