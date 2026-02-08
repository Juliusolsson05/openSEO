import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

/* ────────────────────────────────────────────
 * Animated macOS-style cursor with click ripple.
 *
 * Usage:
 *   <Cursor waypoints={[
 *     { frame: 0,  x: 960, y: 540 },
 *     { frame: 30, x: 400, y: 300, click: true },
 *     ...
 *   ]} />
 *
 * Coordinates are in composition space (1920×1080).
 * Place inside a camera-transformed parent so it
 * moves with the "screen recording."
 * ──────────────────────────────────────────── */

export type Waypoint = {
  frame: number;
  x: number;
  y: number;
  /** Show click animation at this frame */
  click?: boolean;
};

/** macOS default arrow cursor SVG */
const CursorSVG: React.FC<{ pressed: boolean }> = ({ pressed }) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    style={{
      transform: `scale(${pressed ? 0.85 : 1})`,
      transformOrigin: "4px 1px",
      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
    }}
  >
    <path
      d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
      fill="#FFFFFF"
      stroke="#000000"
      strokeWidth={1.2}
    />
  </svg>
);

/** Click ripple ring that expands and fades */
const ClickRipple: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0 || progress >= 1) return null;
  const size = interpolate(progress, [0, 1], [6, 28]);
  const opacity = interpolate(progress, [0, 0.5, 1], [0.6, 0.3, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: 4 - size / 2,
        top: 1 - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2px solid rgba(0,120,212,0.8)",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

const CLICK_DURATION = 10; // frames for click animation
const EASE = Easing.bezier(0.25, 0.1, 0.25, 1); // natural ease

export const Cursor: React.FC<{
  waypoints: Waypoint[];
  /** Hide cursor before this frame (default: show from first waypoint) */
  hideUntil?: number;
}> = ({ waypoints, hideUntil }) => {
  const frame = useCurrentFrame();

  if (waypoints.length === 0) return null;

  // Hide before first waypoint or custom hideUntil
  const showFrom = hideUntil ?? waypoints[0].frame;
  if (frame < showFrom) return null;

  // Find the two surrounding waypoints for interpolation
  let prevWp = waypoints[0];
  let nextWp = waypoints[0];

  for (let i = 0; i < waypoints.length; i++) {
    if (waypoints[i].frame <= frame) {
      prevWp = waypoints[i];
      nextWp = waypoints[i + 1] ?? waypoints[i];
    }
  }

  // If we're past the last waypoint, stay at last position
  if (frame >= waypoints[waypoints.length - 1].frame) {
    prevWp = waypoints[waypoints.length - 1];
    nextWp = prevWp;
  }

  // Interpolate position between waypoints
  let x: number;
  let y: number;

  if (prevWp === nextWp || prevWp.frame === nextWp.frame) {
    x = prevWp.x;
    y = prevWp.y;
  } else {
    const rawT = interpolate(
      frame,
      [prevWp.frame, nextWp.frame],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const t = EASE(rawT);
    x = interpolate(t, [0, 1], [prevWp.x, nextWp.x]);
    y = interpolate(t, [0, 1], [prevWp.y, nextWp.y]);
  }

  // Check if we're in a click animation
  let pressed = false;
  let rippleProgress = -1;

  for (const wp of waypoints) {
    if (wp.click && frame >= wp.frame && frame < wp.frame + CLICK_DURATION) {
      const clickFrame = frame - wp.frame;
      pressed = clickFrame < 4; // pressed for first 4 frames
      rippleProgress = interpolate(clickFrame, [0, CLICK_DURATION], [0, 1]);
      break;
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          willChange: "transform",
        }}
      >
        <CursorSVG pressed={pressed} />
        <ClickRipple progress={rippleProgress} />
      </div>
    </div>
  );
};
