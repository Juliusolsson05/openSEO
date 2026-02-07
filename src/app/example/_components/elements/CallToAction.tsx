import Link from 'next/link'

import { RichText } from './RichText'

type CallToActionProps = {
  title: string
  text: string
  button_label: string
  button_href: string
}

export function CallToAction({ title, text, button_label, button_href }: CallToActionProps) {
  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
      <h3 className="text-xl font-semibold tracking-tight text-neutral-900">{title}</h3>
      <RichText html={text} className="mt-2 text-sm leading-relaxed text-neutral-700" />
      <Link
        href={button_href}
        className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        {button_label}
      </Link>
    </section>
  )
}
