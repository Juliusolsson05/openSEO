import React from "react";
import { Skeleton, type SkeletonVariant } from "./Skeleton";

/* ────────────────────────────────────────────
 * ElementReveal — wraps a blog element and
 * transitions from skeleton → real content.
 *
 * Props:
 *   frame       — current composition frame
 *   revealAt    — frame at which content starts generating
 *   skeletonType — which skeleton shape to show
 *   duration    — frames for the crossfade (default 12)
 *   children    — the real element content
 *
 * States:
 *   frame < revealAt           → skeleton only
 *   revealAt ≤ frame < +dur    → crossfade
 *   frame ≥ revealAt + dur     → content only
 * ──────────────────────────────────────────── */

export const ElementReveal: React.FC<{
  frame: number;
  revealAt: number;
  skeletonType: SkeletonVariant;
  duration?: number;
  children: React.ReactNode;
}> = ({ frame, revealAt, skeletonType, duration = 12, children }) => {
  // Before reveal: skeleton only
  if (frame < revealAt) {
    return <Skeleton variant={skeletonType} />;
  }

  // During crossfade
  const elapsed = frame - revealAt;
  if (elapsed < duration) {
    const progress = elapsed / duration;
    return (
      <div style={{ position: "relative" }}>
        <div style={{ opacity: 1 - progress, position: "absolute", top: 0, left: 0, right: 0 }}>
          <Skeleton variant={skeletonType} />
        </div>
        <div style={{ opacity: progress }}>
          {children}
        </div>
      </div>
    );
  }

  // After reveal: content only
  return <>{children}</>;
};
