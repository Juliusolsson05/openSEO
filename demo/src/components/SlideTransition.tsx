import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { WIDTH, HEIGHT } from "../constants";

/* ────────────────────────────────────────────
 * Slide/wipe transition wrapper.
 *
 * Wraps a scene and adds a slide-in animation
 * at the start (first `durationFrames` frames).
 *
 * Directions: "left" | "right" | "up" | "down"
 * The scene slides IN from that direction.
 * ──────────────────────────────────────────── */

type Direction = "left" | "right" | "up" | "down";

export const SlideTransition: React.FC<{
  children: React.ReactNode;
  direction?: Direction;
  durationFrames?: number;
}> = ({ children, direction = "right", durationFrames = 12 }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  let translateX = 0;
  let translateY = 0;

  switch (direction) {
    case "right":
      translateX = interpolate(progress, [0, 1], [WIDTH, 0]);
      break;
    case "left":
      translateX = interpolate(progress, [0, 1], [-WIDTH, 0]);
      break;
    case "down":
      translateY = interpolate(progress, [0, 1], [HEIGHT, 0]);
      break;
    case "up":
      translateY = interpolate(progress, [0, 1], [-HEIGHT, 0]);
      break;
  }

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${translateX}px, ${translateY}px)`,
        willChange: "transform",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
