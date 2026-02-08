import React from "react";
import { COLORS } from "../../constants";
import { SubToolbar } from "./SubToolbar";
import { TableOfContents } from "./elements/TableOfContents";
import { Introduction } from "./elements/Introduction";
import { Paragraph } from "./elements/Paragraph";
import { ListParagraph } from "./elements/ListParagraph";
import { Statistic } from "./elements/Statistic";
import { Checklist } from "./elements/Checklist";
import { FAQ } from "./elements/FAQ";
import { Conclusion } from "./elements/Conclusion";
import { ImageElement } from "./elements/ImageElement";
import { ElementReveal } from "./elements/ElementReveal";
import { ActionsCard } from "./sidebar/ActionsCard";
import { PostDetailsCard } from "./sidebar/PostDetailsCard";
import { PostInfoCard } from "./sidebar/PostInfoCard";
import { QuilloFab } from "./sidebar/QuilloFab";

/* ────────────────────────────────────────────
 * MockBlogPostPage
 *
 * When `frame` is provided, elements progressively
 * reveal from skeleton → real content, simulating
 * live AI generation. Without `frame`, all content
 * renders immediately.
 * ──────────────────────────────────────────── */

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

/*
 * Reveal schedule — frame offsets when each element
 * transitions from skeleton to generated content.
 * Spaced so each element "generates" as the scroll
 * reaches it.
 *
 * 600 frames total (20s @ 30fps)
 */
const R = {
  TITLE:        0,
  IMAGE:       10,
  TOC:         40,
  INTRO:       65,
  PARA_1:     100,
  PARA_2:     140,
  LIST:       180,
  STAT:       220,
  PARA_3:     255,
  CHECKLIST:  290,
  FAQ:        330,
  CONCLUSION: 370,
};

