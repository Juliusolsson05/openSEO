import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type AffiliateItem = { name: string; description: string; url?: string };
export type AffiliateRecommendationsContent = { title?: string; items: AffiliateItem[] };

export const AffiliateRecommendations: React.FC<{ content: AffiliateRecommendationsContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    {content.title && <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 16px", color: COLORS.foreground, fontFamily: F }}>{content.title}</h3>}
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {content.items.map((item, i) => (
        <div key={i} style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.foreground, margin: 0, fontFamily: F }}>{item.name}</p>
            <p style={{ fontSize: 13, color: COLORS.mutedForeground, margin: "4px 0 0", fontFamily: F }}>{item.description}</p>
          </div>
          <div style={{ padding: "6px 14px", borderRadius: 6, background: COLORS.primary, color: "#FFF", fontSize: 12, fontWeight: 600, fontFamily: F, whiteSpace: "nowrap", flexShrink: 0 }}>
            Learn More →
          </div>
        </div>
      ))}
    </div>
  </section>
);
