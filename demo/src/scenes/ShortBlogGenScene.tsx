import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { staticFile } from "remotion";
import { COLORS, FPS } from "../constants";

const coverImage = staticFile("images/cover-packaging.jpg");

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

const POST_TITLE =
  "The Complete Guide to Reducing Shipping Waste Without Increasing Costs";

const TOC_ITEMS = [
  "Introduction",
  "Common Sources of Shipping Waste",
  "5 Strategies to Cut Waste",
  "Cost-Benefit Analysis",
  "Implementation Checklist",
  "FAQ",
];

const STRATEGIES = [
  {
    title: "Right-size your boxes",
    body: "Use packaging software and dimensional audits to minimize empty space and reduce material usage by up to 20%.",
  },
  {
    title: "Switch to mono-materials",
    body: "Favor single-stream paper or plastic systems to simplify sorting and improve recycling rates at end-of-life.",
  },
  {
    title: "Eliminate void fill",
    body: "Use custom inserts and pack-out logic to avoid excessive air pillows and kraft paper fillers.",
  },
  {
    title: "Use recycled content",
    body: "Adopt high-PCR corrugate and mailers to cut virgin material demand while maintaining durability.",
  },
  {
    title: "Optimize shipping routes",
    body: "Consolidate shipments and reduce split orders to shrink both emissions and packaging touchpoints.",
  },
];

const CHECKLIST_ITEMS = [
  "Audit current packaging SKUs and dimensions",
  "Identify top 20% highest-waste shipment profiles",
  "Pilot right-sizing with one fulfillment partner",
  "Measure damage rate and customer satisfaction delta",
  "Roll out and review monthly savings targets",
];

const FAQ_ITEMS = [
  {
    q: "Will sustainable packaging increase my costs?",
    a: "Not necessarily. Most brands see lower costs by reducing dimensional weight, void fill, and shipping inefficiencies.",
  },
  {
    q: "How quickly can we implement these changes?",
    a: "Many teams can launch a pilot within 2–4 weeks, then scale based on packaging and logistics data.",
  },
  {
    q: "What KPIs should we track?",
    a: "Track packaging cost per order, damage rate, dimensional utilization, return rate, and customer sentiment.",
  },
];

type RevealBlockProps = {
  frame: number;
  start: number;
  end: number;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const GridOverlay: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        opacity: 0.35,
      }}
    />
  );
};

const SkeletonLine: React.FC<{ frame: number; width: string; height?: number }> = ({
  frame,
  width,
  height = 12,
}) => {
  const pulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.6, 1]);
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: "linear-gradient(90deg, #ECECEC 0%, #F7F7F7 50%, #ECECEC 100%)",
        opacity: pulse,
      }}
    />
  );
};

const RevealBlock: React.FC<RevealBlockProps> = ({
  frame,
  start,
  end,
  skeleton,
  children,
  style,
}) => {
  const transition = interpolate(frame, [start, start + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const flash = interpolate(frame, [end, end + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const showSkeleton = frame < start + 10;
  const showContent = frame >= start;

  return (
    <div
      style={{
        position: "relative",
        paddingLeft: 10,
        borderLeft: `3px solid rgba(0,120,212,${0.55 * flash})`,
        ...style,
      }}
    >
      {/* Stack skeleton and content on top of each other during crossfade */}
      {showSkeleton && (
        <div style={{
          opacity: showContent ? 1 - transition : 1,
          pointerEvents: "none",
          position: showContent ? "absolute" : "relative",
          inset: showContent ? 0 : undefined,
          zIndex: 1,
        }}>
          {skeleton}
        </div>
      )}
      <div style={{
        opacity: showContent ? transition : 0,
        visibility: showContent ? "visible" : "hidden",
      }}>
        {children}
      </div>
    </div>
  );
};

const Spinner: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: `rotate(${frame * 12}deg)` }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

const DonutChart: React.FC<{ frame: number; start: number; value: number }> = ({
  frame,
  start,
  value,
}) => {
  const progress = interpolate(frame, [start, start + 25], [0, value], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const r = 42;
  const c = 2 * Math.PI * r;
  const dashOffset = c - (progress / 100) * c;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={90} height={90} viewBox="0 0 110 110">
        <g transform="translate(55 55) rotate(-90)">
          <circle cx={0} cy={0} r={r} stroke="#E9EEF3" strokeWidth={10} fill="none" />
          <circle
            cx={0}
            cy={0}
            r={r}
            stroke={COLORS.primary}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={dashOffset}
          />
        </g>
        <text
          x="55"
          y="59"
          textAnchor="middle"
          fontFamily={F}
          fontWeight={700}
          fontSize={24}
          fill={COLORS.foreground}
        >
          {Math.round(progress)}%
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 430 }}>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.foreground }}>
          Consumer Preference
        </p>
        <p style={{ margin: 0, fontSize: 13, color: COLORS.mutedForeground, lineHeight: 1.5 }}>
          67% of online shoppers say eco-friendly packaging positively impacts brand trust and repeat purchases.
        </p>
      </div>
    </div>
  );
};

