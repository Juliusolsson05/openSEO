type CodeBlockProps = {
  title?: string
  code: string
  language?: string
}

export function CodeBlock({ title, code, language }: CodeBlockProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
      <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 text-xs text-neutral-400">
        <span>{title || 'Code snippet'}</span>
        {language ? <span className="uppercase">{language}</span> : null}
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-neutral-100">
        <code>{code}</code>
      </pre>
    </section>
  )
}
