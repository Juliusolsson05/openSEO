import React from "react";
import {
  interpolate,
  useCurrentFrame,
  Easing,
} from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { Cursor, type Waypoint } from "../components/Cursor";
import { HEIGHT, WIDTH } from "../constants";
import { DashboardShell } from "../ui/DashboardShell";
import { MockBlogPostPage } from "../ui/blog/MockBlogPostPage";

/* ────────────────────────────────────────────
 * Blog Post Scene — 30s (900 frames @ 30fps)
 *
 * Phase 1 (0–380):  Scroll down, elements generate live
 * Phase 2 (380–440): Hold at bottom
 * Phase 3 (440–540): Scroll back up to intro area
 * Phase 4 (540–600): Cursor moves to Edit mode toggle, clicks
 * Phase 5 (600–680): Cursor moves to Introduction, clicks
 * Phase 6 (680–900): Inline editing shown on introduction
 * ──────────────────────────────────────────── */

/* ── Scroll ── */
const SCROLL_MAX = 2000;
// Phase 1: scroll down
const DOWN_START = 1;
const DOWN_END = 380;
// Phase 3: scroll back up — stop with intro visible (~400px down)
const UP_START = 440;
const UP_END = 540;
const SCROLL_REST = 280; // resting scroll position showing intro in view

/* ── Layout positions (composition space) ──
 * These are approximate positions accounting for:
 * - Browser title bar: 40px
 * - Sidebar: 240px
 * - Topbar: 48px
 * - SubToolbar: 48px
 * - Content area starts at ~176px from top
 * - Right sidebar starts at ~rightEdge - 256 - 24
 */

// Edit mode toggle switch (right sidebar, ActionsCard)
// Right sidebar left: content area right. Approx x center of switch.
const SIDEBAR_X = 240;  // main sidebar width
const RIGHT_SIDEBAR_LEFT = SIDEBAR_X + 24 + /* main col */ 600 + 24; // approximate
const EDIT_TOGGLE_X = 1620; // right side of the actions card
const EDIT_TOGGLE_Y = 230;  // Edit mode row, within browser frame

// Introduction element position when scrolled to SCROLL_REST
// Intro is ~500px from content top. With scroll at 280, it's at ~220px in viewport
// Plus browser bar(40) + topbar(48) + subtoolbar(48) = 136px offset
const INTRO_X = 680;   // center of main content column
const INTRO_Y = 420;   // approx center of intro text in viewport at rest

export const BlogPostScene: React.FC = () => {
  const frame = useCurrentFrame();

  /* ── Compute scroll position ── */
  let scrollY: number;

  if (frame <= DOWN_END) {
    // Phase 1: scroll down
    scrollY = interpolate(frame, [DOWN_START, DOWN_END], [0, SCROLL_MAX], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    });
  } else if (frame <= UP_START) {
    // Phase 2: hold at bottom
    scrollY = SCROLL_MAX;
  } else if (frame <= UP_END) {
    // Phase 3: scroll back up
    scrollY = interpolate(frame, [UP_START, UP_END], [SCROLL_MAX, SCROLL_REST], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    });
  } else {
    // Phase 4+: resting at intro
    scrollY = SCROLL_REST;
  }

  /* ── Edit mode state ── */
  const editModeOn = frame >= 590;
  const introSelected = frame >= 660;

  /* ── Cursor waypoints (composition space) ── */
  const waypoints: Waypoint[] = [
    // Phase 1-2: cursor idle off to the side during scroll
    { frame: 0,    x: 900,          y: 500 },
    { frame: 380,  x: 900,          y: 600 },
    // Phase 3: drift toward sidebar as we scroll back
    { frame: 500,  x: 1200,         y: 400 },
    // Phase 4: move to Edit mode toggle
    { frame: 560,  x: EDIT_TOGGLE_X, y: EDIT_TOGGLE_Y },
    { frame: 585,  x: EDIT_TOGGLE_X, y: EDIT_TOGGLE_Y, click: true },
    // Phase 5: move to Introduction
    { frame: 620,  x: INTRO_X,       y: INTRO_Y },
    { frame: 655,  x: INTRO_X,       y: INTRO_Y, click: true },
    // Phase 6: stay in intro area, small movements like typing
    { frame: 700,  x: INTRO_X - 40,  y: INTRO_Y + 5 },
    { frame: 800,  x: INTRO_X + 20,  y: INTRO_Y - 5 },
    { frame: 900,  x: INTRO_X,       y: INTRO_Y },
  ];

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
            <MockBlogPostPage
              frame={frame}
              editMode={editModeOn}
              introSelected={introSelected}
            />
          </div>
        </div>
      </DashboardShell>
      {/* Cursor rendered on top of everything, in composition space */}
      <Cursor waypoints={waypoints} />
    </BrowserFrame>
  );
};
