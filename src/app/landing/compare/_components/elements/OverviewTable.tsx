import type { OverviewTableContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: OverviewTableContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function OverviewTable({ content, toolA, toolB }: Props) {
  return (
    <div style={{ marginBottom: 32, overflowX: 'auto' }}>
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
                padding: '10px 16px',
                fontWeight: 600,
                color: '#616161',
                borderBottom: '2px solid #E1E1E1',
                fontSize: 13,
              }}
            />
            <th
              style={{
                textAlign: 'left',
                padding: '10px 16px',
                fontWeight: 600,
                color: '#1A1A1A',
                borderBottom: '2px solid #E1E1E1',
                fontSize: 13,
              }}
            >
              {toolA.name}
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '10px 16px',
                fontWeight: 600,
                color: '#1A1A1A',
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
                backgroundColor: i % 2 === 0 ? '#FAFAFA' : '#fff',
              }}
            >
              <td
                style={{
                  padding: '10px 16px',
                  fontWeight: 500,
                  color: '#1A1A1A',
                  borderBottom: '1px solid #F0F0F0',
                }}
              >
                {row.label}
              </td>
              <td
                style={{
                  padding: '10px 16px',
                  color: '#1A1A1A',
                  borderBottom: '1px solid #F0F0F0',
                }}
              >
                {row.tool_a}
              </td>
              <td
                style={{
                  padding: '10px 16px',
                  color: '#1A1A1A',
                  borderBottom: '1px solid #F0F0F0',
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
