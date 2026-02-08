import React from "react";
import { COLORS, WIDTH, HEIGHT } from "../constants";

type Props = {
  url?: string;
  children: React.ReactNode;
  /** Inner content width. Default fills the video canvas minus padding. */
  width?: number;
  /** Inner content height. Default fills the video canvas minus padding and title bar. */
  height?: number;
  /** Padding around the browser chrome on the backdrop. */
  pad?: number;
  /** Backdrop color behind the browser. */
  backdrop?: string;
};

const TITLE_BAR_H = 40;

export const BrowserFrame: React.FC<Props> = ({
  url = "aurora.nordtools.se",
  children,
  pad = 0,
  backdrop = "#ffffff",
  width = WIDTH - pad * 2,
  height = HEIGHT - pad * 2 - TITLE_BAR_H,
}) => {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: backdrop,
      }}
    >
      <div
        style={{
          width: width,
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
          background: COLORS.surface,
          flexShrink: 0,
        }}
      >
        {/* macOS title bar */}
        <div
          style={{
            height: TITLE_BAR_H,
            background: COLORS.surface,
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 8,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#eab308" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }} />
          </div>

          {/* URL bar */}
          <div
            style={{
              flex: 1,
              height: 26,
              background: COLORS.bg,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 8,
            }}
          >
            <span
              style={{
                color: COLORS.textMuted,
                fontSize: 13,
                fontFamily:
                  "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
              }}
            >
              {url}
            </span>
          </div>
        </div>

        {/* Content area */}
        <div style={{ width: "100%", height, overflow: "hidden", position: "relative" }}>
          {children}
        </div>
      </div>
    </div>
  );
};
