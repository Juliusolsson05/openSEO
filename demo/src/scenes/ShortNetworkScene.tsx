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
 * Network Graph Scene — 5s (150 frames @ 30fps)
 *
 * A single hub node expands into a content network.
 * Edges draw between nodes, then a caption fades in.
 *
 *   0-10     Scene fade-in
 *   6-16     Hub node appears
 *   16-60    Satellite nodes spring outward (staggered)
 *   20-70    Edges draw in
 *   70-100   Caption + sub-caption
 *   100-150  Hold
 * ──────────────────────────────────────────── */

const F =
  "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

/* ── Node definitions ── */
interface NodeDef {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  color: string;
  delay: number; // frame offset for stagger
}

const HUB: NodeDef = {
  id: "hub",
  label: "Aurora",
  x: 0,
  y: 0,
  r: 38,
  color: COLORS.primary,
  delay: 0,
};

const SATELLITES: NodeDef[] = [
  { id: "blog", label: "Blog Posts", x: -220, y: -155, r: 26, color: "#3A9AE8", delay: 0 },
  { id: "social", label: "Social Media", x: 195, y: -170, r: 24, color: "#22C55E", delay: 3 },
  { id: "email", label: "Email Campaigns", x: 280, y: 50, r: 23, color: "#A855F7", delay: 6 },
  { id: "landing", label: "Landing Pages", x: -260, y: 100, r: 23, color: "#F59E0B", delay: 9 },
  { id: "product", label: "Product Copy", x: 80, y: 220, r: 21, color: "#EF4444", delay: 12 },
  { id: "seo", label: "SEO Content", x: -100, y: -240, r: 21, color: "#06B6D4", delay: 15 },
  { id: "ads", label: "Ad Copy", x: -160, y: 230, r: 20, color: "#EC4899", delay: 18 },
  { id: "case", label: "Case Studies", x: 300, y: -70, r: 20, color: "#8B5CF6", delay: 21 },
  { id: "news", label: "Newsletters", x: -340, y: -30, r: 19, color: "#14B8A6", delay: 24 },
  { id: "pr", label: "Press Releases", x: 160, y: 180, r: 19, color: "#F97316", delay: 27 },
];

const ALL_NODES = [HUB, ...SATELLITES];

/* ── Edges (hub → satellite + a few cross-links) ── */
interface EdgeDef {
  from: string;
  to: string;
  delay: number;
}

const EDGES: EdgeDef[] = [
  // Hub connections
  ...SATELLITES.map((s) => ({ from: "hub", to: s.id, delay: s.delay + 5 })),
  // Cross-connections (content flows between types)
  { from: "blog", to: "seo", delay: 35 },
  { from: "blog", to: "social", delay: 38 },
  { from: "social", to: "ads", delay: 41 },
  { from: "email", to: "landing", delay: 44 },
  { from: "case", to: "blog", delay: 47 },
  { from: "product", to: "landing", delay: 50 },
];

function getNode(id: string): NodeDef {
  return ALL_NODES.find((n) => n.id === id)!;
}

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

