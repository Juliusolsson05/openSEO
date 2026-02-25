import Link from 'next/link'
import type { LinkedPost } from '@/types/blog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RelatedPostsProps {
  posts: LinkedPost[]
  variant: 'grid' | 'sidebar'
}

export default function RelatedPosts({ posts, variant }: RelatedPostsProps) {
  const relatedPosts = variant === 'sidebar' ? posts.slice(0, 5) : posts

  if (!relatedPosts.length) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-[13px] text-muted-foreground">No related posts available</p>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'sidebar') {
    return (
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-[13px] font-semibold">Related Posts</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-2.5">
          {relatedPosts.map((linked) => (
            <Link
              key={linked.id}
              href={`/blog/${linked.id}`}
              className="group flex items-center gap-2.5 rounded border border-border p-2 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
            >
              {linked.cover_image?.url ? (
                <img
                  src={linked.cover_image.url}
                  alt={linked.cover_image.description || linked.title_text}
                  className="h-11 w-14 shrink-0 rounded-sm object-cover"
                />
              ) : (
                <div className="h-11 w-14 shrink-0 rounded-sm bg-muted" />
              )}
              <p className="line-clamp-2 text-[13px] font-medium leading-snug group-hover:text-primary">
                {linked.title_text}
              </p>
            </Link>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-6">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Related Posts</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {relatedPosts.map((linked) => (
          <Card
            key={linked.id}
            className="overflow-hidden border-border transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Link href={`/blog/${linked.id}`}>
              {linked.cover_image?.url ? (
                <img
                  src={linked.cover_image.url}
                  alt={linked.cover_image.description || linked.title_text}
                  className="h-36 w-full object-cover"
                />
              ) : (
                <div className="h-36 w-full bg-muted" />
              )}
            </Link>
            <CardContent className="p-4">
              <Link href={`/blog/${linked.id}`} className="block">
                <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug hover:text-primary">
                  {linked.title_text}
                </h3>
              </Link>
              <p className="mt-1.5 line-clamp-3 text-[11px] text-muted-foreground">{linked.excerpt}</p>
              <Link href={`/blog/${linked.id}`} className="mt-2.5 inline-block text-[11px] font-semibold text-primary">
                Read More
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
