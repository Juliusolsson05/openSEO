type Props = { title?: string; description?: string; link?: string; image_url?: string; target_url?: string }

export function CtaBlock({ title, description, image_url }: Props) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-gradient-to-r from-blue-50 to-white p-6 space-y-3">
      {image_url ? <img src={image_url} alt={title || 'CTA'} className="rounded-md max-h-48 object-cover" /> : null}
      {title ? <h3 className="text-xl font-semibold text-neutral-900">{title}</h3> : null}
      {description ? <p className="text-neutral-600">{description}</p> : null}
      <a href="/example/blog" className="inline-block rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Go to blog</a>
    </section>
  )
}
