type Props = { title?: string; text: string }

export function SnippetBlock({ title, text }: Props) {
  return (
    <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50/50 px-5 py-4">
      {title && <p className="mb-1 text-[13px] font-semibold text-blue-700">{title}</p>}
      <p className="text-[14px] text-neutral-700 leading-relaxed">{text}</p>
    </div>
  )
}
