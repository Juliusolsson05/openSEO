import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const width = interpolate(frame, [0, durationInFrames], [0, 100]);

  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: "rgba(255,255,255,0.08)" }}>
      <div style={{ width: `${width}%`, height: "100%", background: COLORS.primary }} />
    </div>
  );
};
