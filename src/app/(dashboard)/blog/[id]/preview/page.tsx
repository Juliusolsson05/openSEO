import { redirect } from 'next/navigation'

export default async function LegacyBlogPreviewRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/preview/blog/${id}`)
}
