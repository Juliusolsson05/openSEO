import React from "react";
import { COLORS } from "../../../constants";

/* ────────────────────────────────────────────
 * Skeleton loading placeholders matching the
 * real app's shimmer-style skeleton pattern.
 *
 * variant determines the shape:
 *   "image"   — tall rectangle (cover photo)
 *   "heading" — single wide bar
 *   "text"    — 3-4 lines of varying width
 *   "block"   — medium height rounded box
 *   "list"    — heading + 4-5 short lines
 *   "chart"   — square block (for statistic/chart)
 * ──────────────────────────────────────────── */

const BAR_COLOR = "#E8E8E8";
const BAR_DARK = "#E0E0E0";

const Bar: React.FC<{ width: string; height: number; mb?: number }> = ({ width, height, mb = 0 }) => (
  <div style={{
    width, height, borderRadius: 4, background: BAR_COLOR,
    marginBottom: mb, animation: "none",
  }} />
);

export type SkeletonVariant = "image" | "heading" | "text" | "block" | "list" | "chart" | "card";

export const Skeleton: React.FC<{ variant: SkeletonVariant }> = ({ variant }) => {
  switch (variant) {
    case "image":
      return (
        <div style={{ marginBottom: 20 }}>
          <div style={{ width: "100%", height: 340, borderRadius: 8, background: BAR_COLOR }} />
        </div>
      );

    case "heading":
      return (
        <div style={{ marginBottom: 20 }}>
          <Bar width="65%" height={24} mb={0} />
        </div>
      );

    case "text":
      return (
        <div style={{ marginBottom: 20 }}>
          <Bar width="45%" height={22} mb={14} />
          <Bar width="100%" height={14} mb={10} />
          <Bar width="92%" height={14} mb={10} />
          <Bar width="78%" height={14} mb={10} />
          <Bar width="85%" height={14} mb={0} />
        </div>
      );

    case "list":
      return (
        <div style={{ marginBottom: 20 }}>
          <Bar width="50%" height={22} mb={16} />
          <Bar width="88%" height={14} mb={10} />
          {[0.7, 0.8, 0.75, 0.65, 0.72].map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: BAR_DARK, flexShrink: 0 }} />
              <Bar width={`${w * 100}%`} height={14} />
            </div>
          ))}
        </div>
      );

    case "chart":
      return (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            width: "100%", padding: 30, borderRadius: 8, background: "#F5F5F5",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          }}>
            <Bar width="40%" height={22} />
            <div style={{ width: 140, height: 140, borderRadius: "50%", border: `12px solid ${BAR_COLOR}`, background: "transparent" }} />
            <Bar width="70%" height={14} />
          </div>
        </div>
      );

    case "block":
      return (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            width: "100%", borderRadius: 8, border: `1px solid ${COLORS.border}`,
            background: COLORS.card, padding: 20,
          }}>
            <Bar width="40%" height={20} mb={14} />
            <Bar width="100%" height={12} mb={8} />
            <Bar width="90%" height={12} mb={8} />
            <Bar width="60%" height={12} />
          </div>
        </div>
      );

    case "card":
      return (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            width: "100%", borderRadius: 8, border: `1px solid ${COLORS.border}`,
            background: COLORS.card, padding: 20,
          }}>
            <Bar width="35%" height={18} mb={12} />
            {[1, 2, 3].map((_, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "center", marginBottom: 10,
                padding: "8px 12px", borderRadius: 6, background: "#FAFAFA",
              }}>
                <div style={{ width: 16, height: 16, borderRadius: 3, background: BAR_COLOR, flexShrink: 0 }} />
                <Bar width={`${60 + i * 10}%`} height={14} />
              </div>
            ))}
          </div>
        </div>
      );
  }
};
