import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type QuizOption = { text: string; correct?: boolean };
export type QuizQuestion = { question: string; options: QuizOption[] };
export type QuizContent = { title?: string; questions: QuizQuestion[] };

export const Quiz: React.FC<{ content: QuizContent }> = ({ content }) => (
  <section style={{ marginBottom: 20 }}>
    <div style={{ borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.card, overflow: "hidden" }}>
      <div style={{ background: COLORS.primary, padding: "14px 24px" }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#FFFFFF", margin: 0, fontFamily: F }}>{content.title ?? "Quick Quiz"}</p>
      </div>
      <div style={{ padding: 24 }}>
        {content.questions.map((q, qi) => (
          <div key={qi} style={{ marginBottom: qi < content.questions.length - 1 ? 20 : 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.foreground, margin: "0 0 10px", fontFamily: F }}>
              {qi + 1}. {q.question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {q.options.map((opt, oi) => (
                <div key={oi} style={{
                  padding: "8px 14px", borderRadius: 6,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.card,
                  fontSize: 13, color: COLORS.foreground, fontFamily: F,
                }}>
                  {String.fromCharCode(65 + oi)}. {opt.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
