import React, { useLayoutEffect, useRef, useState } from "react";
import { interpolate, useCurrentFrame, Easing, useCurrentScale } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { Cursor, type Waypoint } from "../components/Cursor";
import { HEIGHT, COLORS } from "../constants";
import { DashboardShell } from "../ui/DashboardShell";
import { MockBlogPostPage } from "../ui/blog/MockBlogPostPage";
import { ELEMENT_ICONS } from "../ui/blog/ElementIcons";

/* ────────────────────────────────────────────
 * Blog Post Scene — 36s (1080 frames @ 30fps)
 *
 *   0–340     Scroll down + live generation
 *   340–380   Hold at bottom
 *   380–460   Scroll back up to intro
 *   460–505   Cursor → Edit mode switch, click
 *   505–545   Cursor → Introduction, click
 *   545–620   Typing + "Saved"
 *   620–680   Cursor drifts, + button appears
 *   680–700   Click + button
 *   700–780   Modal: select Case Study, click confirm
 *   780–800   Modal closes
 *   800–820   Scroll down a bit to reveal new element
 *   820–880   Skeleton loading
 *   880–1080  Case study generated, hold
 * ──────────────────────────────────────────── */

const SCROLL_MAX = 2000;
const SCROLL_REST = 280;
const SCROLL_CASE_STUDY = 520; // scroll further to reveal new element

/* Layout coords (BrowserFrame content space) */
const EDIT_SWITCH_X = 1612;
const EDIT_SWITCH_Y = 162;
const INTRO_X = 900;
const INTRO_Y = 650;
const PLUS_X = 960;
const PLUS_Y = 760;
/* Modal is rendered as viewport overlay — coords are viewport-relative */
const MODAL_CASE_X = 720;
const MODAL_CASE_Y = 520;
const MODAL_ADD_BTN_X = 870;
const MODAL_ADD_BTN_Y = 630;

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

const modalElements = [
  "Paragraph", "Table", "FAQ", "Checklist",
  "Case Study", "Statistic", "Timeline", "Pros & Cons",
];

