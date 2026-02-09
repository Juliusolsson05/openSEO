import type { FeatureComparisonContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: FeatureComparisonContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function FeatureComparison({ content, toolA, toolB }: Props) {
  const noteA = content.tool_a_note ?? (content as any).tool_a_notes ?? ''
  const noteB = content.tool_b_note ?? (content as any).tool_b_notes ?? ''
  const maxScore = 5
  const aWins = content.tool_a_score > content.tool_b_score
  const bWins = content.tool_b_score > content.tool_a_score

  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid #E1E1E1',
        marginBottom: 24,
        background: '#fff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* Category heading */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #F0F0F0',
          background: '#F5F7FA',
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#1A1A1A',
            margin: 0,
          }}
        >
          {content.category}
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Tool A */}
        <div
          style={{
            padding: 24,
            borderRight: '1px solid #F0F0F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              {toolA.name}
            </p>
            {aWins && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#107C10',
                  background: '#E6F4E6',
                  padding: '2px 8px',
                  borderRadius: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                ✓ Winner
              </span>
            )}
          </div>

          {/* Score bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                background: '#E8ECF0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(content.tool_a_score / maxScore) * 100}%`,
                  height: '100%',
                  borderRadius: 4,
                  background: '#0078D4',
                }}
              />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', minWidth: 28 }}>
              {content.tool_a_score}/{maxScore}
            </span>
          </div>

          {noteA && (
            <p style={{ fontSize: 13, color: '#616161', margin: 0, lineHeight: 1.6 }}>
              {noteA}
            </p>
          )}
        </div>

        {/* Tool B */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              {toolB.name}
            </p>
            {bWins && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#107C10',
                  background: '#E6F4E6',
                  padding: '2px 8px',
                  borderRadius: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                ✓ Winner
              </span>
            )}
          </div>

          {/* Score bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                background: '#E8ECF0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(content.tool_b_score / maxScore) * 100}%`,
                  height: '100%',
                  borderRadius: 4,
                  background: '#6B4FBB',
                }}
              />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', minWidth: 28 }}>
              {content.tool_b_score}/{maxScore}
            </span>
          </div>

          {noteB && (
            <p style={{ fontSize: 13, color: '#616161', margin: 0, lineHeight: 1.6 }}>
              {noteB}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
