import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WIDTH, HEIGHT } from "../constants";

/* ────────────────────────────────────────────
 * Published Blog Scene — 8s (240 frames @ 30fps)
 *
 * Shows a REAL independent blog website (not Aurora themed).
 * Brand: "Vink" — a green/neutral e-commerce sustainability blog.
 *
 *   0–10     Scene appears (no fade, hard cut from dashboard)
 *   10–60    Camera settles on blog index with 4 existing posts
 *   60–120   New post slides in at the top with a subtle glow
 *   120–160  "Just published" badge animates in
 *   160–240  Hold — the blog looks complete with 5 posts
 * ──────────────────────────────────────────── */

const F = "'Georgia', 'Times New Roman', serif";
const SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

const BRAND = {
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  accent: "#2D6A4F",
  accentLight: "#D8F3DC",
  text: "#1B1B18",
  textMuted: "#6B705C",
  border: "#E8E8E3",
  headerBg: "#FFFFFF",
  footerBg: "#1B1B18",
};

/* ── Existing blog posts (before our new one) ── */
const EXISTING_POSTS = [
  {
    title: "Why Biodegradable Mailers Are the Future of D2C Shipping",
    date: "Jan 28, 2026",
    excerpt: "Consumer expectations around packaging sustainability have shifted dramatically. Here's why biodegradable mailers are becoming the default for direct-to-consumer brands.",
    tag: "Shipping",
    image: "#B7E4C7",
  },
  {
    title: "5 Ways to Reduce Packaging Waste Without Raising Costs",
    date: "Jan 15, 2026",
    excerpt: "Sustainability doesn't have to mean higher margins. We break down five proven strategies that cut waste and keep your bottom line intact.",
    tag: "Strategy",
    image: "#A7C4BC",
  },
  {
    title: "How We Helped 200+ Stores Switch to Recyclable Packaging",
    date: "Jan 3, 2026",
    excerpt: "A look at our partnership program and the real-world results from helping e-commerce stores transition to fully recyclable packaging solutions.",
    tag: "Case Study",
    image: "#95B8A3",
  },
  {
    title: "The Complete Guide to Sustainable Packaging Certifications",
    date: "Dec 18, 2025",
    excerpt: "FSC, PEFC, Cradle to Cradle — understanding which certifications matter for your brand and your customers.",
    tag: "Guide",
    image: "#84A98C",
  },
];

const NEW_POST = {
  title: "The Future of Small Businesses: Embracing AI Tools for Growth",
  date: "Feb 7, 2026",
  excerpt: "Small businesses are navigating rapid digital change. AI tools now make it possible to automate repetitive work, uncover customer insights, and make faster decisions without enterprise-sized teams.",
  tag: "AI & Growth",
  image: "#52796F",
};

/* ── Header ── */
const BlogHeader: React.FC = () => (
  <div style={{
    height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 48px", borderBottom: `1px solid ${BRAND.border}`, background: BRAND.headerBg,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 6, background: BRAND.accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 700, color: "#FFFFFF", fontFamily: SANS,
      }}>V</div>
      <span style={{ fontSize: 18, fontWeight: 700, color: BRAND.text, fontFamily: SANS, letterSpacing: "-0.02em" }}>
        Vink
      </span>
      <span style={{ fontSize: 12, color: BRAND.textMuted, fontFamily: SANS, marginLeft: 4 }}>
        Sustainable Packaging
      </span>
    </div>
    <div style={{ display: "flex", gap: 28, fontSize: 14, fontFamily: SANS, color: BRAND.textMuted }}>
      <span>Solutions</span>
      <span>About</span>
      <span style={{ color: BRAND.accent, fontWeight: 600 }}>Blog</span>
      <span>Contact</span>
    </div>
  </div>
);

