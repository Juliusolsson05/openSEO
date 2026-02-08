import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";
import { COLORS } from "../constants";

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoIn = spring({ fps, frame, config: { damping: 30, stiffness: 80 } });
  const taglineIn = spring({ fps, frame: Math.max(0, frame - 15), config: { damping: 30, stiffness: 80 } });

  const logoOpacity = interpolate(logoIn, [0, 1], [0, 1]);
  const logoScale = interpolate(logoIn, [0, 1], [0.8, 1]);
  const taglineOpacity = interpolate(taglineIn, [0, 1], [0, 1]);
  const taglineY = interpolate(taglineIn, [0, 1], [20, 0]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
          }}
        />
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
            color: COLORS.text,
            letterSpacing: "-0.04em",
          }}
        >
          Aurora
        </span>
      </div>
      <div
        style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          fontSize: 24,
          color: COLORS.textMuted,
          fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
          fontWeight: 400,
        }}
      >
        AI-powered content generation for businesses
      </div>
    </div>
  );
};
