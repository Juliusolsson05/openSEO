import { RichText } from './RichText'

type TimelineItem = { title: string; description: string }
type Props = { title?: string; items: TimelineItem[] }

export function Timeline({ title, items }: Props) {
  return (
    <div>
      {title && <h3 className="mb-4 text-[18px] font-semibold text-neutral-900">{title}</h3>}
      <div className="relative border-l-2 border-blue-200 pl-6 space-y-6">
        {items.map((item, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-blue-400 bg-white" />
            <p className="text-[14px] font-semibold text-neutral-900">{item.title}</p>
            <RichText html={item.description} className="mt-1 text-[13px] text-neutral-500 leading-relaxed" />
          </div>
        ))}
      </div>
    </div>
  )
}
