import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SitePostRenderer } from '@/app/site/_components/SitePostRenderer'
import { getPost, getPosts } from '@/server/public-content/data'
import { resolvePublicCompanyId } from '@/server/public-content/company'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

function TableOfContents({ elements }: { elements: { id: string; element_type: string; content: Record<string, unknown> }[] }) {
  const headings = elements
    .filter((el) => el.content.title && typeof el.content.title === 'string')
    .map((el) => ({ id: el.id, title: el.content.title as string }))

  if (headings.length < 2) return null

  return (
    <nav className="sticky top-24">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">On this page</p>
      <ul className="space-y-1.5 border-l border-neutral-200 pl-4">
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className="block text-[13px] text-neutral-500 hover:text-blue-600 transition-colors leading-snug py-0.5">{h.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default async function SiteBlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const companyId = resolvePublicCompanyId()
  if (companyId === null) notFound()
  const post = await getPost(companyId, slug)
  if (!post) notFound()

  const allPosts = await getPosts(companyId)
  const currentIdx = allPosts.findIndex((p) => p.slug === slug)
  const prevPost = currentIdx > 0 ? allPosts[currentIdx - 1] : null
  const nextPost = currentIdx < allPosts.length - 1 ? allPosts[currentIdx + 1] : null

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-12">
      <nav className="mb-6 text-[13px] text-neutral-400">
        <Link href="/landing" className="hover:text-blue-600 transition-colors">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/site/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
        <span className="mx-1.5">/</span>
        <span className="text-neutral-600">{post.title}</span>
      </nav>

      <h1 className="text-[32px] font-semibold tracking-tight text-neutral-900 leading-tight max-w-3xl">{post.title}</h1>
      <p className="mt-2 text-[13px] text-neutral-400">{post.published_at}</p>

      <div className="mt-6 flex aspect-[16/7] items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-neutral-300 text-[14px]">Featured image</span>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <article>
          <SitePostRenderer elements={post.elements} />
        </article>
        <aside className="hidden lg:block">
          <TableOfContents elements={post.elements} />
        </aside>
      </div>

      <div className="mt-12 grid gap-4 border-t border-neutral-200 pt-8 md:grid-cols-2">
        {prevPost ? (
          <Link href={`/site/blog/${prevPost.slug}`} className="group flex items-center gap-3 rounded-lg border border-neutral-200 p-4 hover:border-blue-200 transition-colors">
            <ArrowLeft className="h-4 w-4 text-neutral-400 group-hover:text-blue-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-neutral-400">Previous</p>
              <p className="text-[13px] font-medium text-neutral-700 group-hover:text-blue-600 truncate">{prevPost.title}</p>
            </div>
          </Link>
        ) : <div />}
        {nextPost ? (
          <Link href={`/site/blog/${nextPost.slug}`} className="group flex items-center justify-end gap-3 rounded-lg border border-neutral-200 p-4 hover:border-blue-200 transition-colors text-right">
            <div className="min-w-0">
              <p className="text-[11px] text-neutral-400">Next</p>
              <p className="text-[13px] font-medium text-neutral-700 group-hover:text-blue-600 truncate">{nextPost.title}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-blue-500 shrink-0" />
          </Link>
        ) : <div />}
      </div>
    </div>
  )
}
