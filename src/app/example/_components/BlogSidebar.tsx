import Link from 'next/link'

import type { ExampleElement, ExamplePost } from '../_lib/types'
import { TableOfContents } from './TableOfContents'

type BlogSidebarProps = {
  elements: ExampleElement[]
  relatedPosts: Array<Omit<ExamplePost, 'elements'>>
}

export function BlogSidebar({ elements, relatedPosts }: BlogSidebarProps) {
  return (
    <aside className="sticky top-20 space-y-6">
      <TableOfContents elements={elements} />

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Related posts</h3>
        <ul className="mt-3 space-y-3">
          {relatedPosts.map((post) => (
            <li key={post.id}>
              <Link href={`/example/blog/${post.slug}`} className="text-sm text-neutral-600 hover:text-blue-600">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Newsletter</h3>
        <p className="mt-2 text-sm text-neutral-600">Get monthly engineering and product insights from Awesome SaaS.</p>
        <button className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Subscribe
        </button>
      </div>
    </aside>
  )
}
