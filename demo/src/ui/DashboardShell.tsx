import React from "react";
import { COLORS, WIDTH, HEIGHT } from "../constants";
import { MockSidebar } from "./MockSidebar";
import { MockTopbar } from "./MockTopbar";

/* ────────────────────────────────────────────
 * Reusable dashboard shell: sidebar + topbar + content area.
 * Mirrors the real (dashboard)/layout.tsx structure:
 *   - Sidebar: fixed 240px left
 *   - Main: ml-[240px], topbar + padded content
 * ──────────────────────────────────────────── */

export const DashboardShell: React.FC<{
  pageTitle?: string;
  sidebarActiveItem?: string;
  children: React.ReactNode;
}> = ({ pageTitle = "Titles", sidebarActiveItem = "Titles", children }) => (
  <div
    style={{
      width: WIDTH,
      height: HEIGHT,
      display: "flex",
      background: COLORS.background,
      fontFamily:
        "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      fontSize: 14,
      lineHeight: 1.5,
      color: COLORS.foreground,
      overflow: "hidden",
    }}
  >
    {/* Sidebar */}
    <MockSidebar activeItem={sidebarActiveItem} />

    {/* Main content area */}
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        overflow: "hidden",
      }}
    >
      <MockTopbar pageTitle={pageTitle} />
      <div
        style={{
          flex: 1,
          padding: 32,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  </div>
);
