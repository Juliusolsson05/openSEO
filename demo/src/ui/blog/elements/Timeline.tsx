import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type TimelineItem = { title: string; description: string };
export type TimelineContent = { title?: string; items: TimelineItem[] };

export const Timeline: React.FC<{ content: TimelineContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    {content.title && <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 20px", color: COLORS.foreground, fontFamily: F }}>{content.title}</h3>}
    <div style={{ position: "relative", paddingLeft: 28 }}>
      {/* Vertical line */}
      <div style={{ position: "absolute", left: 7, top: 4, bottom: 4, width: 2, background: COLORS.border }} />
      {content.items.map((item, i) => (
        <div key={i} style={{ position: "relative", marginBottom: 24 }}>
          {/* Dot */}
          <div style={{ position: "absolute", left: -24, top: 4, width: 12, height: 12, borderRadius: "50%", background: COLORS.primary, border: "2px solid #DEECF9" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.foreground, margin: "0 0 4px", fontFamily: F }}>{item.title}</p>
          <p style={{ fontSize: 14, color: COLORS.mutedForeground, margin: 0, lineHeight: 1.6, fontFamily: F }}>{item.description}</p>
        </div>
      ))}
    </div>
  </section>
);
