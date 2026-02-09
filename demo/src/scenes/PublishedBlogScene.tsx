import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WIDTH } from "../constants";

/* ────────────────────────────────────────────
 * Published Blog Scene — 8s (240 frames @ 30fps)
 *
 * Shows the customer's REAL website (not Aurora).
 * Brand: "Leafline" — sustainable packaging for e-commerce.
 * Uses Unsplash stock photos for realism.
 *
 *   0–30     Scene slides in from right (wipe transition)
 *   30–70    Blog index settles with 4 existing posts
 *   70–130   New post slides in at the top with glow
 *   130–160  Toast notification
 *   160–240  Hold
 * ──────────────────────────────────────────── */

const SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";
const SERIF = "'Georgia', 'Times New Roman', serif";

const BRAND = {
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  accent: "#1B6B4A",
  accentLight: "#E8F5EE",
  accentDark: "#145237",
  text: "#1A1D1C",
  textMuted: "#5F6B64",
  border: "#E5E8E6",
  headerBg: "#FFFFFF",
  navHover: "#F0F4F1",
};

/* ── Local stock photos (downloaded from Unsplash) ── */
const PHOTOS = {
  post1: staticFile("images/blog/post1.jpg"),
  post2: staticFile("images/blog/post2.jpg"),
  post3: staticFile("images/blog/post3.jpg"),
  post4: staticFile("images/blog/post4.jpg"),
  newPost: staticFile("images/blog/new-post.jpg"),
};

/* ── Blog posts ── */
const EXISTING_POSTS = [
  {
    title: "Why Biodegradable Mailers Are the Future of D2C Shipping",
    date: "Jan 28, 2026",
    excerpt: "Consumer expectations around packaging sustainability have shifted dramatically. Here's why biodegradable mailers are becoming the default.",
    tag: "Shipping",
    photo: PHOTOS.post1,
    readTime: "6 min read",
  },
  {
    title: "5 Ways to Reduce Packaging Waste Without Raising Costs",
    date: "Jan 15, 2026",
    excerpt: "Sustainability doesn't have to mean higher margins. Five proven strategies that cut waste and keep your bottom line intact.",
    tag: "Strategy",
    photo: PHOTOS.post2,
    readTime: "8 min read",
  },
  {
    title: "How We Helped 200+ Stores Switch to Recyclable Packaging",
    date: "Jan 3, 2026",
    excerpt: "A look at our partnership program and real-world results from helping e-commerce stores transition.",
    tag: "Case Study",
    photo: PHOTOS.post3,
    readTime: "5 min read",
  },
  {
    title: "The Complete Guide to Sustainable Packaging Certifications",
    date: "Dec 18, 2025",
    excerpt: "FSC, PEFC, Cradle to Cradle — understanding which certifications matter for your brand.",
    tag: "Guide",
    photo: PHOTOS.post4,
    readTime: "10 min read",
  },
];

const NEW_POST = {
  title: "The Future of Small Businesses: Embracing AI Tools for Growth",
  date: "Feb 7, 2026",
  excerpt: "Small businesses are navigating rapid digital change. AI tools now make it possible to automate repetitive work and uncover customer insights.",
  tag: "AI & Growth",
  photo: PHOTOS.newPost,
  readTime: "7 min read",
};

/* ── Leafline Logo SVG ── */
const LeaflineLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Leaf shape */}
    <path
      d="M8 28C8 28 6 18 10 12C14 6 22 4 28 4C28 4 26 14 22 20C18 26 8 28 8 28Z"
      fill={BRAND.accent}
      stroke={BRAND.accentDark}
      strokeWidth={0.5}
    />
    {/* Leaf vein */}
    <path
      d="M28 4C22 10 15 16 8 28"
      stroke={BRAND.accentLight}
      strokeWidth={1.5}
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M18 12C16 15 13 18 10 22"
      stroke={BRAND.accentLight}
      strokeWidth={0.8}
      strokeLinecap="round"
      fill="none"
      opacity={0.7}
    />
  </svg>
);

