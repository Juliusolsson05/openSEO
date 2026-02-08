import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";

export type CameraState = {
  scale: number;
  focusX: number;
  focusY: number;
};

/**
 * Clamp focus so the zoomed content always fills the viewport.
 * At scale s, the valid focusX range is [viewW/(2s), contentW - viewW/(2s)].
 * This prevents empty canvas from showing at the edges.
 */
function clampFocus(
  cam: CameraState,
  contentW: number,
  contentH: number,
  viewW: number,
  viewH: number
): CameraState {
  const halfViewW = viewW / (2 * cam.scale);
  const halfViewH = viewH / (2 * cam.scale);
  return {
    scale: cam.scale,
    focusX: Math.max(halfViewW, Math.min(contentW - halfViewW, cam.focusX)),
    focusY: Math.max(halfViewH, Math.min(contentH - halfViewH, cam.focusY)),
  };
}

export const cameraTransform = (
  cam: CameraState,
  width: number,
  height: number
) => {
  const clamped = clampFocus(cam, width, height, width, height);
  return `translate(${width / 2}px, ${height / 2}px) scale(${clamped.scale}) translate(${-clamped.focusX}px, ${-clamped.focusY}px)`;
};

export const CameraRig: React.FC<{
  cam: CameraState;
  children: React.ReactNode;
}> = ({ cam, children }) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          width,
          height,
          transform: cameraTransform(cam, width, height),
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
