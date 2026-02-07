import type { ExampleElement } from '../_lib/types'

type TableOfContentsProps = {
  elements: ExampleElement[]
}

export function TableOfContents({ elements }: TableOfContentsProps) {
  const tocItems = elements
    .filter((element) => element.content?.title)
    .sort((a, b) => a.order - b.order)
    .map((element) => ({
      id: element.id,
      label: element.content.title as string,
    }))

  if (!tocItems.length) return null

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-neutral-900">On this page</h3>
      <ul className="mt-3 space-y-2">
        {tocItems.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="text-sm text-neutral-600 transition-colors hover:text-blue-600">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
