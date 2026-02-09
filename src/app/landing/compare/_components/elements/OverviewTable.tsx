import type { OverviewTableContent, ComparisonToolData } from '../../_lib/types'

interface Props {
  content: OverviewTableContent
  toolA: ComparisonToolData
  toolB: ComparisonToolData
}

export function OverviewTable({ content, toolA, toolB }: Props) {
  return (
    <div style={{ marginBottom: 32, border: '1px solid #E1E1E1', borderRadius: 2, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#616161', background: '#F5F5F5', borderBottom: '1px solid #E1E1E1', width: '28%' }} />
            <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#1A1A1A', background: '#F5F5F5', borderBottom: '1px solid #E1E1E1', width: '36%' }}>
              {toolA.name}
            </th>
            <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#1A1A1A', background: '#F5F5F5', borderBottom: '1px solid #E1E1E1', width: '36%' }}>
              {toolB.name}
            </th>
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1A1A1A', borderBottom: i < content.rows.length - 1 ? '1px solid #F0F0F0' : 'none', background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                {row.label}
              </td>
              <td style={{ padding: '10px 16px', color: '#616161', borderBottom: i < content.rows.length - 1 ? '1px solid #F0F0F0' : 'none', background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                {row.tool_a}
              </td>
              <td style={{ padding: '10px 16px', color: '#616161', borderBottom: i < content.rows.length - 1 ? '1px solid #F0F0F0' : 'none', background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                {row.tool_b}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
