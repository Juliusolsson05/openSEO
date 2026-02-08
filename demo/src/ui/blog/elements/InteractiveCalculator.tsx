import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type CalculatorField = { label: string; value: string; unit?: string };
export type InteractiveCalculatorContent = { title?: string; fields: CalculatorField[]; result?: { label: string; value: string } };

export const InteractiveCalculator: React.FC<{ content: InteractiveCalculatorContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    <div style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, padding: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.primary, margin: "0 0 4px", fontFamily: F }}>Interactive Calculator</p>
      {content.title && <h3 style={{ fontSize: 20, fontWeight: 600, color: COLORS.foreground, margin: "0 0 20px", fontFamily: F }}>{content.title}</h3>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {content.fields.map((f, i) => (
          <div key={i}>
            <p style={{ fontSize: 12, fontWeight: 500, color: COLORS.mutedForeground, margin: "0 0 4px", fontFamily: F }}>{f.label}</p>
            <div style={{ display: "flex", alignItems: "center", height: 36, borderRadius: 6, border: `1px solid ${COLORS.border}`, padding: "0 12px", background: "#FAFAFA" }}>
              <span style={{ fontSize: 14, color: COLORS.foreground, fontFamily: F }}>{f.value}</span>
              {f.unit && <span style={{ fontSize: 12, color: COLORS.mutedForeground, marginLeft: 4, fontFamily: F }}>{f.unit}</span>}
            </div>
          </div>
        ))}
      </div>
      {content.result && (
        <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: "#F0F6FF", border: `1px solid #DEECF9` }}>
          <p style={{ fontSize: 12, color: COLORS.mutedForeground, margin: "0 0 4px", fontFamily: F }}>{content.result.label}</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary, margin: 0, fontFamily: F }}>{content.result.value}</p>
        </div>
      )}
    </div>
  </section>
);
