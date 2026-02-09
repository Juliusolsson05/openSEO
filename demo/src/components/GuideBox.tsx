import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { DURATIONS, sec } from "../constants";

type GuideStep = {
  from: number;
  to: number;
  scene: string;
  title: string;
  body: string;
  index: number;
  total: number;
};

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

const introFrom = 0;
const loginFrom = introFrom + sec(DURATIONS.intro);
const titlesFrom = loginFrom + sec(DURATIONS.login);
const blogFrom = titlesFrom + sec(DURATIONS.titleGeneration);
const publishedBlogFrom = blogFrom + sec(DURATIONS.blogPost);
const trafficFrom = publishedBlogFrom + sec(DURATIONS.publishedBlog);
const outroFrom = trafficFrom + sec(DURATIONS.trafficGrowth);

const steps: GuideStep[] = [
  {
    from: introFrom,
    to: loginFrom,
    scene: "Overview",
    title: "Aurora by Nordtools",
    body: "AI-powered content workflows for modern teams.",
    index: 1,
    total: 1,
  },

  { from: loginFrom + 0, to: loginFrom + 160, scene: "Login", title: "Secure team access", body: "Sign in to your Aurora workspace.", index: 1, total: 3 },
  { from: loginFrom + 160, to: loginFrom + 330, scene: "Login", title: "Role-based dashboard", body: "Editors, marketers, and admins work in one place.", index: 2, total: 3 },
  { from: loginFrom + 330, to: titlesFrom, scene: "Login", title: "Ready in seconds", body: "Jump directly into content operations.", index: 3, total: 3 },

  { from: titlesFrom + 0, to: titlesFrom + 220, scene: "Title Generation", title: "Start with one idea", body: "Enter a business topic or keyword focus.", index: 1, total: 3 },
  { from: titlesFrom + 220, to: titlesFrom + 520, scene: "Title Generation", title: "Generate SEO title options", body: "Aurora creates multiple high-intent headline angles.", index: 2, total: 3 },
  { from: titlesFrom + 520, to: blogFrom, scene: "Title Generation", title: "Pick and proceed", body: "Choose a title and move straight to drafting.", index: 3, total: 3 },

  { from: blogFrom + 0, to: blogFrom + 170, scene: "Blog Editor", title: "Open post editor", body: "Review structure, metadata, and publish controls.", index: 1, total: 6 },
  { from: blogFrom + 170, to: blogFrom + 330, scene: "Blog Editor", title: "Enable Edit Mode", body: "Switch to inline editing for precise control.", index: 2, total: 6 },
  { from: blogFrom + 330, to: blogFrom + 520, scene: "Blog Editor", title: "Refine introduction", body: "Improve clarity and messaging in-context.", index: 3, total: 6 },
  { from: blogFrom + 520, to: blogFrom + 700, scene: "Blog Editor", title: "Add a new content block", body: "Insert elements exactly where they improve flow.", index: 4, total: 6 },
  { from: blogFrom + 700, to: blogFrom + 900, scene: "Blog Editor", title: "Generate Case Study section", body: "Aurora drafts a data-backed case study instantly.", index: 5, total: 6 },
  { from: blogFrom + 900, to: publishedBlogFrom, scene: "Blog Editor", title: "Publish the post", body: "One click to go live on your website.", index: 6, total: 6 },

  { from: publishedBlogFrom, to: publishedBlogFrom + sec(4), scene: "Live Website", title: "Published to your blog", body: "The post appears instantly on your live website.", index: 1, total: 2 },
  { from: publishedBlogFrom + sec(4), to: trafficFrom, scene: "Live Website", title: "Live and indexed", body: "SEO-optimized content ready for organic discovery.", index: 2, total: 2 },

  { from: trafficFrom, to: outroFrom, scene: "Results", title: "Real traffic growth", body: "Organic sessions climb as content compounds.", index: 1, total: 1 },

  {
    from: outroFrom,
    to: outroFrom + sec(DURATIONS.outro),
    scene: "Summary",
    title: "From idea to publish-ready content",
    body: "Faster production. Better quality. Consistent output.",
    index: 1,
    total: 1,
  },
];

const getCurrentStep = (frame: number): GuideStep => {
  return steps.find((s) => frame >= s.from && frame < s.to) ?? steps[steps.length - 1];
};

export const GuideBox: React.FC = () => {
  const frame = useCurrentFrame();
  const step = getCurrentStep(frame);

  const local = frame - step.from;
  const duration = Math.max(1, step.to - step.from);
  const stepProgress = Math.min(1, Math.max(0, local / duration));

  const fadeIn = interpolate(local, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(local, [duration - 10, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);
  const y = interpolate(opacity, [0, 1], [12, 0]);

  return (
    <div
      style={{
        position: "absolute",
        right: 28,
        bottom: 36,
        width: 420,
        borderRadius: 14,
        overflow: "hidden",
        background: "linear-gradient(135deg, rgba(14, 18, 29, 0.92), rgba(17, 25, 40, 0.86))",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        backdropFilter: "blur(8px)",
        color: "#FFFFFF",
        fontFamily: F,
        opacity,
        transform: `translateY(${y}px)`,
        zIndex: 110,
        pointerEvents: "none",
      }}
    >
      <div style={{ padding: "14px 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.68)", fontWeight: 700 }}>
            Live Demo Guide
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>
            {step.scene} · {step.index}/{step.total}
          </span>
        </div>

        <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2, marginBottom: 6 }}>
          {step.title}
        </div>

        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.45 }}>
          {step.body}
        </div>
      </div>

      <div style={{ height: 3, background: "rgba(255,255,255,0.2)" }}>
        <div
          style={{
            height: "100%",
            width: `${stepProgress * 100}%`,
            background: "linear-gradient(90deg, #63B3FF, #9B8CFF)",
          }}
        />
      </div>
    </div>
  );
};
