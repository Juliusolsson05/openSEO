import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export interface CaseStudyContent {
  title: string;
  clientName: string;
  industry: string;
  companyWebsite?: string;
  headerColor?: string;
  challenge: string;
  solution: string;
  results: string[];
  testimonial?: {
    quote: string;
    author: string;
  };
}

/** 1:1 replica of the real dashboard CaseStudy / CaseStudyPreview component */
export const CaseStudy: React.FC<{ content: CaseStudyContent }> = ({ content }) => {
  const results = Array.isArray(content?.results) ? content.results : [];
  const headerColor =
    content?.headerColor && /^#[0-9a-fA-F]{6}$/.test(content.headerColor)
      ? content.headerColor
      : "#0078D4";

  const domain = (content?.companyWebsite || "")
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "");

  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{ overflow: "hidden", borderRadius: 12, border: `1px solid ${COLORS.border}`, background: COLORS.card, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

        {/* ── Header ── */}
        <div style={{ position: "relative", padding: "28px 32px", color: "#FFFFFF", backgroundColor: headerColor }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em", color: "#FFFFFF", fontFamily: F }}>
                {content.title}
              </h2>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
                {/* Building2 icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                <span>{content.clientName}</span>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>·</span>
                <span>{content.industry}</span>
              </div>
            </div>
            {/* Company logo */}
            {domain && (
              <div style={{ width: 56, height: 56, borderRadius: 8, background: "#FFFFFF", padding: 6, flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src={`https://img.logo.dev/${domain}?token=pk_PJnue9akRVmT-qo6GmYjhA`}
                  alt={`${content.clientName} Logo`}
                  style={{ width: 44, height: 44, objectFit: "contain" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Challenge & Solution — two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <h3 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.mutedForeground, fontFamily: F }}>The Challenge</h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: COLORS.foreground, fontFamily: F }}>{content.challenge}</p>
            </div>
            <div>
              <h3 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.mutedForeground, fontFamily: F }}>The Solution</h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: COLORS.foreground, fontFamily: F }}>{content.solution}</p>
            </div>
          </div>

          {/* Key Results — green badges */}
          {results.length > 0 && (
            <div>
              <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.mutedForeground, fontFamily: F }}>Key Results</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {results.map((result, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 8, border: "1px solid #A7F3D0", background: "#ECFDF5", padding: "12px 16px" }}>
                    {/* CheckCircle2 icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span style={{ fontSize: 14, lineHeight: 1.4, color: COLORS.foreground, fontFamily: F }}>{result}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonial */}
          {content?.testimonial?.quote && (
            <div style={{ position: "relative", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "#F9FAFB", padding: "20px 24px" }}>
              {/* Quote icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", top: 16, left: 16 }}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>
              <blockquote style={{ paddingLeft: 24, margin: 0, fontSize: 16, fontWeight: 300, fontStyle: "italic", lineHeight: 1.7, color: COLORS.foreground, fontFamily: F }}>
                &ldquo;{content.testimonial.quote}&rdquo;
              </blockquote>
              <p style={{ paddingLeft: 24, margin: "12px 0 0", fontSize: 13, fontWeight: 600, color: COLORS.mutedForeground, fontFamily: F }}>
                — {content.testimonial.author}
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {content?.companyWebsite && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${COLORS.border}`, padding: "16px 32px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: COLORS.primary, fontFamily: F }}>
              {/* ExternalLink icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Visit {content.clientName}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 500, color: COLORS.primary, fontFamily: F }}>
              Read Full Case Study
              {/* ArrowRight icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
