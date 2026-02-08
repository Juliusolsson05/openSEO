import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../constants";

/* ────────────────────────────────────────────
 * Outro Scene — 5s (150 frames @ 30fps)
 *
 *   0-15     Fade in
 *   10-40    Logo + wordmark spring in
 *   40-60    Tagline fades in
 *   60-85    CTA / URL fades in
 *   85-150   Hold + subtle pulse
 * ──────────────────────────────────────────── */

const F =
  "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

/* ── Grid overlay ── */
const GridOverlay: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity: 0.06,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
    }}
  />
);

export const ShortOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* Scene fade-in */
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* Logo entrance */
  const logoSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 14, stiffness: 100 },
    durationInFrames: 25,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.6, 1]);
  const logoOp = interpolate(logoSpring, [0, 1], [0, 1]);

  /* Wordmark */
  const wordSpring = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 18, stiffness: 110 },
    durationInFrames: 22,
  });

  /* Tagline */
  const tagSpring = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 25,
  });

  /* CTA */
  const ctaSpring = spring({
    frame: Math.max(0, frame - 60),
    fps,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 25,
  });

  /* Divider line */
  const dividerWidth = interpolate(frame, [35, 55], [0, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* Subtle logo pulse */
  const pulse = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.97, 1.03]
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #002050 0%, #0078D4 100%)",
        fontFamily: F,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        opacity: fadeIn,
      }}
    >
      <GridOverlay />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.00) 50%)",
        }}
      />
      {/* Geometric accents */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -60,
          width: 340,
          height: 340,
          transform: "rotate(12deg)",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -60,
          width: 260,
          height: 260,
          transform: "rotate(-8deg)",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.015)",
        }}
      />

      {/* Logo */}
      <div
        style={{
          opacity: logoOp,
          transform: `scale(${logoScale * pulse})`,
          marginBottom: 16,
          zIndex: 10,
        }}
      >
        <svg width={80} height={80} viewBox="0 0 32 32" fill="none">
          <path
            d="M16 2L3 28h5.5l2.5-5h10l2.5 5H29L16 2Zm0 9l4 8h-8l4-8Z"
            fill="#FFFFFF"
            fillRule="evenodd"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <h1
        style={{
          margin: 0,
          fontSize: 56,
          fontWeight: 700,
          color: "#FFFFFF",
          letterSpacing: "-0.03em",
          opacity: interpolate(wordSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(wordSpring, [0, 1], [20, 0])}px)`,
          zIndex: 10,
        }}
      >
        Aurora
      </h1>

      {/* Divider */}
      <div
        style={{
          width: dividerWidth,
          height: 2,
          borderRadius: 1,
          background: "rgba(255,255,255,0.25)",
          margin: "20px 0",
          zIndex: 10,
        }}
      />

      {/* Tagline */}
      <p
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 400,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.01em",
          opacity: interpolate(tagSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(tagSpring, [0, 1], [16, 0])}px)`,
          zIndex: 10,
        }}
      >
        AI-Powered Content. Built to Rank.
      </p>

      {/* CTA */}
      <div
        style={{
          marginTop: 32,
          opacity: interpolate(ctaSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(ctaSpring, [0, 1], [12, 0])}px)`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "14px 36px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: "0.02em",
            }}
          >
            nordtools.com/aurora
          </span>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>→</span>
        </div>
      </div>

      {/* Nordtools byline */}
      <p
        style={{
          position: "absolute",
          bottom: 40,
          margin: 0,
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.04em",
          opacity: interpolate(ctaSpring, [0, 1], [0, 1]),
          zIndex: 10,
        }}
      >
        by Nordtools
      </p>
    </AbsoluteFill>
  );
};
