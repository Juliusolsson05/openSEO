import { RichText } from './RichText'

type Props = { name: string; description: string; use_case?: string; url?: string }

export function ToolRecommendation({ name, description, use_case }: Props) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 mb-1">Tool Recommendation</p>
      <p className="text-[16px] font-semibold text-neutral-900">{name}</p>
      <RichText html={description} className="mt-1.5 text-[14px] text-neutral-600 leading-relaxed" />
      {use_case && <p className="mt-2 text-[13px] text-neutral-400 italic">{use_case}</p>}
    </div>
  )
}
