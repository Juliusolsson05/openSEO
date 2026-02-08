import React from "react";
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { HEIGHT, WIDTH, COLORS } from "../constants";
import { DashboardShell } from "../ui/DashboardShell";
import { MockBlogPostPage } from "../ui/blog/MockBlogPostPage";

/* ────────────────────────────────────────────
 * Blog Post Scene — 20s (600 frames @ 30fps)
 *
 * Simple slow scroll from top to bottom.
 * No camera zoom, no cursor, no clicks.
 * Just showcasing the blog post content.
 * ──────────────────────────────────────────── */

// How far down to scroll (px). The blog content is taller than viewport,
// so we scroll the inner content area.
const SCROLL_DISTANCE = 1800;
const HOLD_START = 30;   // hold at top for 1s
const HOLD_END = 570;    // stop scrolling, hold at bottom for 1s

export const BlogPostScene: React.FC = () => {
  const frame = useCurrentFrame();

  const scrollY = interpolate(
    frame,
    [HOLD_START, HOLD_END],
    [0, SCROLL_DISTANCE],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    }
  );

  return (
    <BrowserFrame url="app.nordtools.com/blog/42/edit" pad={0}>
      <DashboardShell
        pageTitle="Edit Post"
        sidebarActiveItem="Blog Posts"
      >
        {/* Undo DashboardShell's 32px padding, fill full area */}
        <div style={{
          margin: -32,
          height: HEIGHT - 48 - 40, /* viewport minus topbar minus browser title bar */
          overflow: "hidden",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            transform: `translateY(${-scrollY}px)`,
          }}>
            <MockBlogPostPage />
          </div>
        </div>
      </DashboardShell>
    </BrowserFrame>
  );
};
