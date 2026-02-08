import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cursor, type Waypoint } from "./components/Cursor";
import { useElementPosition } from "./hooks/useElementPosition";
import { COLORS, FPS, WIDTH, HEIGHT, sec } from "./constants";
import { ShortBlogGenScene } from "./scenes/ShortBlogGenScene";
import { ShortResultsScene } from "./scenes/ShortResultsScene";

/* ────────────────────────────────────────────
 * Short Action Demo — 30s total
 * Styled after the Aurora/Nordtools landing page.
 * No sidebar/dashboard chrome.
 *
 *   0-1s    : Quick branded intro
 *   1-7s    : "What is your business?" input scene
 *   7-14s   : Generated titles reveal + selection
 *   14-23s  : Cinematic blog post generation
 *   23-30s  : Animated results / traffic stats
 * ──────────────────────────────────────────── */

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";
const BUSINESS_TEXT = "Sustainable packaging solutions for e-commerce";
const TITLES = [
  "10 Eco-Friendly Packaging Materials That Won't Break the Bank",
  "How Sustainable Packaging Boosts Customer Loyalty in E-Commerce",
  "The Complete Guide to Reducing Shipping Waste Without Increasing Costs",
  "Biodegradable vs Recyclable Packaging: Which Is Right for Your Store?",
  "Why Switching to Sustainable Packaging Increased Our Revenue by 23%",
];

/* ── Aurora "A" logo ── */
const AuroraLogo: React.FC<{ size?: number; light?: boolean }> = ({ size = 28, light = false }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M16 2L3 28h5.5l2.5-5h10l2.5 5H29L16 2Zm0 9l4 8h-8l4-8Z" fill={light ? "#FFFFFF" : "#0078D4"} fillRule="evenodd" />
  </svg>
);

/* ── Grid pattern overlay ── */
const GridPattern: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => (
  <div style={{
    position: "absolute", inset: 0, opacity,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
    backgroundSize: "32px 32px",
  }} />
);

/* ── Typed text ── */
const TypedText: React.FC<{ text: string; startFrame: number; speed?: number }> = ({ text, startFrame, speed = 2 }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.min(text.length, Math.floor(elapsed / speed));
  const showCursor = frame >= startFrame && chars < text.length;
  return (
    <span>
      {text.slice(0, chars)}
      {showCursor && <span style={{ opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0, color: "#FFFFFF" }}>|</span>}
    </span>
  );
};

/* ── Spinner ── */
const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = "#FFFFFF" }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${frame * 12}deg)` }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

/* ── Fade + slide in ── */
const FadeIn: React.FC<{ children: React.ReactNode; startFrame: number; y?: number; style?: React.CSSProperties }> = ({ children, startFrame, y = 20, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ fps, frame: Math.max(0, frame - startFrame), config: { damping: 28, stiffness: 140 }, durationInFrames: 22 });
  if (frame < startFrame) return null;
  return (
    <div style={{ opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateY(${interpolate(p, [0, 1], [y, 0])}px)`, ...style }}>
      {children}
    </div>
  );
};

