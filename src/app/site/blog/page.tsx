import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { getPosts } from '@/server/public-content/data'
import { resolvePublicCompanyId } from '@/server/public-content/company'

export const dynamic = 'force-dynamic'

export default async function SiteBlogIndex() {
  const companyId = resolvePublicCompanyId()
  if (companyId === null) notFound()
  const posts = await getPosts(companyId)
  const featured = posts[0]
  const sidebar = posts.slice(1, 4)
  const row = posts.slice(4, 10)

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-12">
      <div className="mb-10">
        <p className="text-[12px] font-semibold uppercase tracking-widest text-blue-600">Blog</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-neutral-900">Insights & Guides</h1>
        <p className="mt-1 text-[14px] text-neutral-500">Articles generated and maintained by OpenSEO.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {featured && (
          <Link href={`/site/blog/${featured.slug}`} className="group lg:col-span-2 block">
            <div className="aspect-[16/9] rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden mb-4 flex items-center justify-center">
              {featured.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.cover_image_url}
                  alt={featured.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-neutral-300 text-[14px]">Featured</span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">Latest</span>
              <span className="text-[11px] text-neutral-400">{featured.published_at}</span>
            </div>
            <h2 className="text-[22px] font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors leading-tight">{featured.title}</h2>
            <p className="mt-2 text-[14px] text-neutral-500 leading-relaxed line-clamp-2">{featured.excerpt}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-blue-600">Read post <ArrowRight className="h-3 w-3" /></span>
          </Link>
        )}

        <div className="flex flex-col gap-5">
          {sidebar.map((post) => (
            <Link key={post.id} href={`/site/blog/${post.slug}`} className="group flex gap-4">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-neutral-300 text-[10px]">IMG</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-neutral-400 mb-1">{post.published_at}</p>
                <h3 className="text-[14px] font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">{post.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="my-10 border-t border-neutral-200" />

      <div className="grid gap-6 md:grid-cols-2">
        {row.map((post) => (
          <Link key={post.id} href={`/site/blog/${post.slug}`} className="group flex gap-5 items-start">
            <div className="h-28 w-40 shrink-0 overflow-hidden rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center">
              {post.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-neutral-300 text-[10px]">IMG</span>
              )}
            </div>
            <div className="flex-1 min-w-0 py-1">
              <p className="text-[11px] text-neutral-400 mb-1">{post.published_at}</p>
              <h3 className="text-[15px] font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">{post.title}</h3>
              <p className="mt-1.5 text-[13px] text-neutral-500 line-clamp-2">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
