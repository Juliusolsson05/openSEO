import { PostCard } from '../_components/PostCard'
import { getPosts } from '../_lib/data'

export default function ExampleBlogPage() {
  const posts = getPosts()

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-16">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Resources</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900">Blog</h1>
        <p className="mt-3 max-w-2xl text-[15px] text-neutral-600">
          Practical guides on platform engineering, performance, and product infrastructure.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
