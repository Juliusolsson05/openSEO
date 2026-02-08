import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import React from "react";

/* ────────────────────────────────────────────
 * Intro — 15s (450 frames @ 30fps)
 * Landing-page style: blue gradient, grid overlay,
 * staggered text reveals explaining what Aurora is.
 *
 * Flow:
 *   0-2s    Logo + "Aurora" + "by Nordtools" fade in
 *   2-5s    Headline: "You tell us the topic. We write the blog post."
 *   5-8s    Subtitle explaining what Aurora does
 *   8-11s   Three feature pills animate in
 *   11-13s  CTA line
 *   13-15s  Everything holds, slight fade out
 * ──────────────────────────────────────────── */

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

const AuroraLogo: React.FC<{ size?: number }> = ({ size = 48 }) => (
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

/* Feature pill */
const FeaturePill: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "8px 18px", borderRadius: 2,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
  }}>
    <span style={{ fontSize: 16 }}>{icon}</span>
    <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)", fontFamily: F }}>{label}</span>
  </div>
);

/* Animated block helper */
const Reveal: React.FC<{
  children: React.ReactNode;
  delayFrames: number;
  y?: number;
  style?: React.CSSProperties;
}> = ({ children, delayFrames, y = 24, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ fps, frame: Math.max(0, frame - delayFrames), config: { damping: 28, stiffness: 120 }, durationInFrames: 24 });
  return (
    <div style={{
      opacity: interpolate(p, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(p, [0, 1], [y, 0])}px)`,
      ...style,
    }}>
      {children}
    </div>
  );
};

const FEATURES = [
  { icon: "📝", label: "Full blog posts in one click" },
  { icon: "🔍", label: "SEO-optimized content" },
  { icon: "✨", label: "AI-powered Autopilot" },
];

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade out at end (last 30 frames = 1s)
  const fadeOut = interpolate(frame, [420, 450], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #002050 0%, #0078D4 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: F, opacity: fadeOut,
    }}>
      <GridPattern />
      {/* Light gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.00) 50%)" }} />

      {/* Geometric accents */}
      <div style={{ position: "absolute", top: -120, right: -80, width: 400, height: 400, transform: "rotate(12deg)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }} />
      <div style={{ position: "absolute", bottom: -100, left: -60, width: 300, height: 300, transform: "rotate(-8deg)", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 0, maxWidth: 700, textAlign: "center" }}>
        {/* Logo + brand */}
        <Reveal delayFrames={0} y={16}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <AuroraLogo size={36} />
            <span style={{ fontSize: 24, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.01em" }}>Aurora</span>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)", margin: "0 4px" }} />
            <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)" }}>by Nordtools</span>
          </div>
        </Reveal>

        {/* Pill link */}
        <Reveal delayFrames={20} y={12}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", marginBottom: 28,
            background: "rgba(255,255,255,0.12)", borderRadius: 2,
            fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)",
          }}>
            AI-powered content generation platform →
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delayFrames={50} y={20}>
          <h1 style={{
            fontSize: 52, fontWeight: 600, color: "#FFFFFF",
            lineHeight: 1.12, letterSpacing: "-0.02em",
            margin: "0 0 16px",
          }}>
            You tell us the topic.
            <br />
            <span style={{ color: "rgba(255,255,255,0.55)" }}>We write the blog post.</span>
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal delayFrames={90} y={16}>
          <p style={{
            fontSize: 16, color: "rgba(255,255,255,0.55)",
            lineHeight: 1.6, maxWidth: 480, margin: "0 auto 32px",
          }}>
            Aurora turns a title into a full blog post — with FAQs, images,
            tables, and internal links. One click to enhance. Push to your CMS when ready.
          </p>
        </Reveal>

        {/* Feature pills */}
        <Reveal delayFrames={140} y={14} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {FEATURES.map((f, i) => {
              const stagger = 140 + i * 12;
              return (
                <Reveal key={i} delayFrames={stagger} y={10}>
                  <FeaturePill icon={f.icon} label={f.label} />
                </Reveal>
              );
            })}
          </div>
        </Reveal>

        {/* CTA buttons */}
        <Reveal delayFrames={200} y={12}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 24px", borderRadius: 2,
              background: "#FFFFFF",
              fontSize: 14, fontWeight: 600, color: "#0078D4",
            }}>
              Generate your first post free →
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 24px", borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.25)",
              fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.8)",
            }}>
              See how it works
            </div>
          </div>
        </Reveal>

        {/* Trust line */}
        <Reveal delayFrames={230} y={8}>
          <p style={{
            fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 20,
            letterSpacing: "0.02em",
          }}>
            Free 14-day trial · No credit card · Takes 2 minutes to set up
          </p>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