/* ── Header ── */
const SiteHeader: React.FC = () => (
  <div style={{
    height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 64px", borderBottom: `1px solid ${BRAND.border}`,
    background: BRAND.headerBg,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <LeaflineLogo size={30} />
      <span style={{
        fontSize: 20, fontWeight: 700, color: BRAND.text,
        fontFamily: SANS, letterSpacing: "-0.03em",
      }}>
        Leafline
      </span>
    </div>
    <nav style={{ display: "flex", gap: 32, fontSize: 14, fontFamily: SANS }}>
      <span style={{ color: BRAND.textMuted, fontWeight: 500 }}>Solutions</span>
      <span style={{ color: BRAND.textMuted, fontWeight: 500 }}>Pricing</span>
      <span style={{ color: BRAND.accent, fontWeight: 600 }}>Blog</span>
      <span style={{ color: BRAND.textMuted, fontWeight: 500 }}>About</span>
      <span style={{ color: BRAND.textMuted, fontWeight: 500 }}>Contact</span>
    </nav>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 13, color: BRAND.textMuted, fontFamily: SANS }}>Log in</span>
      <div style={{
        padding: "8px 18px", borderRadius: 6,
        background: BRAND.accent, color: "#FFFFFF",
        fontSize: 13, fontWeight: 600, fontFamily: SANS,
      }}>
        Get Started
      </div>
    </div>
  </div>
);

/* ── Blog post card ── */
const PostCard: React.FC<{
  post: typeof NEW_POST;
  isNew?: boolean;
  newProgress?: number;
  featured?: boolean;
}> = ({ post, isNew, newProgress = 1, featured }) => (
  <div style={{
    display: "flex", flexDirection: featured ? "column" : "row", gap: featured ? 16 : 20,
    padding: featured ? 0 : "24px 0",
    borderBottom: featured ? "none" : `1px solid ${BRAND.border}`,
    opacity: isNew ? newProgress : 1,
    transform: isNew ? `translateY(${interpolate(newProgress, [0, 1], [30, 0])}px)` : "none",
    position: "relative",
  }}>
    {/* Photo */}
    <div style={{
      width: featured ? "100%" : 220, height: featured ? 200 : 140,
      borderRadius: 8, flexShrink: 0, overflow: "hidden",
      position: "relative",
    }}>
      <Img src={post.photo} style={{
        width: "100%", height: "100%", objectFit: "cover",
      }} />
      {isNew && newProgress > 0.6 && (
        <div style={{
          position: "absolute", top: 12, left: 12,
          padding: "5px 12px", borderRadius: 5,
          background: BRAND.accent, color: "#FFFFFF",
          fontSize: 10, fontWeight: 700, fontFamily: SANS,
          letterSpacing: "0.06em", textTransform: "uppercase",
          boxShadow: "0 2px 8px rgba(27,107,74,0.3)",
        }}>
          ✦ Just Published
        </div>
      )}
    </div>

    {/* Content */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          padding: "2px 8px", borderRadius: 4,
          background: BRAND.accentLight, color: BRAND.accent,
          fontSize: 11, fontWeight: 600, fontFamily: SANS,
        }}>
          {post.tag}
        </span>
        <span style={{ fontSize: 12, color: BRAND.textMuted, fontFamily: SANS }}>{post.date}</span>
        <span style={{ fontSize: 11, color: BRAND.textMuted, fontFamily: SANS, opacity: 0.7 }}>·</span>
        <span style={{ fontSize: 11, color: BRAND.textMuted, fontFamily: SANS, opacity: 0.7 }}>{post.readTime}</span>
      </div>
      <h3 style={{
        margin: 0, fontSize: featured ? 22 : 17, fontWeight: 700, lineHeight: 1.3,
        color: BRAND.text, fontFamily: SERIF,
      }}>
        {post.title}
      </h3>
      <p style={{
        margin: 0, fontSize: 13, lineHeight: 1.55,
        color: BRAND.textMuted, fontFamily: SANS,
        overflow: "hidden", display: "-webkit-box",
      }}>
        {post.excerpt}
      </p>
      {!featured && (
        <span style={{
          fontSize: 13, fontWeight: 600, color: BRAND.accent, fontFamily: SANS,
          marginTop: "auto",
        }}>
          Read article →
        </span>
      )}
    </div>
  </div>
);

/* ── Toast notification ── */
const PublishToast: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0) return null;
  return (
    <div style={{
      position: "absolute", top: 84, right: 64,
      padding: "14px 22px", borderRadius: 10,
      background: BRAND.accent, color: "#FFFFFF",
      fontFamily: SANS, fontSize: 13, fontWeight: 600,
      boxShadow: "0 12px 32px rgba(27,107,74,0.35)",
      display: "flex", alignItems: "center", gap: 10,
      opacity: interpolate(progress, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
      zIndex: 50,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: "rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12,
      }}>✓</div>
      New article published to blog
    </div>
  );
};

