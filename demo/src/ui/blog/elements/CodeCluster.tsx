import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type CodeClusterContent = { title?: string; language?: string; code: string };

export const CodeCluster: React.FC<{ content: CodeClusterContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    {content.title && <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 12px", color: COLORS.foreground, fontFamily: F }}>{content.title}</h3>}
    <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
      {content.language && (
        <div style={{ background: "#2D2D30", padding: "6px 16px", fontSize: 11, fontWeight: 600, color: "#9CA3AF", fontFamily: "monospace", textTransform: "uppercase" }}>
          {content.language}
        </div>
      )}
      <pre style={{ margin: 0, padding: 20, background: "#1E1E1E", color: "#D4D4D4", fontSize: 13, lineHeight: 1.6, fontFamily: "'Cascadia Code', 'Fira Code', monospace", overflowX: "auto", whiteSpace: "pre-wrap" }}>
        {content.code}
      </pre>
    </div>
  </section>
);
