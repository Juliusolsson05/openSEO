import type { IntroductionContent } from '../../_lib/types'

interface Props {
  content: IntroductionContent
}

export function Introduction({ content }: Props) {
  return (
    <div
      style={{
        marginBottom: 36,
        paddingLeft: 20,
        borderLeft: '3px solid #0078D4',
      }}
    >
      <p
        style={{
          fontSize: 17,
          lineHeight: 1.75,
          color: '#1A1A1A',
          margin: 0,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {content.text.charAt(0)}
        </span>
        {content.text.slice(1)}
      </p>
    </div>
  )
}
