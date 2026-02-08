import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type CallToActionContent = { title: string; body: string; buttonLabel: string };

export const CallToAction: React.FC<{ content: CallToActionContent }> = ({ content }) => (
  <section style={{ marginTop: 36, border: `1px solid ${COLORS.primary}55`, borderRadius: 8, background: COLORS.primaryLight, padding: 20 }}>
    <h3 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: COLORS.foreground, fontFamily: F }}>{content.title}</h3>
    <p style={{ margin: "10px 0 0", fontSize: 17, lineHeight: 1.7, fontWeight: 300, color: COLORS.foreground, fontFamily: F }}>{content.body}</p>
    <button style={{ marginTop: 14, border: "none", background: COLORS.primary, color: "#FFFFFF", padding: "7px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: F }}>
      {content.buttonLabel}
    </button>
  </section>
);
