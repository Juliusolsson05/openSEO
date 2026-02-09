import type { VerdictContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: VerdictContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function VerdictCard({ content, toolA, toolB }: Props) {
  // Split verdict text into bullet points if they contain newlines
  const aBullets = content.tool_a_verdict.split('\n').filter(Boolean)
  const bBullets = content.tool_b_verdict.split('\n').filter(Boolean)

  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid #E1E1E1',
        overflow: 'hidden',
        marginBottom: 36,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Tool A */}
        <div
          style={{
            padding: 28,
            background: '#F0F6FF',
            borderRight: '1px solid #E1E1E1',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#0078D4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {toolA.name.charAt(0)}
          </div>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: '#0078D4',
              margin: '0 0 4px',
            }}
          >
            {toolA.name}
          </h3>
          <p
            style={{
              fontSize: 13,
              color: '#616161',
              margin: '0 0 16px',
              fontWeight: 500,
            }}
          >
            Choose {toolA.name} if…
          </p>
          <div style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {aBullets.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '4px 0',
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#1A1A1A',
                }}
              >
                <span style={{ color: '#0078D4', fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span>{item.replace(/^[-•]\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tool B */}
        <div
          style={{
            padding: 28,
            background: '#F3F0FF',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#6B4FBB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {toolB.name.charAt(0)}
          </div>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: '#6B4FBB',
              margin: '0 0 4px',
            }}
          >
            {toolB.name}
          </h3>
          <p
            style={{
              fontSize: 13,
              color: '#616161',
              margin: '0 0 16px',
              fontWeight: 500,
            }}
          >
            Choose {toolB.name} if…
          </p>
          <div style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {bBullets.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '4px 0',
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#1A1A1A',
                }}
              >
                <span style={{ color: '#6B4FBB', fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span>{item.replace(/^[-•]\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
