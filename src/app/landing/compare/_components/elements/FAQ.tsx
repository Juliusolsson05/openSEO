'use client'

import { useState } from 'react'
import type { FAQContent } from '../../_lib/types'

interface Props {
  content: FAQContent
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        borderBottom: '1px solid #E1E1E1',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '16px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: 15,
          fontWeight: 500,
          color: '#1A1A1A',
          fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <span>{question}</span>
        <span
          style={{
            fontSize: 18,
            color: '#616161',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(45deg)' : 'none',
            flexShrink: 0,
            marginLeft: 16,
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          style={{
            paddingBottom: 16,
            fontSize: 14,
            lineHeight: 1.6,
            color: '#616161',
          }}
        >
          {answer}
        </div>
      )}
    </div>
  )
}

export function FAQ({ content }: Props) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#1A1A1A',
          margin: '0 0 8px',
          letterSpacing: '-0.01em',
        }}
      >
        Frequently Asked Questions
      </h2>
      <div>
        {content.items.map((item, i) => (
          <FAQItem key={i} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>
  )
}