/* ══════════════════════════════════════════════
 * Scene 1: Branded Intro (1s)
 * ══════════════════════════════════════════════ */
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoP = spring({ fps, frame, config: { damping: 20, stiffness: 120 }, durationInFrames: 18 });
  const opacity = interpolate(logoP, [0, 1], [0, 1]);
  const scale = interpolate(logoP, [0, 1], [0.8, 1]);

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #002050 0%, #0078D4 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12,
    }}>
      <GridPattern />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.00) 50%)" }} />
      <div style={{ opacity, transform: `scale(${scale})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, zIndex: 10 }}>
        <AuroraLogo size={64} light />
        <span style={{ fontSize: 32, fontWeight: 600, color: "#FFFFFF", fontFamily: F, letterSpacing: "-0.02em" }}>Aurora</span>
        <span style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", fontFamily: F }}>by Nordtools</span>
      </div>
    </AbsoluteFill>
  );
};

/* ══════════════════════════════════════════════
 * Scene 2: Business Input (6s = 180 frames)
 * ══════════════════════════════════════════════ */
const INPUT_FOCUS = 20;
const TYPING_START = 35;
const TYPING_END = 120;
const BTN_PRESS = 140;

const InputScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLDivElement>(null);
  const generateBtnRef = React.useRef<HTMLDivElement>(null);

  const inputPos = useElementPosition(containerRef, inputRef);
  const btnPos = useElementPosition(containerRef, generateBtnRef);

  const isTyping = frame >= INPUT_FOCUS && frame < BTN_PRESS;
  const isLoading = frame >= BTN_PRESS + 6;
  const btnSpring = spring({ fps, frame: Math.max(0, frame - BTN_PRESS), config: { damping: 15, stiffness: 300 }, durationInFrames: 8 });
  const btnScale = frame >= BTN_PRESS && frame < BTN_PRESS + 8 ? interpolate(btnSpring, [0, 1], [1, 0.95]) : 1;

  // Build cursor waypoints from measured positions
  const cursorWps: Waypoint[] = React.useMemo(() => {
    const inputX = inputPos ? inputPos.x - 200 : 700;
    const inputY = inputPos ? inputPos.y : 538;
    const bX = btnPos ? btnPos.x : 1230;
    const bY = btnPos ? btnPos.y : 538;
    return [
      { frame: 0,   x: 960, y: inputY + 120 },
      { frame: 18,  x: inputX, y: inputY, click: true },
      { frame: 115, x: inputX + 20, y: inputY + 5 },
      { frame: 135, x: bX, y: bY, click: true },
      { frame: 180, x: bX, y: bY + 20 },
    ];
  }, [inputPos, btnPos]);

  return (
    <AbsoluteFill ref={containerRef} style={{
      background: "linear-gradient(135deg, #002050 0%, #0078D4 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: F,
    }}>
      <GridPattern />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.00) 50%)" }} />

      {/* Geometric accent shapes */}
      <div style={{ position: "absolute", top: -80, right: -100, width: 300, height: 300, transform: "rotate(12deg)", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }} />
      <div style={{ position: "absolute", bottom: -100, left: -80, width: 260, height: 260, transform: "rotate(-12deg)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }} />

      <div style={{ position: "relative", zIndex: 10, width: 680, display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        {/* Logo + label */}
        <FadeIn startFrame={0} y={12}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <AuroraLogo size={20} light />
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "-0.01em" }}>Aurora</span>
            <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>by Nordtools</span>
          </div>
        </FadeIn>

        {/* Headline */}
        <FadeIn startFrame={5} style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 44, fontWeight: 600, color: "#FFFFFF", margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            You tell us the topic.
            <br />
            <span style={{ color: "rgba(255,255,255,0.55)" }}>We write the blog post.</span>
          </h1>
        </FadeIn>

        {/* Subtitle */}
        <FadeIn startFrame={12} style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6, maxWidth: 480 }}>
            Describe your business. Aurora generates SEO-optimized blog post titles in seconds.
          </p>
        </FadeIn>

        {/* Input */}
        <FadeIn startFrame={18}>
          <div ref={inputRef} style={{
            width: 680, height: 56, borderRadius: 4, overflow: "hidden",
            background: "rgba(255,255,255,0.12)",
            border: `1.5px solid ${isTyping ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}`,
            display: "flex", alignItems: "center", padding: "0 6px 0 20px",
            boxShadow: isTyping ? "0 0 0 3px rgba(255,255,255,0.08)" : "none",
          }}>
            <div style={{ flex: 1, fontSize: 16, color: "#FFFFFF" }}>
              {frame < TYPING_START ? (
                <span style={{ color: "rgba(255,255,255,0.3)" }}>Describe your business...</span>
              ) : (
                <TypedText text={BUSINESS_TEXT} startFrame={TYPING_START} speed={2} />
              )}
            </div>
            <div ref={generateBtnRef} style={{
              height: 42, padding: "0 20px", borderRadius: 3,
              background: frame >= TYPING_END ? "#FFFFFF" : "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
              color: frame >= TYPING_END ? "#0078D4" : "rgba(255,255,255,0.4)",
              transform: `scale(${btnScale})`, transition: "none",
            }}>
              {isLoading ? (
                <><Spinner size={14} color="#0078D4" /> Generating...</>
              ) : (
                <>✨ Generate</>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Trust line */}
        <FadeIn startFrame={22}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", letterSpacing: "0.02em" }}>
            Free 14-day trial · No credit card · Takes 2 minutes
          </p>
        </FadeIn>
      </div>

      <Cursor waypoints={cursorWps} />
    </AbsoluteFill>
  );
};

/* ══════════════════════════════════════════════
 * Scene 3: Generated Titles (7s = 210 frames)
 * ══════════════════════════════════════════════ */
const STAGGER = 14;
const PICK_LABEL = 120;
const CLICK_FRAME = 160;
const GENERATING_FRAME = 170;

const TitlesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const titleBtnRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Measure the 3rd title's "Generate Post" button (index 2)
  const targetRef = React.useRef<HTMLDivElement | null>(null);
  const targetPos = useElementPosition(containerRef, targetRef);

  const cursorWps: Waypoint[] = React.useMemo(() => {
    const tX = targetPos ? targetPos.x : 1320;
    const tY = targetPos ? targetPos.y : 495;
    return [
      { frame: 0,   x: 960,  y: 300 },
      { frame: 60,  x: 900,  y: tY - 30 },
      { frame: 130, x: tX,   y: tY },
      { frame: 155, x: tX,   y: tY, click: true },
      { frame: 240, x: tX,   y: tY + 15 },
    ];
  }, [targetPos]);

  return (
    <AbsoluteFill ref={containerRef} style={{
      background: "#F2F2F2",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: F,
    }}>
      <div style={{ width: 800, display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <FadeIn startFrame={0}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <AuroraLogo size={20} />
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.foreground }}>Aurora</span>
            <div style={{ width: 1, height: 14, background: COLORS.border, margin: "0 4px" }} />
            <span style={{ fontSize: 11, color: COLORS.mutedForeground }}>Generated Titles</span>
          </div>
        </FadeIn>

        <FadeIn startFrame={4}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: COLORS.primary, margin: "0 0 6px" }}>
              Based on your description
            </p>
            <p style={{ fontSize: 14, color: COLORS.mutedForeground, margin: 0, lineHeight: 1.5 }}>
              "<span style={{ fontWeight: 600, color: COLORS.foreground }}>{BUSINESS_TEXT}</span>"
            </p>
          </div>
        </FadeIn>

        {/* Divider */}
        <FadeIn startFrame={8}>
          <div style={{ height: 1, background: COLORS.border }} />
        </FadeIn>

        {/* Title cards */}
        {TITLES.map((title, i) => {
          const titleStart = 15 + i * STAGGER;
          if (frame < titleStart) return null;

          const entrance = spring({ fps, frame: Math.max(0, frame - titleStart), config: { damping: 24, stiffness: 160 }, durationInFrames: 20 });
          const opacity = interpolate(entrance, [0, 1], [0, 1]);
          const y = interpolate(entrance, [0, 1], [14, 0]);
          const isSelected = frame >= CLICK_FRAME && i === 2;
          const isGenerating = frame >= GENERATING_FRAME && i === 2;

          return (
            <div key={i} style={{
              opacity, transform: `translateY(${y}px)`,
              background: isSelected ? "#DEECF9" : "#FFFFFF",
              borderRadius: 4,
              border: `1.5px solid ${isSelected ? COLORS.primary : COLORS.border}`,
              boxShadow: isSelected ? `0 0 0 3px ${COLORS.primary}20` : "0 1px 3px rgba(0,0,0,0.04)",
              padding: "14px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: isSelected ? COLORS.primary : "#F5F5F5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  color: isSelected ? "#FFFFFF" : COLORS.mutedForeground,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: COLORS.foreground, lineHeight: 1.4 }}>{title}</span>
              </div>

              <div
                ref={i === 2 ? (el) => { targetRef.current = el; } : undefined}
                style={{
                  height: 32, padding: "0 14px", borderRadius: 2, flexShrink: 0,
                  background: isGenerating ? COLORS.primary : (isSelected ? COLORS.primary : "#FFFFFF"),
                  border: isSelected ? "none" : `1px solid ${COLORS.border}`,
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                  color: isSelected ? "#FFFFFF" : COLORS.foreground,
                }}
              >
                {isGenerating ? (
                  <><Spinner size={12} color="#FFFFFF" /> Generating...</>
                ) : (
                  <>Generate Post →</>
                )}
              </div>
            </div>
          );
        })}

        {/* Pick label */}
        {frame >= PICK_LABEL && frame < GENERATING_FRAME && (
          <FadeIn startFrame={PICK_LABEL} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: COLORS.foreground, margin: "8px 0 0" }}>
              Which one do you like best?
            </p>
          </FadeIn>
        )}

        {/* Generating confirmation */}
        {frame >= GENERATING_FRAME && (
          <FadeIn startFrame={GENERATING_FRAME} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: COLORS.primary, margin: "8px 0 0" }}>
              ✨ Creating your blog post...
            </p>
          </FadeIn>
        )}
      </div>

      <Cursor waypoints={cursorWps} />
    </AbsoluteFill>
  );
};

/* ══════════════════════════════════════════════
 * Main Composition
 * ══════════════════════════════════════════════ */
export const ShortDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFFFFF" }}>
    <Sequence from={0} durationInFrames={sec(1)}>
      <IntroScene />
    </Sequence>
    <Sequence from={sec(1)} durationInFrames={sec(6)}>
      <InputScene />
    </Sequence>
    <Sequence from={sec(7)} durationInFrames={sec(7)}>
      <TitlesScene />
    </Sequence>
    <Sequence from={sec(14)} durationInFrames={sec(9)}>
      <ShortBlogGenScene />
    </Sequence>
    <Sequence from={sec(23)} durationInFrames={sec(7)}>
      <ShortResultsScene />
    </Sequence>
  </AbsoluteFill>
);
