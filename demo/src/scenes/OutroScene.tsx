import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

/* ────────────────────────────────────────────
 * Outro — 8s (240 frames @ 30fps)
 * Landing-page CTA style: blue gradient, grid,
 * final call-to-action with logo.
 *
 * Flow:
 *   0-1s    Fade in from black
 *   1-4s    Logo + headline + subtitle reveal
 *   4-6s    CTA buttons appear
 *   6-8s    Hold
 * ──────────────────────────────────────────── */

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

const AuroraLogo: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 2L3 28h5.5l2.5-5h10l2.5 5H29L16 2Zm0 9l4 8h-8l4-8Z" fill="#FFFFFF" fillRule="evenodd" />
  </svg>
);

const GridPattern: React.FC = () => (
  <div style={{
    position: "absolute", inset: 0, opacity: 0.06,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
    backgroundSize: "32px 32px",
  }} />
);

const Reveal: React.FC<{
  children: React.ReactNode;
  delayFrames: number;
  y?: number;
}> = ({ children, delayFrames, y = 20 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ fps, frame: Math.max(0, frame - delayFrames), config: { damping: 28, stiffness: 120 }, durationInFrames: 24 });
  return (
    <div style={{
      opacity: interpolate(p, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(p, [0, 1], [y, 0])}px)`,
    }}>
      {children}
    </div>
  );
};

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade in from previous scene
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #002050 0%, #0078D4 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: F, opacity: fadeIn,
    }}>
      <GridPattern />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.00) 50%)" }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 600 }}>
        {/* Logo */}
        <Reveal delayFrames={20}>
          <AuroraLogo size={48} />
        </Reveal>

        {/* Headline */}
        <Reveal delayFrames={40} y={16}>
          <h2 style={{
            fontSize: 38, fontWeight: 600, color: "#FFFFFF",
            lineHeight: 1.15, letterSpacing: "-0.01em",
            margin: "20px 0 0",
          }}>
            Your first post takes 5 minutes.
          </h2>
        </Reveal>

        {/* Subtitle */}
        <Reveal delayFrames={70} y={12}>
          <p style={{
            fontSize: 15, color: "rgba(255,255,255,0.55)",
            lineHeight: 1.6, maxWidth: 440, margin: "14px auto 0",
          }}>
            Sign up, paste your URL, pick a topic, and generate.
            That's it. Free for 14 days.
          </p>
        </Reveal>

        {/* CTA buttons */}
        <Reveal delayFrames={110} y={10}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 24px", borderRadius: 2,
              background: "#FFFFFF",
              fontSize: 14, fontWeight: 600, color: "#0078D4",
            }}>
              Generate your first post →
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 24px", borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.25)",
              fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.8)",
            }}>
              See a live example
            </div>
          </div>
        </Reveal>

        {/* URL */}
        <Reveal delayFrames={140} y={8}>
          <p style={{
            fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.35)",
            marginTop: 24, letterSpacing: "0.01em",
          }}>
            nordwebb.com
          </p>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
