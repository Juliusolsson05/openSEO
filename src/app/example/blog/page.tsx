import Link from 'next/link'
import { getPosts } from '../_lib/data'
import { ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ExampleBlogIndex() {
  const posts = await getPosts()
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-12">
      <div className="mb-10">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-blue-600">Blog</p>
        <h1 className="mt-1 text-[32px] font-semibold tracking-tight text-neutral-900">
          Insights & Guides
        </h1>
        <p className="mt-2 text-[15px] text-neutral-500 max-w-lg">
          Practical guides, tool comparisons, and frameworks for teams that ship.
        </p>
      </div>

      {/* Featured post — full width hero */}
      {featured && (
        <Link
          href={`/example/blog/${featured.slug}`}
          className="group block mb-12"
        >
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="aspect-[16/10] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
              {featured.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.cover_image_url}
                  alt={featured.cover_image_alt || featured.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="eager"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-[14px] text-neutral-300">Featured</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600 uppercase tracking-wide">Latest</span>
                <span className="text-[12px] text-neutral-400">{featured.published_at}</span>
              </div>
              <h2 className="text-[26px] font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">
                {featured.title}
              </h2>
              <p className="mt-3 text-[15px] text-neutral-500 leading-relaxed line-clamp-3">
                {featured.excerpt}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-blue-600 group-hover:gap-2.5 transition-all">
                Read article <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {rest.length > 0 && <div className="border-t border-neutral-200 mb-10" />}

      {rest.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.id}
              href={`/example/blog/${post.slug}`}
              className="group"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 mb-4">
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover_image_url}
                    alt={post.cover_image_alt || post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-[11px] text-neutral-300">IMG</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mb-1.5">{post.published_at}</p>
              <h3 className="text-[16px] font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                {post.title}
              </h3>
              <p className="mt-2 text-[13px] text-neutral-500 leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Read more <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
