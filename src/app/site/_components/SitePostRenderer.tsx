import type { PublicElement } from '@/server/public-content/types'

type Dict = Record<string, unknown>

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

export function SitePostRenderer({ elements }: { elements: PublicElement[] }) {
  const ordered = [...elements].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-8">
      {ordered.map((el) => {
        const c = el.content as Dict
        const title = str(c.title)
        const text = str(c.text) || str(c.body)

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
                {str(c.text)}
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

          case 'list_paragraph': {
            const items = strArray(c.items)
            const before = str(c.text_before_list)
            const after = str(c.text_after_list)
            return (
              <section key={el.id} id={el.id} className="space-y-3">
                {title ? <h2 className="text-[24px] font-semibold text-neutral-900">{title}</h2> : null}
                {before ? <p className="text-[16px] leading-8 text-neutral-700">{before}</p> : null}
                <ul className="list-disc space-y-2 pl-5 text-[16px] leading-[1.78] text-neutral-700">
                  {items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                {after ? <p className="text-[16px] leading-8 text-neutral-700">{after}</p> : null}
              </section>
            )
          }

          case 'numbered_list_paragraph': {
            const items = strArray(c.items)
            return (
              <section key={el.id} id={el.id} className="space-y-3">
                {title ? <h2 className="text-[24px] font-semibold text-neutral-900">{title}</h2> : null}
                <ol className="list-decimal space-y-2 pl-5 text-[16px] leading-[1.78] text-neutral-700">
                  {items.map((item, i) => <li key={i}>{item}</li>)}
                </ol>
              </section>
            )
          }

          case 'checklist': {
            const items = strArray(c.items)
            const introduction = str(c.introduction)
            return (
              <section key={el.id} id={el.id} className="rounded-lg border border-neutral-200 bg-white p-6">
                {title ? <h3 className="mb-2 text-[18px] font-semibold text-neutral-900">{title}</h3> : null}
                {introduction ? <p className="mb-4 text-[13px] text-neutral-500">{introduction}</p> : null}
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] text-neutral-700">
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-blue-500" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )
          }

          case 'statistic': {
            const value = str(c.value)
            const label = str(c.label)
            const description = str(c.description)
            return (
              <section key={el.id} id={el.id} className="rounded-lg bg-neutral-100/70 p-6 text-center">
                {label ? <h3 className="mb-4 text-2xl font-semibold text-neutral-900">{label}</h3> : null}
                <p className="text-[48px] font-bold leading-none text-[#00008B]">{value}</p>
                {description ? <p className="mt-4 text-[1.05rem] font-light leading-[1.75] text-neutral-700">{description}</p> : null}
              </section>
            )
          }

          case 'pros_and_cons': {
            const pros = strArray(c.pros)
            const cons = strArray(c.cons)
            const before = str(c.text_before)
            const after = str(c.text_after)
            return (
              <section key={el.id} id={el.id}>
                {title ? <h3 className="mb-6 text-2xl font-semibold text-neutral-900">{title}</h3> : null}
                {before ? <p className="my-6 text-[1.05rem] leading-relaxed text-neutral-600">{before}</p> : null}
                <div className="my-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 border-b-2 border-emerald-600 pb-2 text-xl font-semibold text-emerald-600">Pros</h4>
                    <ul className="space-y-3">
                      {pros.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2 inline-block w-5 font-bold text-emerald-600">+</span>
                          <span className="text-[15px] leading-relaxed text-neutral-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 border-b-2 border-rose-600 pb-2 text-xl font-semibold text-rose-600">Cons</h4>
                    <ul className="space-y-3">
                      {cons.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2 inline-block w-5 font-bold text-rose-600">-</span>
                          <span className="text-[15px] leading-relaxed text-neutral-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {after ? <p className="my-6 text-[1.05rem] leading-relaxed text-neutral-600">{after}</p> : null}
              </section>
            )
          }

          case 'versus': {
            const optionA = (c.option_a as { name?: string; points?: string[] }) || { name: '', points: [] }
            const optionB = (c.option_b as { name?: string; points?: string[] }) || { name: '', points: [] }
            const aPoints = strArray(optionA.points)
            const bPoints = strArray(optionB.points)
            const rowsLen = Math.max(aPoints.length, bPoints.length)
            return (
              <section key={el.id} id={el.id}>
                {title ? <h3 className="mb-6 text-2xl font-semibold text-neutral-900">{title}</h3> : null}
                <div className="my-8 overflow-hidden rounded-lg border border-neutral-200">
                  <div className="grid grid-cols-2 bg-neutral-100 font-semibold">
                    <div className="border-b border-neutral-200 p-4 text-center text-sm text-neutral-900">{str(optionA.name)}</div>
                    <div className="border-b border-neutral-200 p-4 text-center text-sm text-neutral-900">{str(optionB.name)}</div>
                  </div>
                  {Array.from({ length: rowsLen }).map((_, i) => (
                    <div key={i} className="grid grid-cols-2 border-b border-neutral-200 last:border-b-0">
                      <div className="p-4 text-[15px] leading-relaxed text-neutral-700">{aPoints[i] || ''}</div>
                      <div className="p-4 text-[15px] leading-relaxed text-neutral-700">{bPoints[i] || ''}</div>
                    </div>
                  ))}
                </div>
              </section>
            )
          }

          case 'timeline': {
            const items = (c.items as Array<{ title?: string; description?: string; date?: string }>) || []
            return (
              <section key={el.id} id={el.id}>
                {title ? <h3 className="mb-4 text-[22px] font-semibold leading-tight tracking-tight text-neutral-900">{title}</h3> : null}
                <div className="relative ml-4 space-y-8 border-l-2 border-blue-200 pl-8">
                  {items.map((item, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-2 border-blue-600 bg-white" />
                      {item.date ? <div className="mb-1.5 inline-block rounded-full bg-blue-50 px-3 py-0.5 text-[12px] font-semibold text-blue-700">{item.date}</div> : null}
                      {item.title ? <p className="text-[17px] font-semibold leading-snug text-neutral-900">{item.title}</p> : null}
                      {item.description ? <p className="mt-1.5 text-[16px] font-light leading-[1.7] text-neutral-600">{item.description}</p> : null}
                    </div>
                  ))}
                </div>
              </section>
            )
          }

          case 'case_study': {
            const problem = str(c.problem)
            const solution = str(c.solution)
            const results = strArray(c.results).length ? strArray(c.results) : (str(c.result) ? [str(c.result)] : [])
            const clientName = str(c.clientName) || str(c.client_name)
            const industry = str(c.industry)
            const testimonial = (c.testimonial as { quote?: string; author?: string }) || {}
            return (
              <section key={el.id} id={el.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="px-8 py-7 text-white" style={{ backgroundColor: '#0078D4' }}>
                  {title ? <h3 className="text-[22px] font-semibold leading-tight">{title}</h3> : null}
                  {(clientName || industry) ? (
                    <div className="mt-3 text-[14px] font-medium text-white/85">
                      {clientName}{clientName && industry ? ' · ' : ''}{industry}
                    </div>
                  ) : null}
                </div>
                <div className="space-y-6 px-8 py-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {problem ? (
                      <div>
                        <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">The Challenge</h4>
                        <p className="text-[15px] leading-[1.7] text-neutral-800">{problem}</p>
                      </div>
                    ) : null}
                    {solution ? (
                      <div>
                        <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">The Solution</h4>
                        <p className="text-[15px] leading-[1.7] text-neutral-800">{solution}</p>
                      </div>
                    ) : null}
                  </div>
                  {results.length > 0 ? (
                    <div>
                      <h4 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-neutral-500">Key Results</h4>
                      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {results.map((r, i) => (
                          <li key={i} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] leading-snug text-neutral-800">{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {testimonial.quote ? (
                    <blockquote className="rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-5 text-[16px] font-light italic leading-[1.7] text-neutral-800">
                      &ldquo;{testimonial.quote}&rdquo;
                      {testimonial.author ? <div className="mt-3 text-[13px] font-semibold not-italic text-neutral-500">&mdash; {testimonial.author}</div> : null}
                    </blockquote>
                  ) : null}
                </div>
              </section>
            )
          }

          case 'call_to_action':
          case 'cta': {
            const buttonLabel = str(c.button_label) || 'Learn more'
            const buttonHref = str(c.button_href) || str(c.link) || str(c.target_url) || '/site/blog'
            const description = str(c.description) || text
            return (
              <section key={el.id} id={el.id} className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                {title ? <h3 className="text-xl font-semibold tracking-tight text-neutral-900">{title}</h3> : null}
                {description ? <p className="mt-2 text-sm leading-relaxed text-neutral-700">{description}</p> : null}
                <a
                  href={buttonHref}
                  className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {buttonLabel}
                </a>
              </section>
            )
          }

          case 'image': {
            const url = str(c.url)
            const alt = str(c.alt) || 'Post image'
            const caption = str(c.caption)
            return (
              <figure key={el.id} id={el.id} className="space-y-2">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={alt} className="w-full rounded-xl border border-neutral-200" />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-sm text-neutral-400">
                    {alt}
                  </div>
                )}
                {caption ? <figcaption className="text-xs text-neutral-500">{caption}</figcaption> : null}
              </figure>
            )
          }

          case 'featured_snippet_block':
          case 'list_featured_snippet_block': {
            const items = strArray(c.items)
            return (
              <section key={el.id} id={el.id} className="space-y-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-6">
                {title ? <h2 className="text-xl font-semibold text-blue-900">{title}</h2> : null}
                {text ? <p className="text-[1.05rem] leading-relaxed text-blue-800">{text}</p> : null}
                {items.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5 text-[1.05rem] leading-relaxed text-blue-800">
                    {items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : null}
              </section>
            )
          }

          case 'glossary': {
            const items = (c.items as Array<{ term?: string; definition?: string }>) || []
            return (
              <section key={el.id} id={el.id}>
                {title ? <h3 className="mb-4 text-[18px] font-semibold text-neutral-900">{title}</h3> : null}
                <dl className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="rounded-lg border border-neutral-200 px-4 py-3">
                      <dt className="text-[14px] font-semibold text-neutral-900">{item.term}</dt>
                      <dd className="mt-1 text-[13px] text-neutral-500 leading-relaxed">{item.definition}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )
          }

          default:
            // Last-resort fallback for truly unknown types. Render title + text cleanly
            // instead of the debug box so real content still appears readable.
            return (
              <section key={el.id} id={el.id} className="space-y-2">
                {title ? <h2 className="text-[22px] font-semibold text-neutral-900">{title}</h2> : null}
                {text ? <p className="text-[16px] leading-8 text-neutral-700">{text}</p> : null}
              </section>
            )
        }
      })}
    </div>
  )
}
