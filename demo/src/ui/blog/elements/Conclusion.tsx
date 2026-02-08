import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type ConclusionContent = { text: string };

export const Conclusion: React.FC<{ content: ConclusionContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    <h2 style={{
      fontSize: 24, fontWeight: 600, margin: "0 0 12px",
      color: COLORS.foreground, fontFamily: F,
    }}>
      Conclusion
    </h2>
    <p style={{
      fontSize: 18, fontWeight: 300, lineHeight: 1.778,
      color: COLORS.foreground, fontFamily: F, margin: 0,
    }}>
      {content.text}
    </p>
  </section>
);