export const BlogPostScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = useCurrentScale({ dontThrowIfOutsideOfRemotion: true });
  const rootRef = useRef<HTMLDivElement>(null);
  const [targets, setTargets] = useState<Record<string, { x: number; y: number } | null>>({
    editSwitch: null,
    introduction: null,
    plusButton: null,
    modalCaseStudy: null,
    modalAddButton: null,
  });
  const frozenTargetsRef = useRef<Record<string, { x: number; y: number } | null>>({
    editSwitch: null,
    introduction: null,
    plusButton: null,
    modalCaseStudy: null,
    modalAddButton: null,
  });

  /* ── Scroll ── */
  let scrollY: number;
  if (frame <= 340) {
    scrollY = interpolate(frame, [1, 340], [0, SCROLL_MAX], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    });
  } else if (frame <= 380) {
    scrollY = SCROLL_MAX;
  } else if (frame <= 460) {
    scrollY = interpolate(frame, [380, 460], [SCROLL_MAX, SCROLL_REST], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    });
  } else if (frame <= 800) {
    scrollY = SCROLL_REST;
  } else if (frame <= 840) {
    // Scroll down to reveal the new case study element
    scrollY = interpolate(frame, [800, 840], [SCROLL_REST, SCROLL_CASE_STUDY], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.ease),
    });
  } else {
    scrollY = SCROLL_CASE_STUDY;
  }

  /* ── State flags ── */
  const editModeOn      = frame >= 505;
  const introSelected   = frame >= 545 && frame < 640;
  const showAddButton   = frame >= 650 && frame < 700;
  const addModalOpen    = frame >= 700 && frame < 790;
  const caseStudyGen    = frame >= 800 && frame < 880;
  const caseStudyDone   = frame >= 880;
  // Case Study card selected in modal after cursor clicks it
  const caseStudySelected = frame >= 750;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const rootRect = root.getBoundingClientRect();
    const queryPos = (name: string) => {
      const el = root.querySelector(`[data-cursor-target="${name}"]`) as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: (r.left - rootRect.left + r.width / 2) / scale,
        y: (r.top - rootRect.top + r.height / 2) / scale,
      };
    };

    let changed = false;
    const frozen = frozenTargetsRef.current;

    // Capture each target once around the interaction window and keep it stable.
    if (!frozen.editSwitch && frame >= 470) {
      const p = queryPos("editSwitch");
      if (p) {
        frozen.editSwitch = p;
        changed = true;
      }
    }

    if (!frozen.introduction && frame >= 520) {
      const p = queryPos("introduction");
      if (p) {
        frozen.introduction = p;
        changed = true;
      }
    }

    if (!frozen.plusButton && showAddButton && frame >= 655) {
      const p = queryPos("plusButton");
      if (p) {
        frozen.plusButton = p;
        changed = true;
      }
    }

    if (!frozen.modalCaseStudy && addModalOpen && frame >= 725) {
      const p = queryPos("modalCaseStudy");
      if (p) {
        frozen.modalCaseStudy = p;
        changed = true;
      }
    }

    if (!frozen.modalAddButton && addModalOpen && caseStudySelected && frame >= 765) {
      const p = queryPos("modalAddButton");
      if (p) {
        frozen.modalAddButton = p;
        changed = true;
      }
    }

    if (changed) {
      setTargets({ ...frozen });
    }
  }, [frame, scale, addModalOpen, showAddButton, caseStudySelected]);

  const editTarget = targets.editSwitch ?? { x: EDIT_SWITCH_X, y: EDIT_SWITCH_Y };
  const introTarget = targets.introduction ?? { x: INTRO_X, y: INTRO_Y - scrollY };
  const plusTarget = targets.plusButton ?? { x: PLUS_X, y: PLUS_Y - scrollY };
  const caseStudyTarget = targets.modalCaseStudy ?? { x: MODAL_CASE_X, y: MODAL_CASE_Y };
  const modalAddTarget = targets.modalAddButton ?? { x: MODAL_ADD_BTN_X, y: MODAL_ADD_BTN_Y };

  /* ── Cursor ── */
  const waypoints: Waypoint[] = [
    { frame: 0,    x: 860,            y: 450 },
    { frame: 340,  x: 900,            y: 500 },
    { frame: 430,  x: 1300,           y: 300 },
    // Edit mode toggle
    { frame: 480,  x: editTarget.x,   y: editTarget.y },
    { frame: 502,  x: editTarget.x,   y: editTarget.y, click: true },
    // Click intro
    { frame: 530,  x: introTarget.x,  y: introTarget.y },
    { frame: 543,  x: introTarget.x,  y: introTarget.y, click: true },
    // Typing drift
    { frame: 580,  x: introTarget.x - 20, y: introTarget.y + 8 },
    { frame: 630,  x: introTarget.x + 10, y: introTarget.y + 5 },
    // Plus button
    { frame: 660,  x: plusTarget.x,   y: plusTarget.y },
    { frame: 678,  x: plusTarget.x,   y: plusTarget.y, click: true },
    // Select Case Study in modal
    { frame: 730,  x: caseStudyTarget.x, y: caseStudyTarget.y },
    { frame: 748,  x: caseStudyTarget.x, y: caseStudyTarget.y, click: true },
    // Click "Add Element" button
    { frame: 770,  x: modalAddTarget.x, y: modalAddTarget.y },
    { frame: 785,  x: modalAddTarget.x, y: modalAddTarget.y, click: true },
    // Watch generation
    { frame: 850,  x: INTRO_X + 60,   y: 550 },
    { frame: 1080, x: INTRO_X + 50,   y: 540 },
  ];

  return (
    <BrowserFrame url="app.nordtools.com/blog/42/edit" pad={0}>
      <div ref={rootRef} style={{ width: "100%", height: "100%", position: "relative" }}>
        <DashboardShell pageTitle="Edit Post" sidebarActiveItem="Blog Posts">
          <div style={{
            margin: -32,
            height: HEIGHT - 48 - 40,
            overflow: "hidden",
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              transform: `translateY(${-scrollY}px)`,
            }}>
              <MockBlogPostPage
                frame={frame}
                editMode={editModeOn}
                introSelected={introSelected}
                showAddButton={showAddButton}
                addModalOpen={false}
                caseStudyGenerating={caseStudyGen}
                caseStudyInserted={caseStudyDone}
              />
            </div>
          </div>
        </DashboardShell>

        {/* Add Element Modal — rendered at viewport level so it doesn't scroll */}
        {addModalOpen && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 90,
          }}>
            <div style={{
              width: 820, borderRadius: 6,
              border: `1px solid ${COLORS.border}`,
              background: "#FFFFFF", padding: 20,
              fontFamily: F,
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.foreground }}>Add Element</p>
                <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, color: COLORS.mutedForeground, fontSize: 18 }}>×</div>
              </div>

              {/* Mode tabs */}
              <div style={{ display: "inline-flex", border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: 2, background: "#F5F5F5", marginBottom: 14 }}>
                <div style={{ padding: "6px 12px", background: COLORS.primary, color: "#FFF", borderRadius: 3, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>✨ Generate</div>
                <div style={{ padding: "6px 12px", color: COLORS.mutedForeground, fontSize: 12 }}>Template</div>
              </div>

              {/* Search */}
              <div style={{ height: 34, border: `1px solid ${COLORS.border}`, borderRadius: 4, marginBottom: 14, display: "flex", alignItems: "center", padding: "0 12px", color: COLORS.mutedForeground, fontSize: 13 }}>
                🔍 Search elements
              </div>

              {/* Element grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {modalElements.map((el) => {
                  const selected = caseStudySelected && el === "Case Study";
                  const Icon = ELEMENT_ICONS[el];
                  return (
                    <div
                      key={el}
                      data-cursor-target={el === "Case Study" ? "modalCaseStudy" : undefined}
                      style={{
                        border: `1.5px solid ${selected ? COLORS.primary : COLORS.border}`,
                        background: selected ? "#EBF3FE" : "#FFFFFF",
                        borderRadius: 4, padding: 14, cursor: "pointer",
                        boxShadow: selected ? `0 0 0 2px ${COLORS.primary}30` : "none",
                      }}
                    >
                      <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                        {Icon ? <Icon width={70} height={70} /> : null}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: COLORS.foreground }}>{el}</p>
                        <span style={{ fontSize: 10, color: COLORS.primary }}>👁</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "7px 16px", fontSize: 13, color: COLORS.foreground }}>Cancel</div>
                <div
                  data-cursor-target="modalAddButton"
                  style={{
                    background: caseStudySelected ? COLORS.primary : "#D4D4D4",
                    color: "#FFF", borderRadius: 4, padding: "7px 16px",
                    fontSize: 13, fontWeight: 600,
                  }}
                >Add Element</div>
              </div>
            </div>
          </div>
        )}

        <Cursor waypoints={waypoints} />
      </div>
    </BrowserFrame>
  );
};
