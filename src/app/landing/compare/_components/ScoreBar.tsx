interface ScoreBarProps {
  score: number
  max?: number
  label?: string
}

export function ScoreBar({ score, max = 5, label }: ScoreBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {label && (
        <span style={{ fontSize: 13, color: '#616161', minWidth: 60 }}>{label}</span>
      )}
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: max }, (_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: i < score ? '#0078D4' : '#E1E1E1',
              transition: 'background-color 0.2s',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, color: '#616161', marginLeft: 4 }}>
        {score}/{max}
      </span>
    </div>
  )
}
