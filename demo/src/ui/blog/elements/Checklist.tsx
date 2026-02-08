import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type ChecklistItem = { action: string; details?: string; checked?: boolean };
export type ChecklistContent = {
  title: string;
  introduction?: string;
  items: ChecklistItem[];
  conclusion?: string;
};

export const Checklist: React.FC<{ content: ChecklistContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    <div style={{
      maxWidth: 800, margin: "0 auto", borderRadius: 8,
      border: `1px solid ${COLORS.border}`, background: COLORS.card, padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <h2 style={{
        fontSize: 30, fontWeight: 700, color: COLORS.primary, margin: "0 0 16px", fontFamily: F,
      }}>
        {content.title}
      </h2>

      {content.introduction && (
        <p style={{ fontSize: 16, color: COLORS.foreground, margin: "0 0 24px", lineHeight: 1.6, fontFamily: F }}>
          {content.introduction}
        </p>
      )}

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {content.items.map((item, i) => (
          <li key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            borderRadius: 6, padding: "8px 12px", marginBottom: 4,
            background: item.checked ? "#ECFDF5" : "transparent",
          }}>
            <span style={{
              marginTop: 3, display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 16, height: 16, borderRadius: 3, flexShrink: 0,
              fontSize: 10, lineHeight: 1,
              border: item.checked ? "1.5px solid #059669" : "1.5px solid rgba(97,97,97,0.4)",
              background: item.checked ? "#059669" : "transparent",
              color: item.checked ? "#FFFFFF" : "transparent",
            }}>
              ✓
            </span>
            <div>
              <span style={{
                fontWeight: 500, fontSize: 14,
                color: item.checked ? "#047857" : COLORS.foreground, fontFamily: F,
              }}>
                {item.action}
              </span>
              {item.details && (
                <p style={{ fontSize: 13, color: COLORS.mutedForeground, margin: "4px 0 0", fontFamily: F }}>
                  {item.details}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {content.conclusion && (
        <p style={{ fontSize: 14, color: "#047857", margin: "16px 0 0", fontFamily: F }}>
          {content.conclusion}
        </p>
      )}
    </div>
  </section>
);
