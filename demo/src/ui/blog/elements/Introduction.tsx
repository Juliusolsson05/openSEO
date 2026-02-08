import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type IntroductionContent = {
  heading: string;
  body: string;
};

const BookIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
);

export const Introduction: React.FC<{ content: IntroductionContent }> = ({ content }) => (
  <section style={{ marginTop: 36 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <BookIcon />
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: COLORS.foreground, fontFamily: F }}>{content.heading}</h2>
    </div>
    <p style={{ margin: "16px 0 0", fontSize: 18, fontWeight: 300, lineHeight: 1.778, color: COLORS.foreground, fontFamily: F }}>{content.body}</p>
  </section>
);
