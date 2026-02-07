import Link from 'next/link'

import type { ExamplePost } from '../_lib/types'

type PostCardProps = {
  post: Omit<ExamplePost, 'elements'>
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex aspect-[16/9] items-center justify-center border-b border-neutral-200 bg-neutral-100 text-sm text-neutral-400">
        {post.title}
      </div>
      <div className="p-5">
        <p className="text-xs text-neutral-400">{new Date(post.published_at).toLocaleDateString()}</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-neutral-900">{post.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{post.excerpt}</p>
        <Link href={`/example/blog/${post.slug}`} className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700">
          Read more
        </Link>
      </div>
    </article>
  )
}
