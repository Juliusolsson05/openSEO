import { SafeHtml } from '@/components/SafeHtml'
import { RichText } from './RichText'

type TimelineItem = { title: string; description: string; date?: string }
type Props = { title?: string; items: TimelineItem[] }

export function Timeline({ title, items }: Props) {
  return (
    <section>
      {title && <SafeHtml as="h3" profile="inline" className="mb-4 text-[22px] font-semibold leading-tight tracking-tight text-neutral-900" html={title} />}
      <div className="relative ml-4 space-y-8 border-l-2 border-blue-200 pl-8">
        {items.map((item, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
              <div className="h-2 w-2 rounded-full bg-blue-600" />
            </div>
            {item.date ? <SafeHtml profile="inline" className="mb-1.5 inline-block rounded-full bg-blue-50 px-3 py-0.5 text-[12px] font-semibold text-blue-700" html={item.date} /> : null}
            <SafeHtml as="p" profile="inline" className="text-[17px] font-semibold leading-snug text-neutral-900" html={item.title} />
            <RichText html={item.description} className="mt-1.5 text-[16px] font-light leading-[1.7] text-neutral-600" />
          </div>
        ))}
      </div>
    </section>
  )
}
