import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type GlossaryItem = { term: string; definition: string };
export type GlossaryContent = { title?: string; items: GlossaryItem[] };

export const Glossary: React.FC<{ content: GlossaryContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 16px", color: COLORS.foreground, fontFamily: F }}>{content.title ?? "Glossary"}</h3>
    <div style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, overflow: "hidden" }}>
      {content.items.map((item, i) => (
        <div key={i} style={{ padding: "12px 20px", borderBottom: i < content.items.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.foreground, margin: "0 0 2px", fontFamily: F }}>{item.term}</p>
          <p style={{ fontSize: 13, color: COLORS.mutedForeground, margin: 0, lineHeight: 1.5, fontFamily: F }}>{item.definition}</p>
        </div>
      ))}
    </div>
  </section>
);
