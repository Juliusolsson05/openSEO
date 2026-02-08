import React from "react";
import {
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { HEIGHT } from "../constants";
import { DashboardShell } from "../ui/DashboardShell";
import { MockBlogPostPage } from "../ui/blog/MockBlogPostPage";

/* ────────────────────────────────────────────
 * Blog Post Scene — 20s (600 frames @ 30fps)
 *
 * Elements generate live as the page scrolls
 * down at a medium pace. Each element starts
 * as a skeleton and crossfades to real content
 * just before it scrolls into view.
 *
 * Scroll distance is tuned so the conclusion
 * is visible near the end.
 * ──────────────────────────────────────────── */

const SCROLL_DISTANCE = 2000;
const HOLD_START = 20;   // brief hold at top
const HOLD_END = 570;    // stop scrolling near end

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
        <div style={{
          margin: -32,
          height: HEIGHT - 48 - 40,
          overflow: "hidden",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            transform: `translateY(${-scrollY}px)`,
          }}>
            <MockBlogPostPage frame={frame} />
          </div>
        </div>
      </DashboardShell>
    </BrowserFrame>
  );
};
