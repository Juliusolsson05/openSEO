import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type ToolItem = { name: string; description: string; category?: string };
export type ToolRecommendationContent = { title?: string; items: ToolItem[] };

const ToolIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const ToolRecommendation: React.FC<{ content: ToolRecommendationContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    {content.title && <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 16px", color: COLORS.foreground, fontFamily: F }}>{content.title}</h3>}
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {content.items.map((item, i) => (
        <div key={i} style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, padding: "14px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F0F6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ToolIcon />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.foreground, margin: 0, fontFamily: F }}>{item.name}</p>
              {item.category && <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: "#F5F5F5", color: COLORS.mutedForeground, fontFamily: F }}>{item.category}</span>}
            </div>
            <p style={{ fontSize: 13, color: COLORS.mutedForeground, margin: "4px 0 0", lineHeight: 1.5, fontFamily: F }}>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);
