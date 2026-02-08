import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { Cursor, type Waypoint } from "../components/Cursor";
import { HEIGHT } from "../constants";
import { DashboardShell } from "../ui/DashboardShell";
import { MockBlogPostPage } from "../ui/blog/MockBlogPostPage";

/* ────────────────────────────────────────────
 * Blog Post Scene — 36s (1080 frames @ 30fps)
 *
 * Timeline:
 *   0–340     Scroll down + live generation
 *   340–380   Hold at bottom
 *   380–460   Scroll back up to intro
 *   460–510   Cursor → Edit mode switch, click
 *   510–550   Cursor → Introduction, click
 *   550–620   Typing happens (fast, ~2s)
 *   620–640   "Saved" badge
 *   640–680   Cursor drifts down, + button appears
 *   680–700   Click + button
 *   700–780   Add Element modal open, select Case Study
 *   780–800   Click "Add Element" confirm
 *   800–870   Skeleton loading below intro
 *   870–1080  Case study generated, hold
 * ──────────────────────────────────────────── */

const SCROLL_MAX = 2000;

/* Layout coords (BrowserFrame content space) */
const EDIT_SWITCH_X = 1612;
const EDIT_SWITCH_Y = 162;
const INTRO_X = 900;
const INTRO_Y = 650;
const PLUS_X = 960;
const PLUS_Y = 760;
const MODAL_CASE_X = 905;
const MODAL_CASE_Y = 525;
const MODAL_ADD_BTN_X = 790;
const MODAL_ADD_BTN_Y = 620;
const SCROLL_REST = 280;

export const BlogPostScene: React.FC = () => {
  const frame = useCurrentFrame();

  /* ── Scroll ── */
  let scrollY: number;
  if (frame <= 340) {
    scrollY = interpolate(frame, [1, 340], [0, SCROLL_MAX], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    });
  } else if (frame <= 380) {
    scrollY = SCROLL_MAX;
  } else if (frame <= 460) {
    scrollY = interpolate(frame, [380, 460], [SCROLL_MAX, SCROLL_REST], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    });
  } else {
    scrollY = SCROLL_REST;
  }

  /* ── State flags ── */
  const editModeOn      = frame >= 505;
  const introSelected   = frame >= 545;
  const showAddButton   = frame >= 650;
  const addModalOpen    = frame >= 700 && frame < 800;
  const caseStudyGen    = frame >= 800 && frame < 870;
  const caseStudyDone   = frame >= 870;

  /* ── Cursor ── */
  const waypoints: Waypoint[] = [
    // Scroll phase — cursor rests mid-screen
    { frame: 0,    x: 860,            y: 450 },
    { frame: 340,  x: 900,            y: 500 },
    // Scroll up — drift toward sidebar
    { frame: 430,  x: 1300,           y: 300 },
    // Click Edit mode toggle
    { frame: 480,  x: EDIT_SWITCH_X,  y: EDIT_SWITCH_Y },
    { frame: 502,  x: EDIT_SWITCH_X,  y: EDIT_SWITCH_Y, click: true },
    // Click Introduction
    { frame: 530,  x: INTRO_X,        y: INTRO_Y },
    { frame: 543,  x: INTRO_X,        y: INTRO_Y, click: true },
    // Editing drift
    { frame: 580,  x: INTRO_X - 20,   y: INTRO_Y + 8 },
    { frame: 630,  x: INTRO_X + 10,   y: INTRO_Y + 5 },
    // Move to + button
    { frame: 660,  x: PLUS_X,         y: PLUS_Y },
    { frame: 678,  x: PLUS_X,         y: PLUS_Y, click: true },
    // Select Case Study in modal
    { frame: 730,  x: MODAL_CASE_X,   y: MODAL_CASE_Y },
    { frame: 750,  x: MODAL_CASE_X,   y: MODAL_CASE_Y, click: true },
    // Click Add Element button
    { frame: 775,  x: MODAL_ADD_BTN_X, y: MODAL_ADD_BTN_Y },
    { frame: 795,  x: MODAL_ADD_BTN_X, y: MODAL_ADD_BTN_Y, click: true },
    // Watch generation
    { frame: 850,  x: INTRO_X + 60,   y: INTRO_Y + 140 },
    { frame: 1080, x: INTRO_X + 50,   y: INTRO_Y + 130 },
  ];

  return (
    <BrowserFrame url="app.nordtools.com/blog/42/edit" pad={0}>
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <DashboardShell pageTitle="Edit Post" sidebarActiveItem="Blog Posts">
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
                showAddButton={showAddButton}
                addModalOpen={addModalOpen}
                caseStudyGenerating={caseStudyGen}
                caseStudyInserted={caseStudyDone}
              />
            </div>
          </div>
        </DashboardShell>
        <Cursor waypoints={waypoints} />
      </div>
    </BrowserFrame>
  );
};
