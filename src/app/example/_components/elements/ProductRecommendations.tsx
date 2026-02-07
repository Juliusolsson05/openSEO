import { RichText } from './RichText'

type Product = { name: string; description: string; url?: string }
type Props = { title?: string; introduction?: string; products: Product[] }

export function ProductRecommendations({ title, introduction, products }: Props) {
  return (
    <div>
      {title && <h3 className="mb-2 text-[18px] font-semibold text-neutral-900">{title}</h3>}
      {introduction && <RichText html={introduction} className="mb-4 text-[14px] text-neutral-500" />}
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((p, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 p-4 hover:border-blue-200 transition-colors">
            <p className="text-[14px] font-semibold text-neutral-900">{p.name}</p>
            <RichText html={p.description} className="mt-1 text-[13px] text-neutral-500 leading-relaxed" />
          </div>
        ))}
      </div>
    </div>
  )
}
