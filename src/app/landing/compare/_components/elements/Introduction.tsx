import type { IntroductionContent } from '../../_lib/types'

interface Props {
  content: IntroductionContent
}

export function Introduction({ content }: Props) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: '#1A1A1A', margin: 0 }}>
        {content.text}
      </p>
    </div>
  )
}
