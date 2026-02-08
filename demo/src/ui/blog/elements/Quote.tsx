import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type QuoteContent = { text: string; author?: string };

export const Quote: React.FC<{ content: QuoteContent }> = ({ content }) => (
  <blockquote style={{ margin: "36px 0 0", padding: "16px 20px", borderLeft: `4px solid ${COLORS.primary}`, background: COLORS.muted, borderRadius: 6 }}>
    <p style={{ margin: 0, fontSize: 22, lineHeight: 1.5, fontWeight: 300, color: COLORS.foreground, fontFamily: F }}>“{content.text}”</p>
    {content.author && <footer style={{ marginTop: 8, fontSize: 14, color: COLORS.mutedForeground, fontFamily: F }}>— {content.author}</footer>}
  </blockquote>
);
