import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { titlesData } from "../data";

/* ────────────────────────────────────────────
 * Animated replica of the blog/titles page.
 * Shows stats cards, filter bar, generate form,
 * and a table of titles with staggered entrances.
 *
 * Animation timeline (in local frames @ 30fps):
 *   0-14    : Page loads, stats visible
 *   15      : "New Titles" button highlighted
 *   22      : Generate form slides in
 *   30-90   : Topic typed
 *   95      : "Generate Titles" button pressed
 *   96-140  : Loading spinner
 *   141     : Form folds up
 *   150-195 : New titles stagger in
 *   150-195 : Stats counter animate up
 *   195-end : Hold on result
 * ──────────────────────────────────────────── */

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

/* ── Typed text (reusable from LoginScene pattern) ── */
const TypedText: React.FC<{
  text: string;
  startFrame: number;
  speed?: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, speed = 2, style }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.min(text.length, Math.floor(elapsed / speed));
  const showCursor = frame >= startFrame && chars < text.length;
  return (
    <span style={style}>
      {text.slice(0, chars)}
      {showCursor && (
        <span style={{ opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0, color: COLORS.primary }}>
          |
        </span>
      )}
    </span>
  );
};

/* ── Animated number counter ── */
const AnimatedNumber: React.FC<{
  from: number;
  to: number;
  startFrame: number;
  durationFrames?: number;
  style?: React.CSSProperties;
}> = ({ from, to, startFrame, durationFrames = 25, style }) => {
  const frame = useCurrentFrame();
  const value = Math.round(
    interpolate(frame, [startFrame, startFrame + durationFrames], [from, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  return <span style={style}>{value}</span>;
};

/* ── Status badge ── */
const StatusBadge: React.FC<{ status: number; text: string }> = ({ status, text }) => {
  const colors: Record<number, { bg: string; fg: string; border: string }> = {
    1: { bg: COLORS.warningLight, fg: COLORS.warningForeground, border: COLORS.warning },
    2: { bg: COLORS.successLight, fg: COLORS.success, border: COLORS.success },
    3: { bg: COLORS.primaryLight, fg: COLORS.primary, border: COLORS.primary },
    4: { bg: "#FDE8E8", fg: COLORS.destructive, border: COLORS.destructive },
  };
  const c = colors[status] || colors[1];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 8px",
        borderRadius: 2,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: F,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.border}40`,
      }}
    >
      {text}
    </span>
  );
};

/* ── Sparkles icon ── */
const IconSparkles = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

/* ── Plus icon ── */
const IconPlus = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/* ── Search icon ── */
const IconSearch = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={COLORS.mutedForeground} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/* ── X close icon ── */
const IconX = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Loader spinner ── */
const Spinner: React.FC<{ size?: number }> = ({ size = 14 }) => {
  const frame = useCurrentFrame();
  return (
    <svg
      width={size}
      height={size}
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

/* ─────────────────────────────────────────────────
 * MAIN COMPONENT
 * ───────────────────────────────────────────────── */

/** Timeline constants — all in local frames (28s = 840 frames) */
const T = {
  FORM_APPEAR: 64,     // form slides in after "New Titles" click
  TYPING_START: 152,   // start typing business description
  TYPING_END: 296,     // finish typing
  BTN_PRESS: 316,      // "Generate Titles" button press
  LOADING_START: 320,  // spinner appears
  LOADING_END: 450,    // loading ends
  FORM_FOLD: 452,      // form folds away
  TITLES_START: 500,   // new title rows start appearing
  TITLE_STAGGER: 14,   // frames between each row entrance
  STATS_ANIMATE: 500,  // stat counters start ticking
};

export const MockTitlesPage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Generate form slide-in spring ── */
  const formProgress = spring({
    fps,
    frame: Math.max(0, frame - T.FORM_APPEAR),
    config: { damping: 22, stiffness: 180 },
    durationInFrames: 18,
  });

  /* ── Generate form fold-away spring ── */
  const formFoldProgress = frame >= T.FORM_FOLD
    ? spring({
        fps,
        frame: Math.max(0, frame - T.FORM_FOLD),
        config: { damping: 22, stiffness: 200 },
        durationInFrames: 14,
      })
    : 0;

  const showForm = frame >= T.FORM_APPEAR;
  const formOpacity = showForm ? interpolate(formProgress, [0, 1], [0, 1]) - interpolate(formFoldProgress, [0, 1], [0, 1]) : 0;
  const FORM_OPEN_H = 104;
  const formHeight = showForm
    ? interpolate(formProgress, [0, 1], [0, FORM_OPEN_H]) - interpolate(formFoldProgress, [0, 1], [0, FORM_OPEN_H])
    : 0;

  /* ── Button press animation ── */
  const btnPressSpring = spring({
    fps,
    frame: Math.max(0, frame - T.BTN_PRESS),
    config: { damping: 15, stiffness: 300 },
    durationInFrames: 8,
  });
  const btnScale = frame >= T.BTN_PRESS && frame < T.BTN_PRESS + 8
    ? interpolate(btnPressSpring, [0, 1], [1, 0.96])
    : 1;

  const isLoading = frame >= T.LOADING_START && frame < T.LOADING_END;
  const showNewTitles = frame >= T.TITLES_START;
  const statsAnimating = frame >= T.STATS_ANIMATE;

  /* ── "New Titles" button highlight ── */
  const newTitlesBtnHighlight = frame >= 48 && frame < T.FORM_APPEAR;

  /* ── Visible rows: existing + conditionally new ── */
  const existingTitles = titlesData.existingTitles.slice(0, 7); // Show first 7 rows
  const generatedTitles = titlesData.generatedTitles;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Stats Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Total */}
        <div style={{ background: "#FFFFFF", borderRadius: 4, border: `1px solid ${COLORS.border}`, padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: COLORS.mutedForeground, margin: 0, fontFamily: F }}>
            TOTAL TITLES
          </p>
          <p style={{ fontSize: 28, fontWeight: 600, marginTop: 4, lineHeight: 1, margin: "4px 0 0", fontFamily: F }}>
            {statsAnimating ? (
              <AnimatedNumber from={titlesData.stats.total} to={titlesData.stats.totalAfter} startFrame={T.STATS_ANIMATE} />
            ) : (
              titlesData.stats.total
            )}
          </p>
        </div>
        {/* Pending */}
        <div style={{ background: "#FFFFFF", borderRadius: 4, border: `1px solid ${COLORS.border}`, padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: COLORS.mutedForeground, margin: 0, fontFamily: F }}>
            PENDING
          </p>
          <p style={{ fontSize: 28, fontWeight: 600, marginTop: 4, lineHeight: 1, margin: "4px 0 0", fontFamily: F, color: COLORS.warningForeground }}>
            {statsAnimating ? (
              <AnimatedNumber from={titlesData.stats.pending} to={titlesData.stats.pendingAfter} startFrame={T.STATS_ANIMATE} />
            ) : (
              titlesData.stats.pending
            )}
          </p>
        </div>
        {/* Generated */}
        <div style={{ background: "#FFFFFF", borderRadius: 4, border: `1px solid ${COLORS.border}`, padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: COLORS.mutedForeground, margin: 0, fontFamily: F }}>
            GENERATED
          </p>
          <p style={{ fontSize: 28, fontWeight: 600, marginTop: 4, lineHeight: 1, margin: "4px 0 0", fontFamily: F, color: COLORS.success }}>
            {titlesData.stats.generated}
          </p>
        </div>
      </div>

      {/* ── Filter / Action Bar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
            <IconSearch />
          </div>
          <div
            style={{
              height: 32,
              borderRadius: 2,
              border: `1px solid ${COLORS.border}`,
              background: "#FFFFFF",
              paddingLeft: 32,
              paddingRight: 12,
              display: "flex",
              alignItems: "center",
              fontSize: 12,
              color: "rgba(97,97,97,0.5)",
              fontFamily: F,
            }}
          >
            Search titles...
          </div>
        </div>

        {/* Status filter */}
        <div
          style={{
            display: "flex",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 2,
            overflow: "hidden",
            fontSize: 12,
            fontFamily: F,
          }}
        >
          {["All", "Pending", "Generated", "Approved", "Rejected"].map((label, i) => (
            <div
              key={label}
              style={{
                padding: "4px 12px",
                height: 28,
                display: "flex",
                alignItems: "center",
                background: i === 0 ? COLORS.primary : "transparent",
                color: i === 0 ? "#FFFFFF" : COLORS.foreground,
                borderLeft: i > 0 ? `1px solid ${COLORS.border}` : "none",
                fontWeight: 500,
                fontSize: 12,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Add Title button */}
        <div
          style={{
            height: 32,
            padding: "0 12px",
            borderRadius: 2,
            border: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: COLORS.foreground,
            background: "#FFFFFF",
            fontFamily: F,
          }}
        >
          <IconPlus />
          Add Title
        </div>

        {/* ✨ New Titles button */}
        <div
          style={{
            height: 32,
            padding: "0 12px",
            borderRadius: 2,
            border: `1px solid ${newTitlesBtnHighlight ? COLORS.primary : COLORS.border}`,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: COLORS.foreground,
            background: newTitlesBtnHighlight ? COLORS.primaryLight : "#FFFFFF",
            fontFamily: F,
            boxShadow: newTitlesBtnHighlight ? `0 0 0 2px ${COLORS.primary}40` : "none",
            transition: "none",
          }}
        >
          <IconSparkles />
          New Titles
        </div>
      </div>

      {/* ── Generate Form (animated slide-in) ── */}
      {showForm && formOpacity > 0.01 && (
        <div
          style={{
            opacity: Math.max(0, formOpacity),
            height: Math.max(0, formHeight),
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 4,
              border: `1px solid ${COLORS.border}`,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              {/* Topic input */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", fontFamily: F }}>Topic</p>
                <div
                  style={{
                    height: 36,
                    borderRadius: 2,
                    border: `1px solid ${frame >= T.TYPING_START && frame < T.BTN_PRESS ? COLORS.ring : COLORS.input}`,
                    background: "#FFFFFF",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                    color: COLORS.foreground,
                    fontFamily: F,
                    boxShadow: frame >= T.TYPING_START && frame < T.BTN_PRESS ? `0 0 0 1px ${COLORS.ring}` : "none",
                  }}
                >
                  <TypedText text={titlesData.generateInput.topic} startFrame={T.TYPING_START} speed={2} />
                </div>
              </div>
              {/* Count input */}
              <div style={{ width: 96 }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", fontFamily: F }}>Count</p>
                <div
                  style={{
                    height: 36,
                    borderRadius: 2,
                    border: `1px solid ${COLORS.input}`,
                    background: "#FFFFFF",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                    color: COLORS.foreground,
                    fontFamily: F,
                  }}
                >
                  5
                </div>
              </div>
              {/* Generate button */}
              <div
                style={{
                  height: 36,
                  padding: "0 16px",
                  borderRadius: 2,
                  background: COLORS.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#FFFFFF",
                  fontFamily: F,
                  transform: `scale(${btnScale})`,
                  whiteSpace: "nowrap",
                }}
              >
                {isLoading ? (
                  <>
                    <Spinner size={14} />
                    Generating...
                  </>
                ) : (
                  "Generate Titles"
                )}
              </div>
              {/* Close button */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.mutedForeground,
                }}
              >
                <IconX />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Titles Table ── */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 4,
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            borderBottom: `1px solid ${COLORS.border}`,
            background: "#FAFAFA",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: COLORS.mutedForeground,
            textTransform: "uppercase" as const,
            fontFamily: F,
          }}
        >
          {/* Checkbox placeholder */}
          <div style={{ width: 16, height: 16, borderRadius: 2, border: `1px solid ${COLORS.border}` }} />
          <div style={{ flex: 1 }}>Title</div>
          <div style={{ width: 90, textAlign: "center" }}>Status</div>
          <div style={{ width: 120 }}>Category</div>
          <div style={{ width: 80 }}>Created</div>
          <div style={{ width: 100 }}>Actions</div>
        </div>

        {/* ── New generated titles (staggered entrance) ── */}
        {showNewTitles &&
          generatedTitles.map((title, i) => {
            const titleFrame = T.TITLES_START + i * T.TITLE_STAGGER;
            const entrance = spring({
              fps,
              frame: Math.max(0, frame - titleFrame),
              config: { damping: 22, stiffness: 160 },
              durationInFrames: 18,
            });
            const titleOpacity = interpolate(entrance, [0, 1], [0, 1]);
            const titleY = interpolate(entrance, [0, 1], [12, 0]);

            return (
              <div
                key={title.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  borderBottom: `1px solid rgba(225,225,225,0.6)`,
                  opacity: titleOpacity,
                  transform: `translateY(${titleY}px)`,
                  background: `rgba(222,236,249,${interpolate(entrance, [0, 1], [0, 0.25])})`,
                  fontFamily: F,
                }}
              >
                <div style={{ width: 16, height: 16, borderRadius: 2, border: `1px solid ${COLORS.border}` }} />
                <div style={{ flex: 1, fontSize: 13, color: COLORS.foreground, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {title.title_text}
                </div>
                <div style={{ width: 90, display: "flex", justifyContent: "center" }}>
                  <StatusBadge status={title.status} text={title.statusText} />
                </div>
                <div style={{ width: 120 }}>
                  <div
                    style={{
                      height: 28,
                      borderRadius: 2,
                      border: `1px solid ${COLORS.border}`,
                      padding: "0 8px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 12,
                      color: COLORS.mutedForeground,
                      fontFamily: F,
                    }}
                  >
                    {title.category}
                  </div>
                </div>
                <div style={{ width: 80, fontSize: 12, color: COLORS.mutedForeground }}>{title.created}</div>
                <div style={{ width: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {title.status === 1 && (
                    <div
                      style={{
                        height: 26,
                        padding: "0 10px",
                        borderRadius: 2,
                        background: COLORS.primary,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#FFFFFF",
                        fontFamily: F,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Generate
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* ── Existing titles (static rows) ── */}
        {existingTitles.map((title) => (
          <div
            key={title.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              borderBottom: `1px solid rgba(225,225,225,0.6)`,
              fontFamily: F,
            }}
          >
            <div style={{ width: 16, height: 16, borderRadius: 2, border: `1px solid ${COLORS.border}` }} />
            <div style={{ flex: 1, fontSize: 13, color: COLORS.foreground, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {title.title_text}
            </div>
            <div style={{ width: 90, display: "flex", justifyContent: "center" }}>
              <StatusBadge status={title.status} text={title.statusText} />
            </div>
            <div style={{ width: 120 }}>
              <div
                style={{
                  height: 28,
                  borderRadius: 2,
                  border: `1px solid ${COLORS.border}`,
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                  color: COLORS.mutedForeground,
                  fontFamily: F,
                }}
              >
                {title.category}
              </div>
            </div>
            <div style={{ width: 80, fontSize: 12, color: COLORS.mutedForeground }}>{title.created}</div>
            <div style={{ width: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {title.status === 1 && (
                <div
                  style={{
                    height: 26,
                    padding: "0 10px",
                    borderRadius: 2,
                    background: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#FFFFFF",
                    fontFamily: F,
                    whiteSpace: "nowrap",
                  }}
                >
                  Generate
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: COLORS.mutedForeground, fontFamily: F }}>
          Showing 1-{showNewTitles ? titlesData.stats.totalAfter : titlesData.stats.total} of{" "}
          {showNewTitles ? titlesData.stats.totalAfter : titlesData.stats.total}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              height: 32,
              padding: "0 8px",
              borderRadius: 2,
              border: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              fontSize: 12,
              fontFamily: F,
              color: COLORS.foreground,
            }}
          >
            25
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 2,
              background: COLORS.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 500,
              color: "#FFFFFF",
              fontFamily: F,
            }}
          >
            1
          </div>
        </div>
      </div>
    </div>
  );
};
