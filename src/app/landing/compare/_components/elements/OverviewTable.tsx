import type { OverviewTableContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: OverviewTableContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function OverviewTable({ content, toolA, toolB }: Props) {
  return (
    <div
      style={{
        marginBottom: 36,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #E1E1E1',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 14,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: '14px 20px',
                fontWeight: 600,
                color: '#616161',
                background: '#F5F7FA',
                borderBottom: '2px solid #E1E1E1',
                fontSize: 13,
              }}
            >
              Feature
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '14px 20px',
                fontWeight: 600,
                color: '#0078D4',
                background: '#F0F6FF',
                borderBottom: '2px solid #E1E1E1',
                fontSize: 13,
              }}
            >
              {toolA.name}
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '14px 20px',
                fontWeight: 600,
                color: '#6B4FBB',
                background: '#F3F0FF',
                borderBottom: '2px solid #E1E1E1',
                fontSize: 13,
              }}
            >
              {toolB.name}
            </th>
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row, i) => (
            <tr
              key={i}
              style={{
                backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
              }}
            >
              <td
                style={{
                  padding: '12px 20px',
                  fontWeight: 500,
                  color: '#1A1A1A',
                  borderBottom: '1px solid #F0F0F0',
                  fontSize: 14,
                }}
              >
                {row.label}
              </td>
              <td
                style={{
                  padding: '12px 20px',
                  color: '#1A1A1A',
                  borderBottom: '1px solid #F0F0F0',
                  background: i % 2 === 0 ? 'rgba(240,246,255,0.4)' : 'rgba(240,246,255,0.2)',
                }}
              >
                {row.tool_a}
              </td>
              <td
                style={{
                  padding: '12px 20px',
                  color: '#1A1A1A',
                  borderBottom: '1px solid #F0F0F0',
                  background: i % 2 === 0 ? 'rgba(243,240,255,0.4)' : 'rgba(243,240,255,0.2)',
                }}
              >
                {row.tool_b}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