/* ── Sidebar ── */
const BlogSidebar: React.FC = () => (
  <div style={{ width: 240, flexShrink: 0 }}>
    {/* Search */}
    <div style={{
      height: 38, borderRadius: 6, border: `1px solid ${BRAND.border}`,
      background: BRAND.surface, padding: "0 12px",
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 13, color: BRAND.textMuted, fontFamily: SANS,
      marginBottom: 24,
    }}>
      🔍 Search articles...
    </div>

    {/* Categories */}
    <p style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.08em", color: BRAND.textMuted, fontFamily: SANS,
      margin: "0 0 12px",
    }}>Categories</p>
    {["All Posts", "Shipping", "Strategy", "Case Studies", "Guides", "AI & Growth"].map((cat, i) => (
      <div key={cat} style={{
        padding: "8px 12px", borderRadius: 6, marginBottom: 2,
        fontSize: 13, fontFamily: SANS,
        color: i === 0 ? BRAND.accent : BRAND.textMuted,
        fontWeight: i === 0 ? 600 : 400,
        background: i === 0 ? BRAND.accentLight : "transparent",
      }}>
        {cat}
      </div>
    ))}

    {/* Newsletter */}
    <div style={{
      marginTop: 24, padding: 16, borderRadius: 8,
      background: BRAND.accentLight, border: `1px solid ${BRAND.border}`,
    }}>
      <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: BRAND.text, fontFamily: SANS }}>
        Stay updated
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: BRAND.textMuted, fontFamily: SANS, lineHeight: 1.5 }}>
        Get our latest sustainability insights delivered weekly.
      </p>
      <div style={{
        height: 34, borderRadius: 6, border: `1px solid ${BRAND.border}`,
        background: BRAND.surface, padding: "0 10px",
        display: "flex", alignItems: "center",
        fontSize: 12, color: BRAND.textMuted, fontFamily: SANS,
        marginBottom: 8,
      }}>
        your@email.com
      </div>
      <div style={{
        height: 34, borderRadius: 6,
        background: BRAND.accent, color: "#FFFFFF",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 600, fontFamily: SANS,
      }}>
        Subscribe
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════ */
export const PublishedBlogScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* New post entrance */
  const newPostProgress = spring({
    fps,
    frame: Math.max(0, frame - 70),
    config: { damping: 22, stiffness: 90 },
    durationInFrames: 45,
  });

  /* Toast */
  const toastProgress = spring({
    fps,
    frame: Math.max(0, frame - 90),
    config: { damping: 20, stiffness: 110 },
    durationInFrames: 30,
  });

  /* Glow behind new post */
  const glowOpacity = interpolate(frame, [70, 100, 170, 210], [0, 0.12, 0.12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: BRAND.bg, fontFamily: SANS }}>
      <SiteHeader />

      <div style={{
        display: "flex", gap: 40,
        maxWidth: 1080, margin: "0 auto", width: "100%",
        padding: "32px 48px 0",
      }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <LeaflineLogo size={18} />
              <span style={{
                fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.1em", color: BRAND.accent, fontFamily: SANS,
              }}>
                Leafline Blog
              </span>
            </div>
            <h1 style={{
              margin: "0 0 6px", fontSize: 30, fontWeight: 700, lineHeight: 1.2,
              color: BRAND.text, fontFamily: SERIF,
            }}>
              Insights & Resources
            </h1>
            <p style={{
              margin: 0, fontSize: 14, color: BRAND.textMuted, fontFamily: SANS,
            }}>
              Practical guides on sustainable packaging, logistics, and growing responsibly.
            </p>
          </div>

          <div style={{ height: 1, background: BRAND.border, marginBottom: 0 }} />

          {/* Posts */}
          <div style={{ position: "relative" }}>
            {/* Glow */}
            {glowOpacity > 0 && (
              <div style={{
                position: "absolute", top: -10, left: -24, right: -24, height: 200,
                background: `radial-gradient(ellipse at center top, ${BRAND.accentLight} 0%, transparent 70%)`,
                opacity: glowOpacity, pointerEvents: "none", zIndex: 0,
              }} />
            )}

            {/* New post */}
            {frame >= 65 && (
              <div style={{ position: "relative", zIndex: 1 }}>
                <PostCard post={NEW_POST} isNew newProgress={newPostProgress} />
              </div>
            )}

            {/* Existing posts */}
            {EXISTING_POSTS.map((post, i) => (
              <PostCard key={i} post={post} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <BlogSidebar />
      </div>

      <PublishToast progress={toastProgress} />
    </AbsoluteFill>
  );
};
