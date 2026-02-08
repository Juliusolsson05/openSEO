import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type PostInfo = {
  seoTitle: string;
  metaDescription: string;
};

const EditBtn: React.FC = () => (
  <button style={{
    height: 28, padding: "0 8px", borderRadius: 4,
    border: `1px solid ${COLORS.border}`, background: COLORS.card,
    fontSize: 12, color: COLORS.foreground, fontFamily: F,
    cursor: "pointer",
  }}>
    Edit
  </button>
);

const InnerCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    borderRadius: 4, border: `1px solid ${COLORS.border}`,
    background: "#FAFAFA", padding: 8,
  }}>
    {children}
  </div>
);

export const PostInfoCard: React.FC<{ info: PostInfo }> = ({ info }) => (
  <div style={{
    borderRadius: 8, border: `1px solid ${COLORS.border}`,
    background: COLORS.card, marginBottom: 16,
  }}>
    {/* Header */}
    <div style={{ padding: "16px 16px 0" }}>
      <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: COLORS.foreground, fontFamily: F }}>
        Post Information
      </p>
    </div>

    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* SEO Title */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{
            fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em",
            color: COLORS.mutedForeground, margin: 0, fontFamily: F,
          }}>
            SEO TITLE
          </p>
          <EditBtn />
        </div>
        <InnerCard>
          <p style={{ fontSize: 13, color: COLORS.foreground, margin: 0, lineHeight: 1.5, fontFamily: F }}>
            {info.seoTitle}
          </p>
        </InnerCard>
      </div>

      {/* Meta Description */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{
            fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em",
            color: COLORS.mutedForeground, margin: 0, fontFamily: F,
          }}>
            META DESCRIPTION
          </p>
          <EditBtn />
        </div>
        <InnerCard>
          <p style={{ fontSize: 13, color: COLORS.foreground, margin: 0, lineHeight: 1.5, fontFamily: F }}>
            {info.metaDescription}
          </p>
        </InnerCard>
      </div>
    </div>
  </div>
);
