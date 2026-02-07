type Dataset = { label: string; data: number[] }
type Props = { title?: string; labels: string[]; datasets: Dataset[]; description?: string }

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

export function BarChart({ title, labels, datasets, description }: Props) {
  const max = Math.max(...datasets.flatMap((d) => d.data), 1)

  return (
    <section className="space-y-4">
      {title ? <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2> : null}
      {description ? <p className="text-neutral-600">{description}</p> : null}
      <div className="space-y-3">
        {labels.map((label, i) => (
          <div key={label} className="space-y-1">
            <span className="text-sm font-medium text-neutral-700">{label}</span>
            <div className="flex gap-1">
              {datasets.map((ds, di) => (
                <div key={ds.label} className="flex items-center gap-2 flex-1">
                  <div
                    className="h-6 rounded"
                    style={{ width: `${(ds.data[i] / max) * 100}%`, backgroundColor: COLORS[di % COLORS.length], minWidth: 4 }}
                  />
                  <span className="text-xs text-neutral-500">{ds.data[i]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {datasets.length > 1 && (
        <div className="flex gap-4 mt-2">
          {datasets.map((ds, di) => (
            <div key={ds.label} className="flex items-center gap-1.5 text-xs text-neutral-600">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[di % COLORS.length] }} />
              {ds.label}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
