import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type VersusContent = {
  title?: string;
  left: { label: string; points: string[] };
  right: { label: string; points: string[] };
};

export const Versus: React.FC<{ content: VersusContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    {content.title && <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 16px", color: COLORS.foreground, fontFamily: F }}>{content.title}</h3>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, borderRadius: 8, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      <div style={{ padding: 20, background: "#F0F6FF" }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary, margin: "0 0 12px", fontFamily: F }}>{content.left.label}</p>
        {content.left.points.map((p, i) => (
          <p key={i} style={{ fontSize: 14, color: COLORS.foreground, margin: "0 0 6px", lineHeight: 1.5, fontFamily: F }}>• {p}</p>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", background: COLORS.card, borderLeft: `1px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}` }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.mutedForeground, fontFamily: F }}>VS</span>
      </div>
      <div style={{ padding: 20, background: "#FFF7ED" }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#C2410C", margin: "0 0 12px", fontFamily: F }}>{content.right.label}</p>
        {content.right.points.map((p, i) => (
          <p key={i} style={{ fontSize: 14, color: COLORS.foreground, margin: "0 0 6px", lineHeight: 1.5, fontFamily: F }}>• {p}</p>
        ))}
      </div>
    </div>
  </section>
);