/* ── Blog post card ── */
const PostCard: React.FC<{
  post: typeof NEW_POST;
  isNew?: boolean;
  newProgress?: number;
}> = ({ post, isNew, newProgress = 1 }) => (
  <div style={{
    display: "flex", gap: 24, padding: "28px 0",
    borderBottom: `1px solid ${BRAND.border}`,
    opacity: isNew ? newProgress : 1,
    transform: isNew ? `translateY(${interpolate(newProgress, [0, 1], [20, 0])}px)` : "none",
  }}>
    {/* Image placeholder */}
    <div style={{
      width: 240, height: 160, borderRadius: 8, flexShrink: 0,
      background: `linear-gradient(135deg, ${post.image} 0%, ${post.image}CC 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.15,
        backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0.3) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.3) 75%)",
        backgroundSize: "20px 20px",
      }} />
      {isNew && newProgress > 0.5 && (
        <div style={{
          position: "absolute", top: 10, left: 10,
          padding: "4px 10px", borderRadius: 4,
          background: BRAND.accent, color: "#FFFFFF",
          fontSize: 10, fontWeight: 700, fontFamily: SANS,
          letterSpacing: "0.05em", textTransform: "uppercase",
        }}>
          Just Published
        </div>
      )}
    </div>

    {/* Content */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          padding: "3px 10px", borderRadius: 4,
          background: BRAND.accentLight, color: BRAND.accent,
          fontSize: 11, fontWeight: 600, fontFamily: SANS,
        }}>
          {post.tag}
        </span>
        <span style={{ fontSize: 12, color: BRAND.textMuted, fontFamily: SANS }}>{post.date}</span>
      </div>
      <h3 style={{
        margin: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.3,
        color: BRAND.text, fontFamily: F,
      }}>
        {post.title}
      </h3>
      <p style={{
        margin: 0, fontSize: 14, lineHeight: 1.6,
        color: BRAND.textMuted, fontFamily: SANS,
      }}>
        {post.excerpt}
      </p>
      <span style={{
        fontSize: 13, fontWeight: 600, color: BRAND.accent, fontFamily: SANS,
        marginTop: "auto",
      }}>
        Read more →
      </span>
    </div>
  </div>
);

/* ── Notification toast ── */
const PublishToast: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0) return null;
  const y = interpolate(progress, [0, 1], [40, 0]);
  return (
    <div style={{
      position: "absolute", top: 80, right: 48,
      padding: "12px 20px", borderRadius: 8,
      background: BRAND.accent, color: "#FFFFFF",
      fontFamily: SANS, fontSize: 13, fontWeight: 600,
      boxShadow: "0 8px 24px rgba(45,106,79,0.3)",
      display: "flex", alignItems: "center", gap: 8,
      opacity: interpolate(progress, [0, 1], [0, 1]),
      transform: `translateY(${y}px)`,
      zIndex: 50,
    }}>
      <span style={{ fontSize: 16 }}>✓</span>
      New post published successfully
    </div>
  );
};

/* ══════════════════════════════════════════════ */
export const PublishedBlogScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* New post entrance */
  const newPostProgress = spring({
    fps,
    frame: Math.max(0, frame - 60),
    config: { damping: 22, stiffness: 100 },
    durationInFrames: 40,
  });

  /* Toast */
  const toastProgress = spring({
    fps,
    frame: Math.max(0, frame - 80),
    config: { damping: 20, stiffness: 120 },
    durationInFrames: 30,
  });

  /* Subtle glow behind new post */
  const glowOpacity = interpolate(frame, [60, 90, 160, 200], [0, 0.15, 0.15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BRAND.bg, fontFamily: SANS }}>
      <BlogHeader />

      {/* Blog hero */}
      <div style={{
        padding: "40px 48px 0",
        maxWidth: 900, margin: "0 auto", width: "100%",
      }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.1em", color: BRAND.accent, fontFamily: SANS,
          }}>
            Blog
          </span>
        </div>
        <h1 style={{
          margin: "0 0 8px", fontSize: 36, fontWeight: 700, lineHeight: 1.2,
          color: BRAND.text, fontFamily: F,
        }}>
          Insights & Resources
        </h1>
        <p style={{
          margin: "0 0 32px", fontSize: 15, color: BRAND.textMuted, fontFamily: SANS, lineHeight: 1.6,
        }}>
          Practical guides on sustainable packaging, e-commerce logistics, and growing responsibly.
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: BRAND.border, marginBottom: 0 }} />

        {/* Posts list */}
        <div style={{ position: "relative" }}>
          {/* Glow effect behind new post */}
          {glowOpacity > 0 && (
            <div style={{
              position: "absolute", top: 0, left: -20, right: -20, height: 220,
              background: `radial-gradient(ellipse at center, ${BRAND.accentLight} 0%, transparent 70%)`,
              opacity: glowOpacity, pointerEvents: "none", zIndex: 0,
            }} />
          )}

          {/* New post (appears at top) */}
          {frame >= 55 && (
            <div style={{ position: "relative", zIndex: 1 }}>
              <PostCard post={NEW_POST} isNew newProgress={newPostProgress} />
            </div>
          )}

          {/* Existing posts — push down when new post arrives */}
          {EXISTING_POSTS.map((post, i) => (
            <PostCard key={i} post={post} />
          ))}
        </div>
      </div>

      <PublishToast progress={toastProgress} />
    </AbsoluteFill>
  );
};
