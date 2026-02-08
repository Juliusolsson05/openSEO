import React from "react";
import { Audio, interpolate, spring, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { DashboardShell } from "../ui/DashboardShell";
import { MockTitlesPage } from "../ui/MockTitlesPage";

const typingSfx = staticFile("audio/typing.mp3");
const clickSfx = staticFile("audio/click.mp3");

/* ────────────────────────────────────────────
 * Title Generation Scene
 *
 * Shows the Aurora dashboard titles page with an
 * animated flow: enter topic → generate titles.
 *
 * Camera keyframes (in local frames @ 30fps):
 *   0-14   : Full view of dashboard (slight letterbox feel)
 *   15-21  : Zoom towards "New Titles" button (top-right area)
 *   22-28  : Pan to the generate form that just appeared
 *   29-92  : Hold on form while topic is typed
 *   93-100 : Pan to "Generate Titles" button
 *   101-145: Hold on loading state
 *   146-190: Zoom out to show results appearing in table
 *   191+   : Slight pull-back to full view, hold
 * ──────────────────────────────────────────── */

interface CameraState {
  scale: number;
  x: number;
  y: number;
}

function useCamera(frame: number, fps: number): CameraState {
  const springCfg = { damping: 24, stiffness: 180, mass: 0.5 };

  // Camera states
  const FULL: CameraState = { scale: 1, x: 0, y: 0 };
  // Zoomed into the action bar area (top-right of content)
  const BTN_AREA: CameraState = { scale: 1.55, x: -320, y: -40 };
  // On the generate form (slightly lower, centered on form)
  const FORM: CameraState = { scale: 1.55, x: -280, y: -80 };
  // Tighter on the generate button
  const GEN_BTN: CameraState = { scale: 1.65, x: -340, y: -95 };
  // Pulled back to show the table with new results
  const TABLE_VIEW: CameraState = { scale: 1.25, x: -160, y: -60 };
  // Full view at the end
  const END: CameraState = { scale: 1.0, x: 0, y: 0 };

  // Phase 1: Full view (0-14)
  if (frame < 15) return FULL;

  // Phase 2: Zoom to button area (15+)
  const zoomToBtnP = spring({ fps, frame: Math.max(0, frame - 15), config: springCfg, durationInFrames: 18 });
  if (frame < 22) {
    return {
      scale: interpolate(zoomToBtnP, [0, 1], [FULL.scale, BTN_AREA.scale]),
      x: interpolate(zoomToBtnP, [0, 1], [FULL.x, BTN_AREA.x]),
      y: interpolate(zoomToBtnP, [0, 1], [FULL.y, BTN_AREA.y]),
    };
  }

  // Phase 3: Pan to form (22+)
  const panToFormP = spring({ fps, frame: Math.max(0, frame - 22), config: springCfg, durationInFrames: 16 });
  if (frame < 93) {
    return {
      scale: interpolate(panToFormP, [0, 1], [BTN_AREA.scale, FORM.scale]),
      x: interpolate(panToFormP, [0, 1], [BTN_AREA.x, FORM.x]),
      y: interpolate(panToFormP, [0, 1], [BTN_AREA.y, FORM.y]),
    };
  }

  // Phase 4: Pan to generate button (93+)
  const panToGenP = spring({ fps, frame: Math.max(0, frame - 93), config: springCfg, durationInFrames: 14 });
  if (frame < 146) {
    return {
      scale: interpolate(panToGenP, [0, 1], [FORM.scale, GEN_BTN.scale]),
      x: interpolate(panToGenP, [0, 1], [FORM.x, GEN_BTN.x]),
      y: interpolate(panToGenP, [0, 1], [FORM.y, GEN_BTN.y]),
    };
  }

  // Phase 5: Zoom out to table (146+)
  const zoomOutP = spring({ fps, frame: Math.max(0, frame - 146), config: { damping: 26, stiffness: 140, mass: 0.6 }, durationInFrames: 25 });
  if (frame < 210) {
    return {
      scale: interpolate(zoomOutP, [0, 1], [GEN_BTN.scale, TABLE_VIEW.scale]),
      x: interpolate(zoomOutP, [0, 1], [GEN_BTN.x, TABLE_VIEW.x]),
      y: interpolate(zoomOutP, [0, 1], [GEN_BTN.y, TABLE_VIEW.y]),
    };
  }

  // Phase 6: Pull back to full (210+)
  const pullBackP = spring({ fps, frame: Math.max(0, frame - 210), config: { damping: 30, stiffness: 120 }, durationInFrames: 30 });
  return {
    scale: interpolate(pullBackP, [0, 1], [TABLE_VIEW.scale, END.scale]),
    x: interpolate(pullBackP, [0, 1], [TABLE_VIEW.x, END.x]),
    y: interpolate(pullBackP, [0, 1], [TABLE_VIEW.y, END.y]),
  };
}

export const TitleGenerationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = useCamera(frame, fps);

  /* Audio timing (local frames) */
  const TYPING_START = 30;
  const TYPING_END = 90;
  const BTN_CLICK = 95;

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`,
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          <BrowserFrame url="aurora.nordtools.se/blog/titles" pad={0}>
            <DashboardShell pageTitle="Titles">
              <MockTitlesPage />
            </DashboardShell>
          </BrowserFrame>
        </div>
      </div>

      {/* ── Audio layers ── */}
      <Sequence from={TYPING_START} durationInFrames={TYPING_END - TYPING_START}>
        <Audio src={typingSfx} volume={0.5} />
      </Sequence>
      <Sequence from={BTN_CLICK} durationInFrames={12}>
        <Audio src={clickSfx} volume={0.7} />
      </Sequence>
    </>
  );
};
