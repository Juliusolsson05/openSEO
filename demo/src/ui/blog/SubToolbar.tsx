import React from "react";
import { COLORS } from "../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

const ArrowLeft = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
);
const RefreshIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
  </svg>
);
const EyeIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const SparklesIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
  </svg>
);
const CheckCircle = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#107C10" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export type SubToolbarProps = {
  title: string;
  published?: boolean;
};

const ToolbarBtn: React.FC<{ icon: React.ReactNode; label: string; variant?: "ghost" | "outline" | "primary" }> = ({
  icon, label, variant = "ghost",
}) => {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  return (
    <button style={{
      display: "flex", alignItems: "center", gap: 6,
      height: 32, padding: "0 10px", borderRadius: 6,
      border: isPrimary ? "none" : isOutline ? `1px solid ${COLORS.border}` : "1px solid transparent",
      background: isPrimary ? COLORS.primary : "transparent",
      fontSize: 13, fontWeight: 500, fontFamily: F,
      color: isPrimary ? "#FFFFFF" : COLORS.foreground,
      cursor: "pointer",
    }}>
      {icon} {label}
    </button>
  );
};

export const SubToolbar: React.FC<SubToolbarProps> = ({ title, published = true }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 48, flexShrink: 0,
  }}>
    {/* Left: breadcrumb */}
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <div style={{
        width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 6, color: COLORS.foreground, cursor: "pointer",
      }}>
        <ArrowLeft />
      </div>
      <span style={{ fontSize: 13, color: COLORS.mutedForeground, fontFamily: F }}>Blog Posts</span>
      <span style={{ fontSize: 13, color: COLORS.mutedForeground, fontFamily: F }}>/</span>
      <span style={{
        fontSize: 13, fontWeight: 600, color: COLORS.foreground, fontFamily: F,
        maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {title}
      </span>
      {/* Badge */}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 8px", borderRadius: 9999, marginLeft: 4,
        background: published ? "#DFF6DD" : "#FFF4CE",
        fontSize: 12, fontWeight: 500, fontFamily: F,
        color: published ? "#107C10" : "#835C00",
      }}>
        {published && <CheckCircle />}
        {published ? "Published" : "Draft"}
      </span>
    </div>

    {/* Right: buttons */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <ToolbarBtn icon={<RefreshIcon />} label="Refresh" />
      <ToolbarBtn icon={<EyeIcon />} label="Preview" variant="outline" />
      <ToolbarBtn icon={<SparklesIcon />} label="Autopilot" variant="primary" />
    </div>
  </div>
);
