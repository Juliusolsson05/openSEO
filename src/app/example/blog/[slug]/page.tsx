import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BlogSidebar } from '../../_components/BlogSidebar'
import { PostRenderer } from '../../_components/PostRenderer'
import { getPost, getPosts } from '../../_lib/data'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ExampleBlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPost(slug)

  if (!post) notFound()

  const relatedPosts = getPosts().filter((item) => item.slug !== slug).slice(0, 3)

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-12">
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/example" className="hover:text-blue-600">Home</Link> /{' '}
        <Link href="/example/blog" className="hover:text-blue-600">Blog</Link> /{' '}
        <span className="text-neutral-700">{post.title}</span>
      </nav>

      <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">{post.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">{new Date(post.published_at).toLocaleDateString()}</p>

      <div className="mt-6 flex aspect-[16/7] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-400">
        {post.title}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <PostRenderer elements={post.elements} />
        <div className="hidden lg:block">
          <BlogSidebar elements={post.elements} relatedPosts={relatedPosts} />
        </div>
      </div>

      <section className="mt-16 border-t border-neutral-200 pt-8">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Related posts</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {relatedPosts.map((related) => (
            <Link
              key={related.id}
              href={`/example/blog/${related.slug}`}
              className="rounded-lg border border-neutral-200 p-4 hover:border-blue-200"
            >
              <p className="text-sm font-medium text-neutral-900">{related.title}</p>
              <p className="mt-1 text-xs text-neutral-500">{related.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
