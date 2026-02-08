import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

const LayersIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
  </svg>
);
const CalendarIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const TagIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);
const GlobeIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
  </svg>
);

export type PostDetails = {
  elements: number;
  created: string;
  keyword: string;
  slug: string;
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string; mono?: boolean; truncate?: boolean }> = ({ icon, label, value, mono, truncate }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontFamily: F }}>
    {icon}
    <span style={{ color: COLORS.mutedForeground }}>{label}</span>
    <span style={{
      marginLeft: "auto", fontWeight: 600, fontSize: 12,
      color: COLORS.foreground,
      fontFamily: mono ? "monospace" : F,
      maxWidth: truncate ? 100 : undefined,
      overflow: truncate ? "hidden" : undefined,
      textOverflow: truncate ? "ellipsis" : undefined,
      whiteSpace: "nowrap",
    }}>
      {value}
    </span>
  </div>
);

export const PostDetailsCard: React.FC<{ details: PostDetails }> = ({ details }) => (
  <div style={{
    borderRadius: 8, border: `1px solid ${COLORS.border}`,
    background: COLORS.card, padding: 16, marginBottom: 16,
  }}>
    <p style={{
      fontSize: 11, fontWeight: 600, textTransform: "uppercase",
      letterSpacing: "0.06em", color: COLORS.mutedForeground,
      margin: "0 0 12px", fontFamily: F,
    }}>
      POST DETAILS
    </p>

    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <DetailRow icon={<LayersIcon />} label="Elements" value={String(details.elements)} />
      <DetailRow icon={<CalendarIcon />} label="Created" value={details.created} />
      <DetailRow icon={<TagIcon />} label="Keyword" value={details.keyword} truncate />

      {/* Slug section */}
      <div style={{ paddingTop: 8, borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <GlobeIcon />
          <span style={{ color: COLORS.mutedForeground, fontSize: 12, fontFamily: F }}>Slug</span>
        </div>
        <p style={{
          fontSize: 11, fontFamily: "monospace", color: COLORS.mutedForeground,
          wordBreak: "break-all", lineHeight: 1.6, margin: 0, paddingLeft: 24,
        }}>
          {details.slug}
        </p>
      </div>
    </div>
  </div>
);
