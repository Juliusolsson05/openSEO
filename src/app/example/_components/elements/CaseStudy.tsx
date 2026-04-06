import { Building2, CheckCircle2, Quote as QuoteIcon } from 'lucide-react'

import { SafeHtml } from '@/components/SafeHtml'
import { RichText } from './RichText'

type Testimonial = { quote?: string; author?: string }

type Props = {
  title: string
  problem?: string
  solution?: string
  result?: string
  clientName?: string
  industry?: string
  headerColor?: string
  results?: string[]
  testimonial?: Testimonial
}

export function CaseStudy({ title, problem, solution, result, clientName, industry, headerColor, results = [], testimonial }: Props) {
  const safeHeader = headerColor && /^#[0-9a-fA-F]{6}$/.test(headerColor) ? headerColor : '#0078D4'
  const normalizedResults = results.length ? results : result ? [result] : []

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="px-8 py-7 text-white" style={{ backgroundColor: safeHeader }}>
        <SafeHtml as="h3" profile="inline" className="text-[22px] font-semibold leading-tight" html={title} />
        {(clientName || industry) && (
          <div className="mt-3 flex items-center gap-2 text-[14px] font-medium text-white/85">
            <Building2 className="h-3.5 w-3.5" />
            {clientName ? <SafeHtml as="span" profile="inline" html={clientName} /> : null}
            {clientName && industry ? <span className="text-white/60">·</span> : null}
            {industry ? <SafeHtml as="span" profile="inline" html={industry} /> : null}
          </div>
        )}
      </div>

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {problem && (
            <div>
              <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">The Challenge</h4>
              <RichText html={problem} className="text-[15px] leading-[1.7] text-neutral-800" />
            </div>
          )}
          {solution && (
            <div>
              <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">The Solution</h4>
              <RichText html={solution} className="text-[15px] leading-[1.7] text-neutral-800" />
            </div>
          )}
        </div>

        {normalizedResults.length > 0 && (
          <div>
            <h4 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">Key Results</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {normalizedResults.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <RichText html={item} className="text-[14px] leading-snug text-neutral-800" />
                </div>
              ))}
            </div>
          </div>
        )}

        {testimonial?.quote && (
          <div className="relative rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-5">
            <QuoteIcon className="absolute left-4 top-4 h-5 w-5 text-neutral-300" />
            <SafeHtml as="blockquote" className="pl-6 text-[16px] font-light italic leading-[1.7] text-neutral-800" html={testimonial.quote} />
            {testimonial.author ? <p className="mt-3 pl-6 text-[13px] font-semibold text-neutral-500">— {testimonial.author}</p> : null}
          </div>
        )}
      </div>
    </div>
  )
}
