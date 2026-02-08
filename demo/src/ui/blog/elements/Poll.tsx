import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type PollOption = { label: string; votes: number };
export type PollContent = { question: string; options: PollOption[] };

export const Poll: React.FC<{ content: PollContent }> = ({ content }) => {
  const total = content.options.reduce((s, o) => s + o.votes, 0) || 1;
  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, padding: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: COLORS.foreground, margin: "0 0 16px", fontFamily: F }}>{content.question}</p>
        {content.options.map((opt, i) => {
          const pct = Math.round((opt.votes / total) * 100);
          return (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: COLORS.foreground, fontFamily: F }}>{opt.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.mutedForeground, fontFamily: F }}>{pct}%</span>
              </div>
              <div style={{ height: 8, background: "#F5F5F5", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: COLORS.primary, borderRadius: 4 }} />
              </div>
            </div>
          );
        })}
        <p style={{ fontSize: 11, color: COLORS.mutedForeground, margin: "12px 0 0", fontFamily: F }}>{total} votes</p>
      </div>
    </section>
  );
};
