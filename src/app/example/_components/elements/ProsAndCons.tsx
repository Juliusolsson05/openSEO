import { SafeHtml } from '@/components/SafeHtml'
import { RichText } from './RichText'

type Props = { title?: string; pros: string[]; cons: string[]; text_before?: string; text_after?: string }

export function ProsAndCons({ title, pros, cons, text_before, text_after }: Props) {
  return (
    <section>
      {title ? <SafeHtml as="h3" profile="inline" className="mb-6 text-2xl font-semibold text-neutral-900" html={title} /> : null}
      {text_before ? <RichText html={text_before} className="my-6 text-[1.05rem] leading-relaxed text-neutral-600" /> : null}

      <div className="my-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h4 className="mb-3 border-b-2 border-emerald-600 pb-2 text-xl font-semibold text-emerald-600">Pros</h4>
          <ul className="space-y-3">
            {pros.map((item, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2 inline-block w-5 font-bold text-emerald-600">✓</span>
                <RichText html={item} className="text-[15px] leading-relaxed text-neutral-700" />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 border-b-2 border-rose-600 pb-2 text-xl font-semibold text-rose-600">Cons</h4>
          <ul className="space-y-3">
            {cons.map((item, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2 inline-block w-5 font-bold text-rose-600">✕</span>
                <RichText html={item} className="text-[15px] leading-relaxed text-neutral-700" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {text_after ? <RichText html={text_after} className="my-6 text-[1.05rem] leading-relaxed text-neutral-600" /> : null}
    </section>
  )
}
