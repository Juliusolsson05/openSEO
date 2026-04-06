import { SafeHtml } from '@/components/SafeHtml'
import { RichText } from './RichText'

type Option = { name: string; points: string[] }
type Criterion = { name?: string; details?: string[]; winner?: number }

type Props = {
  title?: string
  option_a: Option
  option_b: Option
  criteria?: Criterion[]
}

export function Versus({ title, option_a, option_b, criteria = [] }: Props) {
  const rows: Criterion[] = criteria.length
    ? criteria
    : option_a.points.map((point, idx) => ({
        name: `Point ${idx + 1}`,
        details: [point, option_b.points[idx] || ''],
      }))

  return (
    <section>
      {title ? <SafeHtml as="h3" profile="inline" className="mb-6 text-2xl font-semibold text-neutral-900" html={title} /> : null}

      <div className="my-8 overflow-hidden rounded-lg border border-neutral-200">
        <div className="grid grid-cols-2 bg-neutral-100 font-semibold md:grid-cols-[30%_1fr_1fr]">
          <div className="hidden border-b border-neutral-200 p-4 md:block" />
          <SafeHtml profile="inline" className="border-b border-neutral-200 p-4 text-center text-sm text-neutral-900" html={option_a.name} />
          <SafeHtml profile="inline" className="border-b border-neutral-200 p-4 text-center text-sm text-neutral-900" html={option_b.name} />
        </div>

        {rows.map((criterion, index) => (
          <div key={index} className="grid grid-cols-1 border-b border-neutral-200 last:border-b-0 md:grid-cols-[30%_1fr_1fr]">
            <SafeHtml profile="inline" className="bg-neutral-50 p-4 font-semibold text-neutral-800" html={criterion.name || ''} />

            {(criterion.details || []).map((detail, detailIndex) => {
              const isWinner = criterion.winner === detailIndex
              return (
                <div key={`${index}-${detailIndex}`} className={`relative p-4 ${isWinner ? 'bg-emerald-50' : 'bg-white'}`}>
                  <RichText html={detail || ''} className="text-[15px] leading-relaxed text-neutral-700" />
                  {isWinner ? <span className="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-emerald-600">✓</span> : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
