import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FPS } from "../constants";

/* ────────────────────────────────────────────
 * Results Scene — 7s (210 frames @ 30fps)
 *
 * Animated traffic graph + key stat counters
 * showing the impact of Aurora on a website.
 *
 *   0-12     Fade in
 *   8-30     Header reveals
 *   20-130   Line chart draws left → right
 *   100-170  Stat counters animate up
 *   170-210  Hold
 * ──────────────────────────────────────────── */

const F =
  "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

/* ── Traffic data (6 months) ── */
const DATA = [
  { month: "Sep", value: 2400 },
  { month: "Oct", value: 3100 },
  { month: "Nov", value: 5800 },
  { month: "Dec", value: 8200 },
  { month: "Jan", value: 12400 },
  { month: "Feb", value: 18600 },
];

const STATS = [
  { value: 312, suffix: "%", label: "Organic Traffic Growth", color: "#22C55E" },
  { value: 4.2, suffix: "x", label: "Content Output", color: COLORS.primary, decimals: 1 },
  { value: 67, suffix: "%", label: "Less Time Per Post", color: "#A855F7" },
];

/* ── Chart geometry ── */
const SVG_W = 680;
const SVG_H = 280;
const PAD = { top: 24, right: 24, bottom: 44, left: 52 };
const PLOT_W = SVG_W - PAD.left - PAD.right;
const PLOT_H = SVG_H - PAD.top - PAD.bottom;
const MAX_VAL = 20000; // round ceiling for nice axis

function ptX(i: number) {
  return PAD.left + (i / (DATA.length - 1)) * PLOT_W;
}
function ptY(v: number) {
  return PAD.top + PLOT_H - (v / MAX_VAL) * PLOT_H;
}

const points = DATA.map((d, i) => ({ x: ptX(i), y: ptY(d.value) }));

// Line path (straight segments — clean look)
const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

// Area path (closed at bottom)
const areaPath =
  linePath +
  ` L${points[points.length - 1].x.toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)}` +
  ` L${points[0].x.toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)} Z`;

// Approximate total line length
let lineLength = 0;
for (let i = 1; i < points.length; i++) {
  const dx = points[i].x - points[i - 1].x;
  const dy = points[i].y - points[i - 1].y;
  lineLength += Math.sqrt(dx * dx + dy * dy);
}

/* ── Y-axis labels ── */
const Y_LABELS = [0, 5000, 10000, 15000, 20000];

/* ── Grid overlay ── */
const GridOverlay: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      opacity: 0.4,
    }}
  />
);

/* ── Aurora logo ── */
const AuroraLogo: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 2L3 28h5.5l2.5-5h10l2.5 5H29L16 2Zm0 9l4 8h-8l4-8Z"
      fill="#FFFFFF"
      fillRule="evenodd"
    />
  </svg>
);

/* ── Animated counter ── */
const Counter: React.FC<{
  frame: number;
  start: number;
  end: number;
  value: number;
  decimals?: number;
}> = ({ frame, start, end, value, decimals = 0 }) => {
  const n = interpolate(frame, [start, end], [0, value], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return <>{decimals > 0 ? n.toFixed(decimals) : Math.round(n)}</>;
};

/* ══════════════════════════════════════════════ */

export const ShortResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Fade in ── */
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ── Header entrance ── */
  const headerSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 22, stiffness: 120 },
    durationInFrames: 20,
  });

  /* ── Chart draw ── */
  const drawProgress = interpolate(frame, [20, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dashOffset = lineLength * (1 - drawProgress);
  const areaOpacity = interpolate(frame, [40, 130], [0, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ── Chart card entrance ── */
  const chartSpring = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 22,
  });
  const chartY = interpolate(chartSpring, [0, 1], [30, 0]);
  const chartOp = interpolate(chartSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0A1628 0%, #162238 100%)",
        fontFamily: F,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        opacity: fadeIn,
      }}
    >
      <GridOverlay />

      {/* Header */}
      <div
        style={{
          opacity: interpolate(headerSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(headerSpring, [0, 1], [16, 0])}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AuroraLogo size={20} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
            Aurora
          </span>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
            Results
          </span>
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          Content That Actually Ranks
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>
          Average organic traffic growth across Aurora-powered blogs over 6 months
        </p>
      </div>

      {/* Chart card */}
      <div
        style={{
          width: 740,
          borderRadius: 14,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: "20px 28px 16px",
          opacity: chartOp,
          transform: `translateY(${chartY}px)`,
          zIndex: 10,
        }}
      >
        {/* Subtitle row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
            Organic Sessions
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            Sep 2025 – Feb 2026
          </span>
        </div>

        {/* SVG Chart */}
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          {/* Horizontal grid lines */}
          {Y_LABELS.map((v) => {
            const y = ptY(v);
            return (
              <g key={v}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={SVG_W - PAD.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="rgba(255,255,255,0.3)"
                  fontFamily={F}
                >
                  {v >= 1000 ? `${v / 1000}K` : v}
                </text>
              </g>
            );
          })}

          {/* X-axis month labels */}
          {DATA.map((d, i) => (
            <text
              key={d.month}
              x={ptX(i)}
              y={SVG_H - 10}
              textAnchor="middle"
              fontSize={11}
              fontWeight={500}
              fill="rgba(255,255,255,0.4)"
              fontFamily={F}
            >
              {d.month}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill={COLORS.primary} opacity={areaOpacity} />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={lineLength}
            strokeDashoffset={dashOffset}
          />

          {/* Glow line (wider, blurred) */}
          <path
            d={linePath}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={lineLength}
            strokeDashoffset={dashOffset}
            opacity={0.2}
          />

          {/* Data points */}
          {points.map((p, i) => {
            // Each point appears when the line drawing reaches it
            const pointProgress = interpolate(
              drawProgress,
              [i / (DATA.length - 1) - 0.02, i / (DATA.length - 1) + 0.06],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            if (pointProgress <= 0) return null;
            const scale = interpolate(pointProgress, [0, 1], [0.3, 1]);
            return (
              <g key={i}>
                {/* Outer glow */}
                <circle cx={p.x} cy={p.y} r={10} fill={COLORS.primary} opacity={0.12 * pointProgress} />
                {/* Dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={5 * scale}
                  fill={COLORS.primary}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  opacity={pointProgress}
                />
                {/* Value label */}
                {i === DATA.length - 1 && pointProgress > 0.5 && (
                  <text
                    x={p.x}
                    y={p.y - 16}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight={700}
                    fill="#FFFFFF"
                    fontFamily={F}
                    opacity={interpolate(pointProgress, [0.5, 1], [0, 1])}
                  >
                    18.6K
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 16, zIndex: 10 }}>
        {STATS.map((stat, i) => {
          const cardStart = 100 + i * 12;
          const cardSpring = spring({
            frame: Math.max(0, frame - cardStart),
            fps,
            config: { damping: 18, stiffness: 140 },
            durationInFrames: 22,
          });
          const cardOp = interpolate(cardSpring, [0, 1], [0, 1]);
          const cardTransY = interpolate(cardSpring, [0, 1], [20, 0]);

          return (
            <div
              key={stat.label}
              style={{
                width: 230,
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "16px 20px",
                opacity: cardOp,
                transform: `translateY(${cardTransY}px)`,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 36,
                  fontWeight: 800,
                  color: stat.color,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {stat.value > 100 ? "+" : ""}
                <Counter
                  frame={frame}
                  start={cardStart + 6}
                  end={cardStart + 40}
                  value={stat.value}
                  decimals={stat.decimals}
                />
                {stat.suffix}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
