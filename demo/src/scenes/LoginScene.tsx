import React from "react";
import { Audio, interpolate, spring, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { COLORS } from "../constants";
import { loginData } from "../data";

const typingSfx = staticFile("audio/typing.mp3");
const clickSfx = staticFile("audio/click.mp3");

/** Aurora "A" logo — matches real SVG */
const AuroraLogo: React.FC<{ size?: number; light?: boolean }> = ({
  size = 28,
  light = false,
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path
      d="M16 2L3 28h5.5l2.5-5h10l2.5 5H29L16 2Zm0 9l4 8h-8l4-8Z"
      fill={light ? "#FFFFFF" : "#0078D4"}
      fillRule="evenodd"
    />
  </svg>
);

/** Typing animation — reveals characters one by one */
const TypedText: React.FC<{
  text: string;
  startFrame: number;
  speed?: number;
}> = ({ text, startFrame, speed = 3 }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.min(text.length, Math.floor(elapsed / speed));
  const showCursor = frame >= startFrame && chars < text.length;
  return (
    <span>
      {text.slice(0, chars)}
      {showCursor && (
        <span
          style={{
            opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
            color: COLORS.primary,
          }}
        >
          |
        </span>
      )}
    </span>
  );
};

/**
 * Multi-stage camera: hold → zoom to email → pan to password → pan to button
 * Uses spring physics for snappy transitions between keyframes.
 */
function useCamera(frame: number, fps: number) {
  // Keyframe timings
  const HOLD_END = 22;       // 0.73s hold on full view
  const EMAIL_ZOOM = 24;     // start zooming to email
  const PASSWORD_PAN = 74;   // pan down to password
  const BUTTON_PAN = 130;    // pan to button

  // Camera states: [scale, x, y]
  // Full view
  const FULL = { scale: 1, x: 0, y: 0 };
  // Zoomed into email field area (right side, upper form)
  const EMAIL = { scale: 1.65, x: -340, y: -60 };
  // Pan to password field (same zoom, shift down)
  const PASSWORD = { scale: 1.65, x: -340, y: -130 };
  // Pan to button (same zoom, shift further down)
  const BUTTON = { scale: 1.65, x: -340, y: -185 };

  const springConfig = { damping: 26, stiffness: 200, mass: 0.4 };

  // Phase 1: Hold
  if (frame < EMAIL_ZOOM) return FULL;

  // Phase 2: Zoom to email
  const zoomProgress = spring({
    fps,
    frame: Math.max(0, frame - EMAIL_ZOOM),
    config: springConfig,
    durationInFrames: 20,
  });

  if (frame < PASSWORD_PAN) {
    return {
      scale: interpolate(zoomProgress, [0, 1], [FULL.scale, EMAIL.scale]),
      x: interpolate(zoomProgress, [0, 1], [FULL.x, EMAIL.x]),
      y: interpolate(zoomProgress, [0, 1], [FULL.y, EMAIL.y]),
    };
  }

  // Phase 3: Pan to password
  const panProgress = spring({
    fps,
    frame: Math.max(0, frame - PASSWORD_PAN),
    config: springConfig,
    durationInFrames: 16,
  });

  if (frame < BUTTON_PAN) {
    return {
      scale: interpolate(panProgress, [0, 1], [EMAIL.scale, PASSWORD.scale]),
      x: interpolate(panProgress, [0, 1], [EMAIL.x, PASSWORD.x]),
      y: interpolate(panProgress, [0, 1], [EMAIL.y, PASSWORD.y]),
    };
  }

  // Phase 4: Pan to button
  const btnProgress = spring({
    fps,
    frame: Math.max(0, frame - BUTTON_PAN),
    config: springConfig,
    durationInFrames: 16,
  });

  return {
    scale: interpolate(btnProgress, [0, 1], [PASSWORD.scale, BUTTON.scale]),
    x: interpolate(btnProgress, [0, 1], [PASSWORD.x, BUTTON.x]),
    y: interpolate(btnProgress, [0, 1], [PASSWORD.y, BUTTON.y]),
  };
}

export const LoginScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timing
  const EMAIL_START = 28;
  const PASSWORD_START = 78;
  const BUTTON_PRESS = 136;

  const cam = useCamera(frame, fps);

  // Button press animation
  const buttonScale = spring({
    fps,
    frame: Math.max(0, frame - BUTTON_PRESS),
    config: { damping: 15, stiffness: 300 },
    durationInFrames: 8,
  });
  const btnPressScale = frame >= BUTTON_PRESS ? interpolate(buttonScale, [0, 1], [1, 0.97]) : 1;

  // Loading spinner appears after button press
  const showLoading = frame >= BUTTON_PRESS + 8;

  return (
  <>
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
      <BrowserFrame url="aurora.nordtools.se/login">
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
          }}
        >
          {/* Left — Azure branding panel */}
          <div
            style={{
              width: 480,
              minHeight: "100%",
              background: "linear-gradient(135deg, #002050 0%, #0078D4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Geometric accents */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 45%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -64,
                right: -80,
                width: 256,
                height: 256,
                transform: "rotate(12deg)",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -80,
                left: -80,
                width: 224,
                height: 224,
                transform: "rotate(-12deg)",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)",
              }}
            />
            {/* Grid pattern */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.08,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 10,
                maxWidth: 320,
                padding: "0 40px",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <AuroraLogo size={56} light />
              </div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.2 }}>
                Aurora
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)" }}>
                by Nordtools
              </p>
              <p style={{ margin: "24px 0 0", fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.7)" }}>
                AI-powered content engine. Generate, optimize, and publish blog content that ranks.
              </p>
            </div>
          </div>

          {/* Right — Form area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#FFFFFF",
              padding: 32,
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", left: 32, top: 32, fontSize: 12, fontWeight: 500, color: COLORS.mutedForeground }}>
              ← Back to Home
            </div>

            <div style={{ width: 380 }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: COLORS.foreground, lineHeight: 1.2 }}>
                Sign in
              </h2>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: COLORS.mutedForeground }}>
                to continue to Aurora Dashboard
              </p>

              {/* Demo credentials box */}
              <div style={{ marginTop: 24, borderRadius: 2, border: `1px solid ${COLORS.infoLight}`, background: COLORS.infoLight, padding: 12 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.primary, marginBottom: 6 }}>
                  Demo Accounts
                </p>
                <div style={{ fontSize: 12, color: COLORS.mutedForeground, lineHeight: 1.6 }}>
                  <p style={{ margin: 0 }}>
                    Admin: <span style={{ fontWeight: 600, color: COLORS.foreground }}>admin@demo.com</span> / <span style={{ fontWeight: 600, color: COLORS.foreground }}>admin</span>
                  </p>
                  <p style={{ margin: "2px 0 0" }}>
                    Client: <span style={{ fontWeight: 600, color: COLORS.foreground }}>client@demo.com</span> / <span style={{ fontWeight: 600, color: COLORS.foreground }}>client</span>
                  </p>
                </div>
              </div>

              {/* Form */}
              <div style={{ marginTop: 24 }}>
                {/* Email field */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.foreground, marginBottom: 4 }}>
                    {loginData.fields.email.label}
                  </label>
                  <div
                    style={{
                      height: 36,
                      borderRadius: 2,
                      border: `1px solid ${frame >= EMAIL_START && frame < PASSWORD_START ? COLORS.ring : COLORS.input}`,
                      background: "#FFFFFF",
                      padding: "0 12px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 14,
                      color: COLORS.foreground,
                      boxShadow: frame >= EMAIL_START && frame < PASSWORD_START ? `0 0 0 1px ${COLORS.ring}` : "none",
                    }}
                  >
                    <TypedText text={loginData.fields.email.typingValue} startFrame={EMAIL_START} speed={3} />
                  </div>
                </div>

                {/* Password field */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.foreground }}>
                      {loginData.fields.password.label}
                    </label>
                    <span style={{ fontSize: 12, color: COLORS.primary }}>Forgot password?</span>
                  </div>
                  <div
                    style={{
                      height: 36,
                      borderRadius: 2,
                      border: `1px solid ${frame >= PASSWORD_START && frame < BUTTON_PRESS ? COLORS.ring : COLORS.input}`,
                      background: "#FFFFFF",
                      padding: "0 12px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 14,
                      color: COLORS.foreground,
                      boxShadow: frame >= PASSWORD_START && frame < BUTTON_PRESS ? `0 0 0 1px ${COLORS.ring}` : "none",
                    }}
                  >
                    <TypedText text={loginData.fields.password.typingValue} startFrame={PASSWORD_START} speed={4} />
                  </div>
                </div>

                {/* Submit button */}
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      height: 36,
                      borderRadius: 2,
                      background: COLORS.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#FFFFFF",
                      cursor: "pointer",
                      transform: `scale(${btnPressScale})`,
                    }}
                  >
                    {showLoading ? (
                      <>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${frame * 12}deg)` }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </div>
                </div>

                <p style={{ textAlign: "center", fontSize: 12, color: COLORS.mutedForeground, marginTop: 16 }}>
                  No account?{" "}
                  <span style={{ color: COLORS.primary, fontWeight: 600 }}>Create one</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>
      </div>
    </div>

    {/* Audio */}
    <Sequence from={EMAIL_START} durationInFrames={50}>
      <Audio src={typingSfx} volume={0.6} />
    </Sequence>
    <Sequence from={PASSWORD_START} durationInFrames={40}>
      <Audio src={typingSfx} volume={0.5} />
    </Sequence>
    <Sequence from={BUTTON_PRESS} durationInFrames={12}>
      <Audio src={clickSfx} volume={0.8} />
    </Sequence>
  </>
  );
};
