import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../constants";

/* ────────────────────────────────────────────
 * Results Scene — 5s (150 frames @ 30fps)
 *
 * Animated traffic graph showing Aurora's impact.
 *
 *   0-10     Fade in
 *   6-22     Header reveals
 *   14-100   Line chart draws left → right
 *   100-150  Hold
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

/* ── Chart geometry ── */
const SVG_W = 680;
const SVG_H = 280;
const PAD = { top: 24, right: 24, bottom: 44, left: 52 };
const PLOT_W = SVG_W - PAD.left - PAD.right;
const PLOT_H = SVG_H - PAD.top - PAD.bottom;
const MAX_VAL = 20000;

function ptX(i: number) {
  return PAD.left + (i / (DATA.length - 1)) * PLOT_W;
}
function ptY(v: number) {
  return PAD.top + PLOT_H - (v / MAX_VAL) * PLOT_H;
}

const points = DATA.map((d, i) => ({ x: ptX(i), y: ptY(d.value) }));
const linePath = points
  .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
  .join(" ");
const areaPath =
  linePath +
  ` L${points[points.length - 1].x.toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)}` +
  ` L${points[0].x.toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)} Z`;

let lineLength = 0;
for (let i = 1; i < points.length; i++) {
  const dx = points[i].x - points[i - 1].x;
  const dy = points[i].y - points[i - 1].y;
  lineLength += Math.sqrt(dx * dx + dy * dy);
}

const Y_LABELS = [0, 5000, 10000, 15000, 20000];

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

/* ══════════════════════════════════════════════ */

export const ShortResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 20, stiffness: 140 },
    durationInFrames: 16,
  });

  const drawProgress = interpolate(frame, [14, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dashOffset = lineLength * (1 - drawProgress);
  const areaOpacity = interpolate(frame, [30, 100], [0, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chartSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 18, stiffness: 120 },
    durationInFrames: 18,
  });
  const chartY = interpolate(chartSpring, [0, 1], [24, 0]);
  const chartOp = interpolate(chartSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #002050 0%, #0078D4 100%)",
        fontFamily: F,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        opacity: fadeIn,
      }}
    >
      {/* Landing-page overlays */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.00) 50%)" }} />
      <div style={{ position: "absolute", top: -100, right: -80, width: 360, height: 360, transform: "rotate(12deg)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }} />
      <div style={{ position: "absolute", bottom: -80, left: -60, width: 280, height: 280, transform: "rotate(-8deg)", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }} />

      {/* Header */}
      <div
        style={{
          opacity: interpolate(headerSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(headerSpring, [0, 1], [14, 0])}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AuroraLogo size={20} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Aurora</span>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>Results</span>
        </div>
        <h2 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", textAlign: "center" }}>
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
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          padding: "20px 28px 16px",
          opacity: chartOp,
          transform: `translateY(${chartY}px)`,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Organic Sessions</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Sep 2025 – Feb 2026</span>
        </div>

        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          {Y_LABELS.map((v) => {
            const y = ptY(v);
            return (
              <g key={v}>
                <line x1={PAD.left} y1={y} x2={SVG_W - PAD.right} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="rgba(255,255,255,0.3)" fontFamily={F}>
                  {v >= 1000 ? `${v / 1000}K` : v}
                </text>
              </g>
            );
          })}

          {DATA.map((d, i) => (
            <text key={d.month} x={ptX(i)} y={SVG_H - 10} textAnchor="middle" fontSize={11} fontWeight={500} fill="rgba(255,255,255,0.4)" fontFamily={F}>
              {d.month}
            </text>
          ))}

          <path d={areaPath} fill={COLORS.primary} opacity={areaOpacity} />

          <path d={linePath} fill="none" stroke={COLORS.primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={lineLength} strokeDashoffset={dashOffset} />
          <path d={linePath} fill="none" stroke={COLORS.primary} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={lineLength} strokeDashoffset={dashOffset} opacity={0.2} />

          {points.map((p, i) => {
            const pointProgress = interpolate(drawProgress, [i / (DATA.length - 1) - 0.02, i / (DATA.length - 1) + 0.06], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            if (pointProgress <= 0) return null;
            const scale = interpolate(pointProgress, [0, 1], [0.3, 1]);
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={10} fill={COLORS.primary} opacity={0.12 * pointProgress} />
                <circle cx={p.x} cy={p.y} r={5 * scale} fill={COLORS.primary} stroke="#FFFFFF" strokeWidth={2} opacity={pointProgress} />
                {i === DATA.length - 1 && pointProgress > 0.5 && (
                  <text x={p.x} y={p.y - 16} textAnchor="middle" fontSize={14} fontWeight={700} fill="#FFFFFF" fontFamily={F} opacity={interpolate(pointProgress, [0.5, 1], [0, 1])}>
                    18.6K
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Trust line */}
      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.02em", zIndex: 10 }}>
        Average across 1,200+ Aurora-powered blogs · Sep 2025 – Feb 2026
      </p>
    </AbsoluteFill>
  );
};
