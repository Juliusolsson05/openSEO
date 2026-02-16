import { RichText } from './RichText'

type TableProps = {
  title?: string
  headers: string[]
  rows: string[][]
  text_before?: string
  text_after?: string
}

export function Table({ title, headers, rows, text_before, text_after }: TableProps) {
  return (
    <section>
      {title ? <h3 className="mb-6 text-2xl font-semibold text-neutral-900" dangerouslySetInnerHTML={{ __html: title }} /> : null}
      {text_before ? <RichText html={text_before} className="my-6 text-[1.05rem] leading-relaxed text-neutral-600" /> : null}

      <div className="my-8 overflow-x-auto rounded-lg border border-neutral-200 shadow-sm">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-neutral-100">
              {headers.map((header, i) => (
                <th key={i} className="border-b border-neutral-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-800" dangerouslySetInnerHTML={{ __html: header }} />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/60'}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border-b border-neutral-100 px-4 py-3 text-sm text-neutral-700" dangerouslySetInnerHTML={{ __html: cell }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {text_after ? <RichText html={text_after} className="my-6 text-[1.05rem] leading-relaxed text-neutral-600" /> : null}
    </section>
  )
}
