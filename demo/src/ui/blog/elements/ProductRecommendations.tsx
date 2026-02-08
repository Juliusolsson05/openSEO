import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type ProductItem = { name: string; description: string; rating?: number };
export type ProductRecommendationsContent = { title?: string; items: ProductItem[] };

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <span style={{ color: "#F59E0B", fontSize: 12, letterSpacing: 2 }}>{"★".repeat(count)}{"☆".repeat(5 - count)}</span>
);

export const ProductRecommendations: React.FC<{ content: ProductRecommendationsContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    {content.title && <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 16px", color: COLORS.foreground, fontFamily: F }}>{content.title}</h3>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {content.items.map((item, i) => (
        <div key={i} style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, padding: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.foreground, margin: "0 0 4px", fontFamily: F }}>{item.name}</p>
          {item.rating && <Stars count={item.rating} />}
          <p style={{ fontSize: 13, color: COLORS.mutedForeground, margin: "8px 0 0", lineHeight: 1.5, fontFamily: F }}>{item.description}</p>
        </div>
      ))}
    </div>
  </section>
);
