import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type TableContent = {
  title?: string;
  headers: string[];
  rows: string[][];
};

export const Table: React.FC<{ content: TableContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    {content.title && <h3 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 16px", color: COLORS.foreground, fontFamily: F }}>{content.title}</h3>}
    <div style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F, fontSize: 14 }}>
        <thead>
          <tr style={{ background: "#F5F5F5" }}>
            {content.headers.map((h, i) => (
              <th key={i} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: COLORS.foreground, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 1 ? "#FAFAFA" : COLORS.card }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "10px 16px", color: COLORS.foreground, borderBottom: `1px solid ${COLORS.border}` }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
