import React from "react";
import { COLORS } from "../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

const AuroraLogoSm: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 2L3 28h5.5l2.5-5h10l2.5 5H29L16 2Zm0 9l4 8h-8l4-8Z" fill="#FFFFFF" fillRule="evenodd" />
  </svg>
);

type NavItem = { label: string; icon: React.ReactNode };
type NavSection = { heading: string; items: NavItem[] };

const iconStyle: React.CSSProperties = { opacity: 0.8 };
const IconFileText = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const IconHeading = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><path d="M6 12h12" /><path d="M6 20V4" /><path d="M18 20V4" /></svg>;
const IconCalendar = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IconTarget = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
const IconBarChart = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>;
const IconLayers = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
const IconBook = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
const IconBuilding = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>;
const IconSettings = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const IconUpload = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>;
const IconShield = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>;
const IconExternalLink = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={iconStyle}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>;
const IconLogout = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;

const sections: NavSection[] = [
  { heading: "CONTENT", items: [{ label: "Blog Posts", icon: <IconFileText /> }, { label: "Titles", icon: <IconHeading /> }, { label: "Scheduling", icon: <IconCalendar /> }, { label: "Call to Actions", icon: <IconTarget /> }] },
  { heading: "INSIGHTS", items: [{ label: "Analytics", icon: <IconBarChart /> }] },
  { heading: "EXTENSIONS", items: [{ label: "Elements", icon: <IconLayers /> }, { label: "Dictionaries", icon: <IconBook /> }] },
  { heading: "SETTINGS", items: [{ label: "Company Profile", icon: <IconBuilding /> }, { label: "Settings", icon: <IconSettings /> }, { label: "Publishing", icon: <IconUpload /> }] },
  { heading: "ADMIN", items: [{ label: "Users", icon: <IconShield /> }, { label: "Example Site", icon: <IconExternalLink /> }] },
];

export const MockSidebar: React.FC<{ activeItem?: string }> = ({ activeItem = "Titles" }) => (
  <div style={{ width: 240, height: "100%", display: "flex", flexDirection: "column", background: COLORS.sidebar, flexShrink: 0 }}>
    <div style={{ height: 48, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", borderBottom: `1px solid ${COLORS.sidebarBorder}`, flexShrink: 0 }}>
      <AuroraLogoSm size={24} />
      <span style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.01em", fontFamily: F }}>Aurora</span>
    </div>

    <div style={{ flex: 1, overflowY: "hidden", paddingTop: 12, paddingBottom: 12 }}>
      {sections.map((section) => (
        <div key={section.heading} style={{ marginBottom: 4 }}>
          <p style={{ padding: "12px 16px 4px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(210,210,210,0.4)", fontFamily: F, margin: 0 }}>{section.heading}</p>
          {section.items.map((item) => {
            const isActive = item.label === activeItem;
            return (
              <div key={item.label} style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, padding: "7px 16px", fontSize: 13, color: isActive ? "#FFFFFF" : COLORS.sidebarForeground, background: isActive ? COLORS.sidebarAccent : "transparent", fontFamily: F }}>
                {isActive && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#FFFFFF" }} />}
                {item.icon}
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>

    <div style={{ borderTop: `1px solid ${COLORS.sidebarBorder}`, padding: "12px 12px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.sidebarAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#FFFFFF", fontFamily: F, flexShrink: 0 }}>A</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "#FFFFFF", margin: 0, fontFamily: F }}>Admin</p>
          <p style={{ fontSize: 11, color: "rgba(210,210,210,0.5)", margin: 0, fontFamily: F }}>Nordtools</p>
        </div>
        <IconLogout />
      </div>
    </div>
  </div>
);
