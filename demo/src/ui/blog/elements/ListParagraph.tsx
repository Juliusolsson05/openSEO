import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

type ListItem = { label?: string; text: string };

export type ListParagraphContent = {
  heading: string;
  textBeforeList?: string;
  items: ListItem[];
  textAfterList?: string;
};

export const ListParagraph: React.FC<{ content: ListParagraphContent }> = ({ content }) => (
  <section style={{ marginTop: 40 }}>
    <h3 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: COLORS.foreground, fontFamily: F }}>{content.heading}</h3>
    {content.textBeforeList && <p style={{ margin: "14px 0 0", fontSize: 18, fontWeight: 300, lineHeight: 1.778, color: COLORS.foreground, fontFamily: F }}>{content.textBeforeList}</p>}
    <ul style={{ margin: "12px 0 0", paddingLeft: 24 }}>
      {content.items.map((item, idx) => (
        <li key={idx} style={{ marginBottom: 10, fontSize: 18, fontWeight: 300, lineHeight: 1.6, color: COLORS.foreground, fontFamily: F }}>
          {item.label && <strong style={{ fontWeight: 600 }}>{item.label}: </strong>}
          {item.text}
        </li>
      ))}
    </ul>
    {content.textAfterList && <p style={{ margin: "12px 0 0", fontSize: 18, fontWeight: 300, lineHeight: 1.778, color: COLORS.foreground, fontFamily: F }}>{content.textAfterList}</p>}
  </section>
);
