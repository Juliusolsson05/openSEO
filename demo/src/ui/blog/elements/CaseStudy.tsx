import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type CaseStudyContent = {
  title: string;
  company?: string;
  challenge: string;
  solution: string;
  result: string;
};

export const CaseStudy: React.FC<{ content: CaseStudyContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    <div style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, overflow: "hidden" }}>
      <div style={{ background: "#F0F6FF", padding: "16px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.primary, margin: 0, fontFamily: F }}>Case Study</p>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: COLORS.foreground, margin: "4px 0 0", fontFamily: F }}>{content.title}</h3>
        {content.company && <p style={{ fontSize: 13, color: COLORS.mutedForeground, margin: "2px 0 0", fontFamily: F }}>{content.company}</p>}
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {[{ label: "Challenge", text: content.challenge }, { label: "Solution", text: content.solution }, { label: "Result", text: content.result }].map((s, i) => (
          <div key={i}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.mutedForeground, margin: "0 0 4px", fontFamily: F }}>{s.label}</p>
            <p style={{ fontSize: 14, color: COLORS.foreground, margin: 0, lineHeight: 1.6, fontFamily: F }}>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
