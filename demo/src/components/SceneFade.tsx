import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const SceneFade: React.FC<{
  durationInFrames: number;
  overlapFrames?: number;
  children: React.ReactNode;
}> = ({ durationInFrames, overlapFrames = 10, children }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, overlapFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - overlapFrames, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  return <div style={{ width: "100%", height: "100%", opacity }}>{children}</div>;
};
