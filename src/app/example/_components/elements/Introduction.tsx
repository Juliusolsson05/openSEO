import { BookOpen } from 'lucide-react'

import { RichText } from './RichText'

type IntroductionProps = {
  title: string
  text: string
}

export function Introduction({ title, text }: IntroductionProps) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold tracking-tight text-neutral-900">
        <BookOpen className="h-5 w-5 text-sky-600" />
        <span>{title}</span>
      </h2>
      <RichText html={text} className="text-lg font-light leading-[1.78] text-neutral-700" />
    </section>
  )
}
