import type { PublicElement } from '@/server/public-content/types'

export function SitePostRenderer({ elements }: { elements: PublicElement[] }) {
  const ordered = [...elements].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-8">
      {ordered.map((el) => {
        const c = el.content as Record<string, unknown>
        const title = (c.title as string) || ''
        const text = (c.text as string) || (c.body as string) || ''

        switch (el.element_type.toLowerCase()) {
          case 'introduction':
          case 'paragraph':
          case 'conclusion':
            return (
              <section key={el.id} id={el.id} className="space-y-2">
                {title ? <h2 className="text-[24px] font-semibold text-neutral-900">{title}</h2> : null}
                <p className="text-[16px] leading-8 text-neutral-700">{text}</p>
              </section>
            )
          case 'quote':
            return (
              <blockquote key={el.id} id={el.id} className="border-l-4 border-blue-500 pl-4 italic text-neutral-700">
                {(c.text as string) || ''}
              </blockquote>
            )
          case 'faq': {
            const items = (c.items as Array<{ question?: string; answer?: string }>) || []
            return (
              <section key={el.id} id={el.id}>
                {title ? <h2 className="text-[24px] font-semibold text-neutral-900 mb-3">{title}</h2> : null}
                <div className="space-y-3">
                  {items.map((it, i) => (
                    <div key={i} className="rounded-md border border-neutral-200 p-4">
                      <p className="font-semibold text-neutral-900">{it.question}</p>
                      <p className="mt-1 text-neutral-600">{it.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )
          }
          case 'table': {
            const headers = (c.headers as string[]) || []
            const rows = (c.rows as string[][]) || []
            return (
              <section key={el.id} id={el.id}>
                {title ? <h2 className="text-[24px] font-semibold text-neutral-900 mb-3">{title}</h2> : null}
                <div className="overflow-x-auto rounded-md border border-neutral-200">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50">
                      <tr>{headers.map((h) => <th key={h} className="text-left px-3 py-2">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className="border-t border-neutral-100">
                          {r.map((cell, j) => <td key={j} className="px-3 py-2 text-neutral-700">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )
          }
          default:
            return (
              <section key={el.id} id={el.id} className="rounded-md border border-neutral-200 p-4 bg-neutral-50">
                <p className="text-[12px] uppercase tracking-wide text-neutral-400 mb-1">{el.element_type}</p>
                {title ? <p className="font-semibold text-neutral-900">{title}</p> : null}
                {text ? <p className="mt-1 text-neutral-700">{text}</p> : <p className="text-neutral-500">Element rendered in compact mode.</p>}
              </section>
            )
        }
      })}
    </div>
  )
}
