type Props = { title: string; problem?: string; solution?: string; result?: string }

export function CaseStudy({ title, problem, solution, result }: Props) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 mb-2">Case Study</p>
      <h3 className="text-[18px] font-semibold text-neutral-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {problem && (
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400 mb-1">Problem</p>
            <p className="text-[14px] text-neutral-700 leading-relaxed">{problem}</p>
          </div>
        )}
        {solution && (
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400 mb-1">Solution</p>
            <p className="text-[14px] text-neutral-700 leading-relaxed">{solution}</p>
          </div>
        )}
        {result && (
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400 mb-1">Result</p>
            <p className="text-[14px] text-neutral-700 leading-relaxed">{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}
