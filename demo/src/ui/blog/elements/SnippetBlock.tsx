import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type SnippetBlockContent = { title?: string; text: string };

export const SnippetBlock: React.FC<{ content: SnippetBlockContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    <div style={{ borderRadius: 8, borderLeft: `4px solid ${COLORS.primary}`, background: "#F0F6FF", padding: 20 }}>
      {content.title && <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary, margin: "0 0 8px", fontFamily: F }}>{content.title}</p>}
      <p style={{ fontSize: 15, color: COLORS.foreground, margin: 0, lineHeight: 1.7, fontFamily: F }}>{content.text}</p>
    </div>
  </section>
);
