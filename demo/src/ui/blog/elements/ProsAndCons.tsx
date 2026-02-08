import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type ProsAndConsContent = {
  title?: string;
  pros: string[];
  cons: string[];
};

const CheckIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const ProsAndCons: React.FC<{ content: ProsAndConsContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    {content.title && <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 16px", color: COLORS.foreground, fontFamily: F }}>{content.title}</h3>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ borderRadius: 8, border: "1px solid #D1FAE5", background: "#F0FDF4", padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#059669", margin: "0 0 12px", fontFamily: F }}>Pros</p>
        {content.pros.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ marginTop: 2, flexShrink: 0 }}><CheckIcon /></span>
            <span style={{ fontSize: 14, color: COLORS.foreground, fontFamily: F, lineHeight: 1.5 }}>{p}</span>
          </div>
        ))}
      </div>
      <div style={{ borderRadius: 8, border: "1px solid #FECACA", background: "#FEF2F2", padding: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#DC2626", margin: "0 0 12px", fontFamily: F }}>Cons</p>
        {content.cons.map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ marginTop: 2, flexShrink: 0 }}><XIcon /></span>
            <span style={{ fontSize: 14, color: COLORS.foreground, fontFamily: F, lineHeight: 1.5 }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);
