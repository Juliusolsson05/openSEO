import { SafeHtml } from '@/components/SafeHtml'
import { RichText } from './RichText'

type Props = { value: string; label: string; description?: string }

export function Statistic({ value, label, description }: Props) {
  const numericValue = Number.parseFloat(String(value).replace('%', '').trim())
  const hasValidPercentage = Number.isFinite(numericValue) && numericValue >= 0 && numericValue <= 100

  const radius = 45
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - (hasValidPercentage ? numericValue : 0) / 100)

  return (
    <div className="rounded-lg bg-neutral-100/70 p-6">
      {label ? <SafeHtml as="h3" profile="inline" className="mb-4 text-center text-2xl font-semibold text-neutral-900" html={label} /> : null}

      <div className="my-5 flex justify-center">
        {hasValidPercentage ? (
          <svg className="h-auto w-full max-w-[200px]" width="200" height="200" viewBox="0 0 100 100" aria-label={`${numericValue}%`}>
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#e6e6e6" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#00008B"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="700" fill="#111827">
              {numericValue}%
            </text>
          </svg>
        ) : (
          <p className="text-center text-[48px] font-bold leading-none text-[#00008B]">{value}</p>
        )}
      </div>

      {description ? (
        <RichText html={description} className="mt-4 text-center text-[1.125rem] font-light leading-[1.75] text-neutral-700" />
      ) : null}
    </div>
  )
}
