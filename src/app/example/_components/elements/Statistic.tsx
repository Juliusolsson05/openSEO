import { RichText } from './RichText'

type Props = { value: string; label: string; description?: string }

export function Statistic({ value, label, description }: Props) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
      <p className="text-[36px] font-bold text-blue-600">{value}</p>
      <p className="mt-1 text-[14px] font-semibold text-neutral-900">{label}</p>
      {description && <RichText html={description} className="mt-2 text-[13px] text-neutral-500" />}
    </div>
  )
}
