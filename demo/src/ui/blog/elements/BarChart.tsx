import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type BarChartItem = { label: string; value: number };
export type BarChartContent = { title?: string; items: BarChartItem[] };

export const BarChart: React.FC<{ content: BarChartContent }> = ({ content }) => {
  const max = Math.max(...content.items.map((i) => i.value), 1);
  return (
    <section style={{ marginBottom: 20 }}>
      {content.title && <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 16px", color: COLORS.foreground, fontFamily: F }}>{content.title}</h3>}
      <div style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, padding: 24 }}>
        {content.items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ width: 100, fontSize: 13, fontWeight: 500, color: COLORS.foreground, fontFamily: F, textAlign: "right", flexShrink: 0 }}>{item.label}</span>
            <div style={{ flex: 1, height: 24, background: "#F5F5F5", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${(item.value / max) * 100}%`, height: "100%", background: COLORS.primary, borderRadius: 4 }} />
            </div>
            <span style={{ width: 40, fontSize: 13, fontWeight: 600, color: COLORS.foreground, fontFamily: F }}>{item.value}%</span>
          </div>
        ))}
      </div>
    </section>
  );
};
