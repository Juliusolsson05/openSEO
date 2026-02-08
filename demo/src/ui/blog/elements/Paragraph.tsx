import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type ParagraphContent = {
  heading: string;
  paragraphs: string[];
};

export const Paragraph: React.FC<{ content: ParagraphContent }> = ({ content }) => (
  <section style={{ marginTop: 40 }}>
    <h3 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: COLORS.foreground, fontFamily: F }}>{content.heading}</h3>
    {content.paragraphs.map((text, idx) => (
      <p key={idx} style={{ margin: idx === 0 ? "14px 0 0" : "12px 0 0", fontSize: 18, fontWeight: 300, lineHeight: 1.778, color: COLORS.foreground, fontFamily: F }}>
        {text}
      </p>
    ))}
  </section>
);
