type TableProps = {
  title?: string
  headers: string[]
  rows: string[][]
}

export function Table({ title, headers, rows }: TableProps) {
  return (
    <section className="space-y-3 overflow-hidden rounded-xl border border-neutral-200">
      {title ? <h2 className="px-4 pt-4 text-xl font-semibold text-neutral-900">{title}</h2> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold text-neutral-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`}>
                {row.map((cell) => (
                  <td key={cell} className="px-4 py-3 text-neutral-600">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
