import React from "react";
import { COLORS } from "../../../constants";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export type StatisticContent = {
  title: string;
  percentage: number;
  description: string;
};

export const Statistic: React.FC<{ content: StatisticContent }> = ({ content }) => {
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference * (1 - content.percentage / 100);

  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{
        borderRadius: 8, background: "#F5F5F5", padding: 30,
      }}>
        <h3 style={{
          fontSize: 24, fontWeight: 600, textAlign: "center", margin: "0 0 16px",
          color: COLORS.foreground, fontFamily: F,
        }}>
          {content.title}
        </h3>

        <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
          <svg width={200} height={200} viewBox="0 0 100 100">
            <circle cx={50} cy={50} r={45} fill="none" stroke="#e6e6e6" strokeWidth={8} />
            <circle
              cx={50} cy={50} r={45} fill="none"
              stroke="#00008B" strokeWidth={8}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            <text x={50} y={50} textAnchor="middle" dominantBaseline="central"
              fontSize={20} fontWeight="bold" fill="black"
            >
              {content.percentage}%
            </text>
          </svg>
        </div>

        <p style={{
          fontSize: 18, fontWeight: 300, lineHeight: 1.778, textAlign: "center",
          color: COLORS.foreground, fontFamily: F, margin: "16px 0 0",
        }}>
          {content.description}
        </p>
      </div>
    </section>
  );
};