export const MockBlogPostPage: React.FC<{
  frame?: number;
  editMode?: boolean;
  introSelected?: boolean;
}> = ({ frame, editMode = false, introSelected = false }) => {
  // If no frame, show everything (static mode)
  const f = frame ?? 9999;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.background, fontFamily: F, position: "relative" }}>
      <SubToolbar title="The Future of Small Businesses: Embracing AI Tools for Growth" published />

      <div style={{ display: "flex", flex: 1, gap: 24, padding: "0 24px 24px", overflow: "hidden", maxWidth: 1152, margin: "0 auto", width: "100%" }}>
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          <div style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, padding: 24 }}>
            {/* Title — always visible */}
            <h1 style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.3, color: COLORS.foreground, margin: "0 0 20px", fontFamily: F }}>
              The Future of Small Businesses: Embracing AI Tools for Growth
            </h1>

            {/* Cover image */}
            <ElementReveal frame={f} revealAt={R.IMAGE} skeletonType="image">
              <ImageElement alt="AI tech laptop cover" />
            </ElementReveal>

            {/* Table of Contents */}
            <ElementReveal frame={f} revealAt={R.TOC} skeletonType="block">
              <TableOfContents content={{ items: ["Introduction", "Adapting to Technological Changes", "Understanding AI Tools", "Key Advantages", "Cultivating a Culture of Innovation", "Conclusion"] }} />
            </ElementReveal>

            {/* Introduction */}
            <ElementReveal frame={f} revealAt={R.INTRO} skeletonType="text">
              <div style={{
                position: "relative",
                borderRadius: 6,
                outline: introSelected ? `2px solid ${COLORS.primary}` : "none",
                outlineOffset: 4,
                transition: "outline 0.15s",
              }}>
                {introSelected && (
                  <div style={{
                    position: "absolute", top: -28, left: 0,
                    display: "flex", gap: 2, padding: "4px 6px",
                    background: COLORS.primary, borderRadius: "4px 4px 0 0",
                    zIndex: 20,
                  }}>
                    {["B", "I", "U", "🔗", "📝"].map((btn, i) => (
                      <div key={i} style={{
                        width: 24, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: i < 3 ? 700 : 400, color: "#FFFFFF",
                        borderRadius: 2, cursor: "pointer",
                      }}>
                        {btn}
                      </div>
                    ))}
                  </div>
                )}
                <Introduction content={{
                  heading: "Introduction",
                  body: "Small businesses are navigating rapid digital change. AI tools now make it possible to automate repetitive work, uncover customer insights, and make faster decisions without enterprise-sized teams.",
                }} />
              </div>
            </ElementReveal>

            {/* Paragraph 1 */}
            <ElementReveal frame={f} revealAt={R.PARA_1} skeletonType="text">
              <Paragraph content={{
                heading: "Adapting to Technological Changes in Small Business",
                paragraphs: [
                  "The pace of innovation means customer expectations evolve quickly. Businesses that keep relying on manual processes often struggle to maintain responsiveness and consistency.",
                  "By adopting practical AI workflows, teams can reduce bottlenecks, improve execution quality, and focus more time on strategic, high-value work.",
                ],
              }} />
            </ElementReveal>

            {/* Paragraph 2 */}
            <ElementReveal frame={f} revealAt={R.PARA_2} skeletonType="text">
              <Paragraph content={{
                heading: "Understanding AI Tools for Small Business Growth",
                paragraphs: [
                  "AI tools include everything from writing assistants and chatbots to forecasting and automation systems. The strongest options fit current workflows and deliver clear outcomes quickly.",
                  "When introduced with clear goals, AI augments human capability, enabling smarter planning, sharper marketing, and better customer experiences.",
                ],
              }} />
            </ElementReveal>

            {/* List Paragraph */}
            <ElementReveal frame={f} revealAt={R.LIST} skeletonType="list">
              <ListParagraph content={{
                heading: "Key Advantages of AI Tools for Small Businesses",
                textBeforeList: "AI adoption can unlock measurable improvements across operations, marketing, and service:",
                items: [
                  { label: "Operational Efficiency", text: "Automates repetitive processes and reduces manual errors." },
                  { label: "Customer Insights", text: "Turns behavior and support data into actionable trends." },
                  { label: "Smarter Marketing", text: "Improves campaign relevance through predictive segmentation." },
                  { label: "Faster Support", text: "Uses assistants and workflows to reduce response time." },
                  { label: "Scalable Growth", text: "Supports expansion without proportional overhead increases." },
                ],
              }} />
            </ElementReveal>

            {/* Statistic */}
            <ElementReveal frame={f} revealAt={R.STAT} skeletonType="chart">
              <Statistic content={{
                title: "AI Adoption Rate",
                percentage: 73,
                description: "73% of small businesses now use or pilot AI tools to improve performance and competitiveness.",
              }} />
            </ElementReveal>

            {/* Paragraph 3 */}
            <ElementReveal frame={f} revealAt={R.PARA_3} skeletonType="text">
              <Paragraph content={{
                heading: "Cultivating a Culture of Innovation",
                paragraphs: [
                  "Long-term AI success depends on culture, not just tooling. Teams should be encouraged to experiment, learn quickly, and scale what works with confidence.",
                ],
              }} />
            </ElementReveal>

            {/* Checklist */}
            <ElementReveal frame={f} revealAt={R.CHECKLIST} skeletonType="card">
              <Checklist content={{
                title: "AI Implementation Checklist",
                introduction: "Follow these steps to roll out AI effectively:",
                items: [
                  { action: "Define your objective", details: "Pick one measurable outcome to improve first.", checked: true },
                  { action: "Audit your current stack", details: "Identify easy integration opportunities.", checked: true },
                  { action: "Launch a pilot", details: "Start small and validate impact quickly.", checked: true },
                  { action: "Train team members", details: "Provide practical onboarding and examples." },
                  { action: "Track performance", details: "Monitor KPIs monthly and adjust execution." },
                  { action: "Scale proven workflows", details: "Expand successful use cases into core operations." },
                ],
              }} />
            </ElementReveal>

            {/* FAQ */}
            <ElementReveal frame={f} revealAt={R.FAQ} skeletonType="card">
              <FAQ
                content={[
                  { question: "What AI tools should a small business start with?", answer: "Start with high-impact tools for content, support, and workflow automation where ROI is easiest to measure." },
                  { question: "Is AI adoption expensive?", answer: "Many tools are accessible via monthly plans; focused pilots often pay for themselves with efficiency gains." },
                  { question: "Will AI replace my team?", answer: "For most small businesses, AI supports teams by removing repetitive work and improving decision quality." },
                  { question: "How long until results are visible?", answer: "Many organizations see productivity improvements within weeks, with larger gains over 3-6 months." },
                ]}
                expandedIndex={0}
              />
            </ElementReveal>

            {/* Conclusion */}
            <ElementReveal frame={f} revealAt={R.CONCLUSION} skeletonType="text">
              <Conclusion content={{ text: "AI is becoming a core growth lever for modern small businesses. With clear goals, iterative rollout, and team alignment, AI tools can drive sustainable performance improvements and long-term competitiveness." }} />
            </ElementReveal>
          </div>
        </div>

        {/* Right sidebar — always visible */}
        <div style={{ width: 256, flexShrink: 0, overflowY: "auto" }}>
          <ActionsCard editMode={editMode} />
          <PostDetailsCard details={{
            elements: 16,
            created: "Feb 7, 2026",
            keyword: "AI tools for small businesses",
            slug: "/the-future-of-small-businesses-embracing-ai-tools-for-growth",
          }} />
          <PostInfoCard info={{
            seoTitle: "Embrace AI Tools for Growth: The Future of Small Businesses",
            metaDescription: "Discover how AI tools for small businesses can streamline operations, enhance customer experiences, and drive sustainable growth in today's digital landscape.",
          }} />
        </div>
      </div>

      <QuilloFab />
    </div>
  );
};