/* ── Animated edge ── */
const Edge: React.FC<{
  from: NodeDef;
  to: NodeDef;
  frame: number;
  delay: number;
  fps: number;
}> = ({ from, to, frame, delay, fps }) => {
  const progress = interpolate(frame, [20 + delay, 20 + delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  if (progress <= 0) return null;

  // Interpolate from-node position (it springs out too)
  const fromSpring = spring({
    frame: Math.max(0, frame - (16 + from.delay)),
    fps,
    config: { damping: 14, stiffness: 120 },
    durationInFrames: 18,
  });
  const toSpring = spring({
    frame: Math.max(0, frame - (16 + to.delay)),
    fps,
    config: { damping: 14, stiffness: 120 },
    durationInFrames: 18,
  });

  const fx = from.id === "hub" ? from.x : from.x * fromSpring;
  const fy = from.id === "hub" ? from.y : from.y * fromSpring;
  const tx = to.id === "hub" ? to.x : to.x * toSpring;
  const ty = to.id === "hub" ? to.y : to.y * toSpring;

  // Draw the line progressively
  const cx = fx + (tx - fx) * progress;
  const cy = fy + (ty - fy) * progress;

  return (
    <g>
      <line
        x1={fx}
        y1={fy}
        x2={cx}
        y2={cy}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1.5}
      />
      {/* Glow line */}
      <line
        x1={fx}
        y1={fy}
        x2={cx}
        y2={cy}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={6}
      />
      {/* Traveling dot along the edge */}
      {progress > 0.3 && progress < 0.95 && (
        <circle
          cx={fx + (tx - fx) * ((progress - 0.3) / 0.65)}
          cy={fy + (ty - fy) * ((progress - 0.3) / 0.65)}
          r={3}
          fill="#FFFFFF"
          opacity={0.6}
        />
      )}
    </g>
  );
};

/* ── Animated node ── */
const GraphNode: React.FC<{
  node: NodeDef;
  frame: number;
  fps: number;
  isHub?: boolean;
}> = ({ node, frame, fps, isHub }) => {
  const appear = spring({
    frame: Math.max(0, frame - (isHub ? 6 : 16 + node.delay)),
    fps,
    config: isHub
      ? { damping: 12, stiffness: 160 }
      : { damping: 14, stiffness: 120 },
    durationInFrames: isHub ? 14 : 18,
  });

  if (appear <= 0.01) return null;

  const posX = isHub ? 0 : node.x * appear;
  const posY = isHub ? 0 : node.y * appear;
  const scale = interpolate(appear, [0, 1], [0.2, 1]);

  // Subtle pulse for the hub
  const pulse = isHub
    ? interpolate(Math.sin(frame * 0.06), [-1, 1], [0.92, 1.08])
    : 1;

  return (
    <g
      transform={`translate(${posX}, ${posY}) scale(${scale * pulse})`}
      style={{ opacity: appear }}
    >
      {/* Outer glow */}
      <circle
        cx={0}
        cy={0}
        r={node.r + (isHub ? 16 : 10)}
        fill={node.color}
        opacity={0.08}
      />
      <circle
        cx={0}
        cy={0}
        r={node.r + (isHub ? 8 : 5)}
        fill={node.color}
        opacity={0.15}
      />
      {/* Main circle */}
      <circle
        cx={0}
        cy={0}
        r={node.r}
        fill={node.color}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={isHub ? 2 : 1.5}
      />
      {/* Icon / letter */}
      {isHub ? (
        <g transform="translate(-10, -12) scale(0.65)">
          <path
            d="M16 2L3 28h5.5l2.5-5h10l2.5 5H29L16 2Zm0 9l4 8h-8l4-8Z"
            fill="#FFFFFF"
            fillRule="evenodd"
          />
        </g>
      ) : (
        <text
          x={0}
          y={1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={node.r * 0.7}
          fontWeight={700}
          fill="#FFFFFF"
          fontFamily={F}
        >
          {node.label.charAt(0)}
        </text>
      )}
      {/* Label below */}
      <text
        x={0}
        y={node.r + (isHub ? 22 : 18)}
        textAnchor="middle"
        fontSize={isHub ? 15 : 12}
        fontWeight={isHub ? 700 : 600}
        fill="rgba(255,255,255,0.75)"
        fontFamily={F}
      >
        {node.label}
      </text>
    </g>
  );
};

/* ══════════════════════════════════════════════ */

export const ShortNetworkScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* Scene fade-in */
  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* Caption entrance */
  const captionSpring = spring({
    frame: Math.max(0, frame - 70),
    fps,
    config: { damping: 18, stiffness: 130 },
    durationInFrames: 18,
  });
  const captionY = interpolate(captionSpring, [0, 1], [20, 0]);
  const captionOp = interpolate(captionSpring, [0, 1], [0, 1]);

  /* Sub-caption */
  const subSpring = spring({
    frame: Math.max(0, frame - 82),
    fps,
    config: { damping: 18, stiffness: 130 },
    durationInFrames: 18,
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #002050 0%, #0078D4 100%)",
        fontFamily: F,
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
          top: -120,
          right: -80,
          width: 380,
          height: 380,
          transform: "rotate(12deg)",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -90,
          left: -70,
          width: 300,
          height: 300,
          transform: "rotate(-8deg)",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.015)",
        }}
      />

      {/* Graph */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width={800}
          height={600}
          viewBox="-400 -300 800 600"
          style={{ overflow: "visible", marginTop: -40 }}
        >
          {/* Edges first (behind nodes) */}
          {EDGES.map((e) => (
            <Edge
              key={`${e.from}-${e.to}`}
              from={getNode(e.from)}
              to={getNode(e.to)}
              frame={frame}
              delay={e.delay}
              fps={fps}
            />
          ))}

          {/* Hub node */}
          <GraphNode node={HUB} frame={frame} fps={fps} isHub />

          {/* Satellite nodes */}
          {SATELLITES.map((n) => (
            <GraphNode key={n.id} node={n} frame={frame} fps={fps} />
          ))}
        </svg>
      </div>

      {/* Caption */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 42,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
            opacity: captionOp,
            transform: `translateY(${captionY}px)`,
          }}
        >
          Built for Dynamic Content
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 17,
            color: "rgba(255,255,255,0.5)",
            opacity: interpolate(subSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(subSpring, [0, 1], [16, 0])}px)`,
          }}
        >
          One platform. Every content type. Automatically optimized for your audience.
        </p>
      </div>
    </AbsoluteFill>
  );
};
