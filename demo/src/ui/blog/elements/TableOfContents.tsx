import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type TableOfContentsContent = {
  title?: string;
  items: string[];
};

export const TableOfContents: React.FC<{ content: TableOfContentsContent }> = ({ content }) => {
  return (
    <section
      style={{
        borderLeft: `4px solid ${COLORS.primary}`,
        background: COLORS.muted,
        padding: 24,
        borderRadius: 6,
        marginTop: 28,
      }}
    >
      <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: COLORS.foreground, fontFamily: F }}>
        {content.title ?? "Table of Contents"}
      </h2>
      <div style={{ height: 1, background: COLORS.border, margin: "16px 0" }} />
      <ol style={{ margin: 0, paddingLeft: 22 }}>
        {content.items.map((item, index) => (
          <li key={index} style={{ marginBottom: 9, fontSize: 18, lineHeight: 1.6, color: COLORS.primary, fontFamily: F }}>
            <span style={{ color: COLORS.foreground, fontWeight: 300 }}>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};
