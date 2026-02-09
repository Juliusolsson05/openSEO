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
 * Traffic Growth Scene — 6s (180 frames @ 30fps)
 *
 * Animated visitor graph showing Aurora's impact on organic traffic.
 * Clean dark style matching Aurora brand.
 *
 *   0–15     Fade in
 *   10–30    Header reveals
 *   20–140   Line chart draws left → right
 *   80–120   KPI cards appear
 *   140–180  Hold
 * ──────────────────────────────────────────── */

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

/* ── Traffic data (8 months) ── */
const DATA = [
  { month: "Jul",  value: 820 },
  { month: "Aug",  value: 1100 },
  { month: "Sep",  value: 1900 },
  { month: "Oct",  value: 3400 },
  { month: "Nov",  value: 5100 },
  { month: "Dec",  value: 7800 },
  { month: "Jan",  value: 11200 },
  { month: "Feb",  value: 16400 },
];

/* ── KPI stats ── */
const KPIS = [
  { label: "Organic Traffic", value: "+1,900%", sub: "in 8 months" },
  { label: "Posts Published", value: "47", sub: "AI-generated" },
  { label: "Avg. Position", value: "#4.2", sub: "on Google" },
  { label: "Time Saved", value: "120h", sub: "per month" },
];

/* ── Chart geometry ── */
const SVG_W = 840;
const SVG_H = 300;
const PAD = { top: 28, right: 28, bottom: 48, left: 56 };
const PLOT_W = SVG_W - PAD.left - PAD.right;
const PLOT_H = SVG_H - PAD.top - PAD.bottom;
const MAX_VAL = 18000;

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

const Y_LABELS = [0, 4500, 9000, 13500, 18000];

/* ── Grid overlay ── */
const GridOverlay: React.FC = () => (
  <div style={{
    position: "absolute", inset: 0, opacity: 0.05,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
    backgroundSize: "32px 32px",
  }} />
);

/* ══════════════════════════════════════════════ */
export const TrafficGrowthScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 22, stiffness: 130 },
    durationInFrames: 18,
  });

  const drawProgress = interpolate(frame, [20, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const dashOffset = lineLength * (1 - drawProgress);
  const areaOpacity = interpolate(frame, [40, 140], [0, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chartSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 20, stiffness: 120 },
    durationInFrames: 20,
  });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0A1628 0%, #162544 100%)",
      fontFamily: F,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      opacity: fadeIn,
    }}>
      <GridOverlay />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 30% 20%, rgba(0,120,212,0.08) 0%, transparent 50%)",
      }} />

      {/* Header */}
      <div style={{
        opacity: interpolate(headerSpring, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(headerSpring, [0, 1], [14, 0])}px)`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        zIndex: 10,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 600, textTransform: "uppercase",
          letterSpacing: "0.12em", color: COLORS.primary,
        }}>
          Results After 8 Months
        </span>
        <h2 style={{
          margin: 0, fontSize: 38, fontWeight: 700, color: "#FFFFFF",
          letterSpacing: "-0.02em", textAlign: "center",
        }}>
          Content That Actually Ranks
        </h2>
        <p style={{
          margin: 0, fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center",
        }}>
          Organic traffic growth for Leafline Commerce after switching to Aurora
        </p>
      </div>

      {/* KPI row */}
      <div style={{
        display: "flex", gap: 16, zIndex: 10,
        opacity: interpolate(chartSpring, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(chartSpring, [0, 1], [10, 0])}px)`,
      }}>
        {KPIS.map((kpi, i) => {
          const kpiSpring = spring({
            fps,
            frame: Math.max(0, frame - 80 - i * 8),
            config: { damping: 20, stiffness: 140 },
            durationInFrames: 20,
          });
          return (
            <div key={i} style={{
              width: 180, padding: "16px 20px", borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              opacity: interpolate(kpiSpring, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(kpiSpring, [0, 1], [12, 0])}px)`,
            }}>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                {kpi.label}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 700, color: "#FFFFFF" }}>
                {kpi.value}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                {kpi.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart card */}
      <div style={{
        width: 900, borderRadius: 12,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "20px 28px 16px",
        opacity: interpolate(chartSpring, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(chartSpring, [0, 1], [16, 0])}px)`,
        zIndex: 10,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 10,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
            Organic Sessions
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            Jul 2025 – Feb 2026
          </span>
        </div>

        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          {Y_LABELS.map((v) => {
            const y = ptY(v);
            return (
              <g key={v}>
                <line x1={PAD.left} y1={y} x2={SVG_W - PAD.right} y2={y}
                  stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <text x={PAD.left - 10} y={y + 4} textAnchor="end"
                  fontSize={10} fill="rgba(255,255,255,0.25)" fontFamily={F}>
                  {v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}
                </text>
              </g>
            );
          })}

          {DATA.map((d, i) => (
            <text key={d.month} x={ptX(i)} y={SVG_H - 12} textAnchor="middle"
              fontSize={11} fontWeight={500} fill="rgba(255,255,255,0.35)" fontFamily={F}>
              {d.month}
            </text>
          ))}

          <path d={areaPath} fill="url(#areaGrad)" opacity={areaOpacity} />

          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.6} />
              <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>

          <path d={linePath} fill="none" stroke={COLORS.primary} strokeWidth={3}
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={lineLength} strokeDashoffset={dashOffset} />
          <path d={linePath} fill="none" stroke={COLORS.primary} strokeWidth={10}
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={lineLength} strokeDashoffset={dashOffset} opacity={0.15} />

          {points.map((p, i) => {
            const pp = interpolate(drawProgress,
              [i / (DATA.length - 1) - 0.02, i / (DATA.length - 1) + 0.06],
              [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            if (pp <= 0) return null;
            const s = interpolate(pp, [0, 1], [0.3, 1]);
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={10} fill={COLORS.primary} opacity={0.1 * pp} />
                <circle cx={p.x} cy={p.y} r={5 * s} fill={COLORS.primary}
                  stroke="#FFFFFF" strokeWidth={2} opacity={pp} />
                {i === DATA.length - 1 && pp > 0.5 && (
                  <text x={p.x} y={p.y - 16} textAnchor="middle"
                    fontSize={15} fontWeight={700} fill="#FFFFFF" fontFamily={F}
                    opacity={interpolate(pp, [0.5, 1], [0, 1])}>
                    16.4K
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
