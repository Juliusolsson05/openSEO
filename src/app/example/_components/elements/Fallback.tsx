type FallbackProps = {
  elementType: string
}

export function Fallback({ elementType }: FallbackProps) {
  return (
    <section className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-500">
      Unsupported element type: <span className="font-medium text-neutral-700">{elementType}</span>
    </section>
  )
}
