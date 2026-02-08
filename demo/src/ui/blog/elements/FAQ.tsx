import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type FAQItem = { question: string; answer: string };

const MinusIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const FAQ: React.FC<{ content: FAQItem[]; expandedIndex?: number }> = ({ content, expandedIndex = 0 }) => (
  <section style={{ marginBottom: 20 }}>
    <h2 style={{
      fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em",
      margin: "48px 0 16px", color: COLORS.foreground, fontFamily: F,
    }}>
      FAQ
    </h2>

    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {content.map((item, i) => {
        const expanded = i === expandedIndex;
        return (
          <div key={i} style={{
            borderRadius: 8, border: `1px solid ${COLORS.border}`,
            background: COLORS.card, overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
              padding: "16px 24px", cursor: "pointer",
            }}>
              <span style={{ fontWeight: 500, fontSize: 14, color: COLORS.foreground, fontFamily: F }}>
                {item.question}
              </span>
              <span style={{ flexShrink: 0, color: COLORS.mutedForeground }}>
                {expanded ? <MinusIcon /> : <PlusIcon />}
              </span>
            </div>
            {expanded && (
              <div style={{ padding: "0 24px 20px" }}>
                <p style={{
                  fontSize: 14, lineHeight: 1.7, color: COLORS.foreground, margin: 0, fontFamily: F,
                }}>
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </section>
);
