import React from "react";
import { COLORS } from "../constants";

/* ────────────────────────────────────────────
 * Static replica of the Aurora dashboard topbar.
 * 48px height, breadcrumb, search bar, icons.
 * ──────────────────────────────────────────── */

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

const IconSearch = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconBell = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconHelp = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const MockTopbar: React.FC<{ pageTitle?: string }> = ({
  pageTitle = "Titles",
}) => (
  <div
    style={{
      height: 48,
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 24px",
      borderBottom: `1px solid ${COLORS.border}`,
      background: "#FFFFFF",
      flexShrink: 0,
    }}
  >
    {/* Breadcrumb */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 13, color: COLORS.mutedForeground, fontFamily: F }}>Aurora</span>
      <span style={{ fontSize: 13, color: COLORS.mutedForeground, fontFamily: F }}>/</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.foreground, fontFamily: F }}>{pageTitle}</span>
    </div>

    {/* Spacer */}
    <div style={{ flex: 1 }} />

    {/* Search bar */}
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
        <IconSearch />
      </div>
      <div
        style={{
          height: 32,
          width: 224,
          borderRadius: 2,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.secondary,
          paddingLeft: 32,
          paddingRight: 12,
          display: "flex",
          alignItems: "center",
          fontSize: 12,
          color: "rgba(97,97,97,0.6)",
          fontFamily: F,
        }}
      >
        Search (⌘K)
      </div>
    </div>

    {/* Help icon */}
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconHelp />
    </div>

    {/* Bell icon */}
    <div
      style={{
        position: "relative",
        width: 32,
        height: 32,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconBell />
      {/* Notification dot */}
      <div
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: COLORS.primary,
        }}
      />
    </div>
  </div>
);
