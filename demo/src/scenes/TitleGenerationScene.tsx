import React from "react";
import {
  Audio,
  interpolate,
  spring,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CameraRig, type CameraState } from "../components/CameraRig";
import { BrowserFrame } from "../components/BrowserFrame";
import { Cursor, type Waypoint } from "../components/Cursor";
import { HEIGHT, WIDTH } from "../constants";
import { TITLES_TARGETS as T } from "../layout";
import { DashboardShell } from "../ui/DashboardShell";
import { MockTitlesPage } from "../ui/MockTitlesPage";

const typingSfx = staticFile("audio/typing.mp3");
const clickSfx = staticFile("audio/click.mp3");

/* ────────────────────────────────────────────
 * Title Generation Scene — 14s (420 frames @ 30fps)
 *
 * Flow:
 *   1. Full view hold
 *   2. Gentle 1.1x zoom
 *   3. Click "New Titles" → form appears
 *   4. Zoom OUT slightly to show form in context
 *   5. Slow pan into topic input, type description
 *   6. Pan to generate button, click
 *   7. Loading state
 *   8. Zoom out wide to show results
 *   9. Pull back to full
 * ──────────────────────────────────────────── */

function lerpCam(a: CameraState, b: CameraState, t: number): CameraState {
  return {
    scale: interpolate(t, [0, 1], [a.scale, b.scale]),
    focusX: interpolate(t, [0, 1], [a.focusX, b.focusX]),
    focusY: interpolate(t, [0, 1], [a.focusY, b.focusY]),
  };
}

// Camera poses (derived from layout targets)
const POSES = {
  FULL:        { scale: 1.0,  focusX: T.center.x,         focusY: T.center.y },
  GENTLE:      { scale: 1.1,  focusX: T.center.x,         focusY: T.center.y },
  FORM_WIDE:   { scale: 1.15, focusX: T.topicInput.x,     focusY: T.topicInput.y + 20 },
  FORM_CLOSE:  { scale: 1.5,  focusX: T.topicInputLeft.x, focusY: T.topicInputLeft.y },
  GEN_BTN:     { scale: 1.55, focusX: T.generateBtn.x,    focusY: T.generateBtn.y },
  TABLE_WIDE:  { scale: 1.05, focusX: T.tableCenter.x,    focusY: T.tableCenter.y },
} as const;

// Timeline keyframes (28s = 840 frames)
const K = {
  GENTLE_IN:    20,   // gentle center zoom
  FORM_WIDE:    68,   // after clicking New Titles, zoom OUT to show form in context
  FORM_CLOSE:   140,  // slow zoom INTO topic input to watch typing
  PAN_GEN:      310,  // pan to generate button
  ZOOM_OUT:     460,  // zoom out wide to show table results
  PULL_BACK:    700,  // pull back to full
} as const;

function useCamera(frame: number, fps: number): CameraState {
  const slow = { damping: 28, stiffness: 140, mass: 0.6, overshootClamping: true };
  const smooth = { damping: 24, stiffness: 160, mass: 0.5, overshootClamping: true };

  if (frame < K.GENTLE_IN) return POSES.FULL;

  // Phase 1: Gentle 1.1x center zoom
  const p1 = spring({ fps, frame: frame - K.GENTLE_IN, config: slow, durationInFrames: 28 });
  if (frame < K.FORM_WIDE) return lerpCam(POSES.FULL, POSES.GENTLE, p1);

  // Phase 2: Zoom out slightly to show form in context (after New Titles clicked)
  const p2 = spring({ fps, frame: frame - K.FORM_WIDE, config: slow, durationInFrames: 30 });
  if (frame < K.FORM_CLOSE) return lerpCam(POSES.GENTLE, POSES.FORM_WIDE, p2);

  // Phase 3: Slow zoom into topic input (typing happens here)
  const p3 = spring({ fps, frame: frame - K.FORM_CLOSE, config: slow, durationInFrames: 30 });
  if (frame < K.PAN_GEN) return lerpCam(POSES.FORM_WIDE, POSES.FORM_CLOSE, p3);

  // Phase 4: Pan to generate button
  const p4 = spring({ fps, frame: frame - K.PAN_GEN, config: smooth, durationInFrames: 26 });
  if (frame < K.ZOOM_OUT) return lerpCam(POSES.FORM_CLOSE, POSES.GEN_BTN, p4);

  // Phase 5: Zoom out wide to show table results
  const p5 = spring({
    fps, frame: frame - K.ZOOM_OUT,
    config: { damping: 30, stiffness: 120, mass: 0.7, overshootClamping: true },
    durationInFrames: 35,
  });
  if (frame < K.PULL_BACK) return lerpCam(POSES.GEN_BTN, POSES.TABLE_WIDE, p5);

  // Phase 6: Pull back to full
  const p6 = spring({
    fps, frame: frame - K.PULL_BACK,
    config: { damping: 32, stiffness: 100, overshootClamping: true },
    durationInFrames: 40,
  });
  return lerpCam(POSES.TABLE_WIDE, POSES.FULL, p6);
}

/* ── Cursor waypoints (derived from layout targets) ── */
const CURSOR: Waypoint[] = [
  // Enter from center area
  { frame: 0,   x: T.center.x,            y: T.center.y - 60 },
  // Move to "New Titles" button and click
  { frame: 56,  x: T.newTitlesBtn.x,      y: T.newTitlesBtn.y, click: true },
  // Drift back toward form area (form opening, camera zooming out)
  { frame: 100, x: T.topicInput.x - 200,  y: T.topicInput.y + 30 },
  // Move to topic input and click
  { frame: 144, x: T.topicInput.x - 300,  y: T.topicInput.y, click: true },
  // Idle near input while typing (subtle drift)
  { frame: 220, x: T.topicInput.x - 280,  y: T.topicInput.y + 6 },
  { frame: 290, x: T.topicInput.x - 260,  y: T.topicInput.y + 4 },
  // Move to generate button and click
  { frame: 310, x: T.generateBtn.x,       y: T.generateBtn.y, click: true },
  // Drift away during loading
  { frame: 400, x: T.generateBtn.x - 200, y: T.generateBtn.y + 50 },
  // Move to watch results appear
  { frame: 480, x: T.tableCenter.x - 100, y: T.tableCenter.y - 40 },
  // Settle watching results
  { frame: 640, x: T.tableCenter.x - 60,  y: T.tableCenter.y },
  // Drift toward first generated title's Generate button and click
  { frame: 760, x: 1822,                   y: 338 },
  { frame: 800, x: 1822,                   y: 338, click: true },
  // Hold
  { frame: 840, x: 1822,                   y: 342 },
];

export const TitleGenerationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = useCamera(frame, fps);

  // Action timings (synced with MockTitlesPage T constants)
  const TYPING_START = 152;
  const TYPING_END = 296;
  const BTN_CLICK = 316;

  return (
    <>
      <CameraRig cam={cam}>
        <BrowserFrame url="aurora.nordtools.se/blog/titles" pad={0}>
          <DashboardShell pageTitle="Titles">
            <MockTitlesPage />
          </DashboardShell>
        </BrowserFrame>

        <Cursor waypoints={CURSOR} />
      </CameraRig>

      {/* Typing SFX for business description */}
      <Sequence from={TYPING_START} durationInFrames={TYPING_END - TYPING_START}>
        <Audio src={typingSfx} volume={0.25} />
      </Sequence>
      {/* Click SFX for generate button */}
      <Sequence from={BTN_CLICK} durationInFrames={12}>
        <Audio src={clickSfx} volume={0.35} />
      </Sequence>
    </>
  );
};
