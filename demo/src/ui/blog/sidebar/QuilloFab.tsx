import React from "react";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

const ChatIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
  </svg>
);

export const QuilloFab: React.FC = () => (
  <div style={{
    position: "absolute", bottom: 24, right: 24,
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 18px", borderRadius: 24,
    background: "#0078D4",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    cursor: "pointer", zIndex: 50,
  }}>
    <ChatIcon />
    <span style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF", fontFamily: F }}>
      Quillo Assistant
    </span>
  </div>
);