export const ShortBlogGenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeFromWhite = interpolate(frame, [0, 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardEntrance = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.9 },
    durationInFrames: 18,
  });

  const cardY = interpolate(cardEntrance, [0, 1], [40, 0]);
  const cardOpacity = interpolate(cardEntrance, [0, 1], [0, 1]);

  const progress = interpolate(frame, [15, 195], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scrollY = interpolate(
    frame,
    [0, 50, 80, 120, 155, 185, 270],
    [0, 0, 100, 250, 380, 460, 460],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const readyBounce = spring({
    frame: Math.max(0, frame - 200),
    fps: FPS,
    config: { damping: 9, stiffness: 150 },
    durationInFrames: 20,
  });

  const statusScale = frame >= 200 ? interpolate(readyBounce, [0, 1], [1, 1.08]) : 1;
  const statusBlue = frame < 200;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0A1628 0%, #162238 100%)",
        fontFamily: F,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <GridOverlay />

      <div
        style={{
          width: 840,
          height: 920,
          borderRadius: 16,
          background: COLORS.card,
          boxShadow:
            "0 30px 80px rgba(2,12,27,0.45), 0 10px 30px rgba(2,12,27,0.30), 0 2px 8px rgba(2,12,27,0.20)",
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* HEADER */}
        <div style={{ padding: "24px 28px 0", background: COLORS.card, position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width={20} height={20} viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2L3 28h5.5l2.5-5h10l2.5 5H29L16 2Zm0 9l4 8h-8l4-8Z"
                  fill={COLORS.primary}
                  fillRule="evenodd"
                />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.foreground }}>Aurora</span>
              <div style={{ width: 1, height: 14, background: COLORS.border }} />
              <span style={{ fontSize: 12, color: COLORS.mutedForeground }}>Blog Post</span>
            </div>

            <div
              style={{
                transform: `scale(${statusScale})`,
                transformOrigin: "center right",
                transition: "none",
                height: 30,
                padding: "0 12px",
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: statusBlue ? "rgba(0,120,212,0.12)" : "rgba(16,124,16,0.14)",
                border: `1px solid ${statusBlue ? "rgba(0,120,212,0.3)" : "rgba(16,124,16,0.3)"}`,
                color: statusBlue ? COLORS.primary : COLORS.success,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {statusBlue ? (
                <>
                  <Spinner frame={frame} />
                  Generating...
                </>
              ) : (
                <>✅ Post Ready</>
              )}
            </div>
          </div>

          <h1
            style={{
              margin: "10px 0 10px",
              fontSize: 28,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: COLORS.foreground,
              fontWeight: 700,
            }}
          >
            {POST_TITLE}
          </h1>

          <div
            style={{
              height: 3,
              borderRadius: 999,
              background: "#E8EEF6",
              overflow: "hidden",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                background: COLORS.primary,
                boxShadow: "0 0 14px rgba(0,120,212,0.45)",
              }}
            />
          </div>
          <div style={{ height: 1, background: COLORS.border, marginBottom: 0 }} />
        </div>

        {/* BODY VIEWPORT */}
        <div style={{ height: 780, overflow: "hidden", position: "relative" }}>
          <div
            style={{
              transform: `translateY(-${scrollY}px)`,
              padding: "12px 28px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Cover image */}
            <RevealBlock frame={frame} start={20} end={30}
              skeleton={<div style={{ height: 190, borderRadius: 10, background: "#F1F3F5" }} />}
            >
              <div style={{ height: 190, borderRadius: 10, overflow: "hidden" }}>
                <img src={coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            </RevealBlock>

            {/* Introduction */}
            <RevealBlock frame={frame} start={35} end={50}
              skeleton={
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <SkeletonLine frame={frame} width="30%" height={16} />
                  <SkeletonLine frame={frame} width="100%" />
                  <SkeletonLine frame={frame} width="94%" />
                  <SkeletonLine frame={frame} width="82%" />
                </div>
              }
            >
              <div>
                <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: COLORS.foreground }}>Introduction</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: COLORS.mutedForeground }}>
                  E-commerce shipping generates billions of tons of packaging waste annually. Yet reducing waste
                  doesn't have to mean increasing costs — smarter packaging strategies actually save money while
                  improving customer satisfaction and brand perception.
                </p>
              </div>
            </RevealBlock>

            {/* Case Study Card */}
            <RevealBlock frame={frame} start={55} end={95}
              skeleton={
                <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
                  <div style={{ height: 56, background: "#E8EEF3" }} />
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <SkeletonLine frame={frame} width="60%" height={10} />
                        <SkeletonLine frame={frame} width="100%" />
                        <SkeletonLine frame={frame} width="85%" />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <SkeletonLine frame={frame} width="55%" height={10} />
                        <SkeletonLine frame={frame} width="95%" />
                        <SkeletonLine frame={frame} width="80%" />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {[1,2,3,4].map(k => <div key={k} style={{ height: 28, borderRadius: 6, background: "#F1F3F5" }} />)}
                    </div>
                  </div>
                </div>
              }
            >
              <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${COLORS.border}`, background: COLORS.card }}>
                {/* Header */}
                <div style={{
                  background: "linear-gradient(135deg, #1E3A5F 0%, #2D5A8E 100%)",
                  padding: "14px 18px", color: "#FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>How Vink Cut Packaging Waste by 40%</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, opacity: 0.7 }}>
                      <span>🏢</span> Vink E-commerce · Sustainability
                    </p>
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: 6, background: "#FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800, color: "#1E3A5F",
                  }}>V</div>
                </div>

                {/* Body */}
                <div style={{ padding: "14px 18px" }}>
                  {/* Challenge / Solution */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.mutedForeground }}>The Challenge</p>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: COLORS.foreground }}>
                        Manual packaging process with excessive void fill, oversized boxes, and rising material costs across 800+ daily shipments.
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.mutedForeground }}>The Solution</p>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: COLORS.foreground }}>
                        Adopted right-sizing algorithms and switched to mono-material corrugate, eliminating plastic void fill entirely.
                      </p>
                    </div>
                  </div>

                  {/* Key Results */}
                  <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.mutedForeground }}>Key Results</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                      "40% less packaging waste",
                      "22% reduction in shipping costs",
                      "3x faster pack-out time",
                      "91% customer satisfaction score",
                    ].map((result, ri) => {
                      const rOpacity = interpolate(frame, [72 + ri * 5, 82 + ri * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                      return (
                        <div key={ri} style={{
                          opacity: rOpacity,
                          display: "flex", alignItems: "center", gap: 6,
                          borderRadius: 6, border: "1px solid #A7F3D0", background: "#ECFDF5",
                          padding: "6px 10px", fontSize: 11, fontWeight: 600, color: "#047857",
                        }}>
                          <span style={{ fontSize: 10 }}>✅</span> {result}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </RevealBlock>

            {/* Bar Chart — Cost Savings */}
            <RevealBlock frame={frame} start={100} end={130}
              skeleton={
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <SkeletonLine frame={frame} width="50%" height={16} />
                  {[0.9, 0.7, 0.55, 0.4, 0.3].map((w, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <SkeletonLine frame={frame} width="22%" height={10} />
                      <div style={{ flex: 1, height: 18, borderRadius: 4, background: "#F1F3F5" }} />
                    </div>
                  ))}
                </div>
              }
            >
              <div>
                <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: COLORS.foreground }}>
                  Estimated Annual Savings
                </h3>
                {[
                  { label: "Right-sizing", value: 12400, max: 12400 },
                  { label: "Mono-materials", value: 8200, max: 12400 },
                  { label: "Void fill removal", value: 6800, max: 12400 },
                  { label: "Recycled content", value: 4100, max: 12400 },
                  { label: "Route optimization", value: 3200, max: 12400 },
                ].map((bar, bi) => {
                  const barStart = 108 + bi * 5;
                  const barWidth = interpolate(frame, [barStart, barStart + 18], [0, (bar.value / bar.max) * 100], {
                    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
                  });
                  const labelOpacity = interpolate(frame, [barStart + 12, barStart + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  return (
                    <div key={bi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ width: 100, fontSize: 11, color: COLORS.mutedForeground, textAlign: "right", flexShrink: 0 }}>{bar.label}</span>
                      <div style={{ flex: 1, height: 20, borderRadius: 4, background: "#F0F4F8", overflow: "hidden" }}>
                        <div style={{
                          width: `${barWidth}%`, height: "100%", borderRadius: 4,
                          background: `linear-gradient(90deg, ${COLORS.primary} 0%, #3A9AE8 100%)`,
                        }} />
                      </div>
                      <span style={{ width: 56, fontSize: 11, fontWeight: 700, color: COLORS.foreground, opacity: labelOpacity }}>
                        ${(bar.value / 1000).toFixed(1)}K
                      </span>
                    </div>
                  );
                })}
              </div>
            </RevealBlock>

            {/* Statistic — Donut */}
            <RevealBlock frame={frame} start={135} end={155}
              skeleton={
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 90, height: 90, borderRadius: 999, background: "#F1F3F5", flexShrink: 0 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    <SkeletonLine frame={frame} width="38%" height={14} />
                    <SkeletonLine frame={frame} width="86%" />
                    <SkeletonLine frame={frame} width="76%" />
                  </div>
                </div>
              }
            >
              <DonutChart frame={frame} start={139} value={67} />
            </RevealBlock>

            {/* FAQ */}
            <RevealBlock frame={frame} start={160} end={185}
              skeleton={
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <SkeletonLine frame={frame} width="14%" height={16} />
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 10 }}>
                      <SkeletonLine frame={frame} width={`${76 - i * 8}%`} />
                    </div>
                  ))}
                </div>
              }
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.foreground }}>FAQ</h3>
                {FAQ_ITEMS.map((item, i) => {
                  const expanded = i === 0;
                  return (
                    <div key={item.q} style={{
                      border: `1px solid ${expanded ? "rgba(0,120,212,0.35)" : COLORS.border}`,
                      borderRadius: 8, padding: "10px 12px",
                      background: expanded ? "rgba(0,120,212,0.04)" : "#FFFFFF",
                    }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.foreground }}>{item.q}</p>
                      {expanded && (
                        <p style={{ margin: "6px 0 0", fontSize: 12, lineHeight: 1.6, color: COLORS.mutedForeground }}>{item.a}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </RevealBlock>

            <div style={{ height: 40 }} />
          </div>
        </div>
      </div>

      {/* Initial cinematic fade from white */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#FFFFFF",
          opacity: fadeFromWhite,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
