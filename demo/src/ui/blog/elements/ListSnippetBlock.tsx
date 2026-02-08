import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type ListSnippetBlockContent = { title?: string; items: string[] };

export const ListSnippetBlock: React.FC<{ content: ListSnippetBlockContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    <div style={{ borderRadius: 8, borderLeft: `4px solid ${COLORS.primary}`, background: "#F0F6FF", padding: 20 }}>
      {content.title && <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary, margin: "0 0 12px", fontFamily: F }}>{content.title}</p>}
      <ol style={{ margin: 0, paddingLeft: 20 }}>
        {content.items.map((item, i) => (
          <li key={i} style={{ fontSize: 14, color: COLORS.foreground, lineHeight: 1.7, marginBottom: 4, fontFamily: F }}>{item}</li>
        ))}
      </ol>
    </div>
  </section>
);
