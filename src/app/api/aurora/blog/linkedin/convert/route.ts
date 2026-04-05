import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

export const GET = apiHandler(async (ctx) => {
  const blogPostId = Number(ctx.searchParams.get('blog_post_id'))
  if (!blogPostId) {
    return raw({ detail: 'blog_post_id is required' }, 400)
  }

  // TODO: wire up real LinkedIn conversion via quilloService. For now we
  // return a deterministic placeholder that satisfies the client contract
  // `{ json, html }` so the UI can render a preview without crashing.
  const placeholder = {
    json: {
      blog_post_id: blogPostId,
      status: 'placeholder',
      message:
        'LinkedIn conversion is not yet implemented. This placeholder keeps the UI functional.',
    },
    html: `<p>LinkedIn preview for blog post ${blogPostId} is not yet available.</p>`,
  }

  return raw(placeholder)
})
