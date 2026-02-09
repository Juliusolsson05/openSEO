import type { ScoreSummaryContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: ScoreSummaryContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function ScoreSummary({ content, toolA, toolB }: Props) {
  const colorA = '#0078D4'
  const colorB = '#6B4FBB'

  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid #E1E1E1',
        background: '#fff',
        marginBottom: 36,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #F0F0F0',
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1A1A1A',
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}
        >
          Overall Scores
        </h3>
        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: colorA }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#616161' }}>{toolA.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: colorB }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#616161' }}>{toolB.name}</span>
          </div>
        </div>
      </div>

      {/* Dimension rows */}
      <div style={{ padding: '8px 24px 16px' }}>
        {content.dimensions.map((dim, i) => {
          const aWins = dim.tool_a > dim.tool_b
          const bWins = dim.tool_b > dim.tool_a
          const maxScore = 5

          return (
            <div
              key={i}
              style={{
                padding: '14px 0',
                borderBottom: i < content.dimensions.length - 1 ? '1px solid #F5F5F5' : 'none',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', marginBottom: 10 }}>
                {dim.label}
              </div>

              {/* Tool A bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
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
                      width: `${(dim.tool_a / maxScore) * 100}%`,
                      height: '100%',
                      borderRadius: 4,
                      background: colorA,
                      transition: 'width 0.4s ease-out',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: aWins ? colorA : '#616161',
                    minWidth: 28,
                    textAlign: 'right',
                  }}
                >
                  {dim.tool_a}
                </span>
                {aWins && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#107C10',
                      background: '#E6F4E6',
                      padding: '1px 6px',
                      borderRadius: 4,
                    }}
                  >
                    ★
                  </span>
                )}
              </div>

              {/* Tool B bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                      width: `${(dim.tool_b / maxScore) * 100}%`,
                      height: '100%',
                      borderRadius: 4,
                      background: colorB,
                      transition: 'width 0.4s ease-out',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: bWins ? colorB : '#616161',
                    minWidth: 28,
                    textAlign: 'right',
                  }}
                >
                  {dim.tool_b}
                </span>
                {bWins && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#107C10',
                      background: '#E6F4E6',
                      padding: '1px 6px',
                      borderRadius: 4,
                    }}
                  >
                    ★
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
