import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

/* ── Small inline SVG icons ── */
const SquarePen = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
  </svg>
);
const ImagePlus = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" /><line x1="16" y1="5" x2="22" y2="5" />
    <line x1="19" y1="2" x2="19" y2="8" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);
const Link2 = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const KeyRound = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);
const RefreshCw = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
  </svg>
);
const Trash2 = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);
const EyeIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const UploadIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ActionRow: React.FC<{ icon: React.ReactNode; label: string; danger?: boolean }> = ({ icon, label, danger }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "7px 10px", borderRadius: 6, fontSize: 13, fontFamily: F,
    color: danger ? "#DC2626" : COLORS.foreground,
    cursor: "pointer",
  }}>
    {icon}
    <span>{label}</span>
  </div>
);

export const ActionsCard: React.FC<{ editMode?: boolean }> = ({ editMode = false }) => (
  <div style={{
    borderRadius: 8, border: `1px solid ${COLORS.border}`,
    background: COLORS.card, padding: 16, marginBottom: 16,
  }}>
    {/* Header */}
    <p style={{
      fontSize: 11, fontWeight: 600, textTransform: "uppercase",
      letterSpacing: "0.06em", color: COLORS.mutedForeground,
      margin: "0 0 12px", fontFamily: F,
    }}>
      ACTIONS
    </p>

    {/* Edit mode toggle */}
    <div style={{
      borderRadius: 4, border: `1px solid ${COLORS.border}`,
      background: "rgba(245,245,245,0.5)", padding: "8px 10px", marginBottom: 12,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
    }}>
      <div>
        <p style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 600, color: COLORS.foreground, margin: 0, fontFamily: F,
        }}>
          <SquarePen /> Edit mode
        </p>
        <p style={{ fontSize: 11, color: COLORS.mutedForeground, margin: "2px 0 0", fontFamily: F }}>
          Enable inline element editing
        </p>
      </div>
      {/* Switch toggle */}
      <div data-cursor-target="editSwitch" style={{
        width: 36, height: 20, borderRadius: 10,
        background: editMode ? COLORS.primary : "#D4D4D4",
        position: "relative", flexShrink: 0,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%", background: "#FFFFFF",
          position: "absolute", top: 2, left: editMode ? 18 : 2,
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }} />
      </div>
    </div>

    {/* Action rows */}
    <ActionRow icon={<ImagePlus />} label="Generate Images" />
    <ActionRow icon={<Link2 />} label="Sync Related Posts" />
    <ActionRow icon={<KeyRound />} label="Sync Keywords" />

    {/* Divider */}
    <div style={{ height: 1, background: COLORS.border, margin: "8px 0" }} />

    <ActionRow icon={<RefreshCw />} label="Regenerate Post" />
    <ActionRow icon={<Trash2 />} label="Delete Post" danger />

    {/* Bottom buttons */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
      <button style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        height: 32, borderRadius: 6, border: `1px solid ${COLORS.border}`,
        background: COLORS.card, fontSize: 12, fontWeight: 500,
        color: COLORS.foreground, fontFamily: F, cursor: "pointer",
      }}>
        <EyeIcon /> Preview
      </button>
      <button
        data-cursor-target="publishButton"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          height: 32, borderRadius: 6, border: "none",
          background: COLORS.primary, fontSize: 12, fontWeight: 500,
          color: "#FFFFFF", fontFamily: F, cursor: "pointer",
        }}
      >
        <UploadIcon /> Publish
      </button>
    </div>
  </div>
);
