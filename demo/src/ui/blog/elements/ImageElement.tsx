import React from "react";

const F = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif";

export const ImageElement: React.FC<{ alt?: string }> = ({ alt = "Blog cover image" }) => (
  <div style={{ margin: "24px 0 32px", width: "100%", borderRadius: 8, overflow: "hidden", position: "relative" }}>
    {/* Gradient placeholder simulating a tech/laptop scene */}
    <div style={{
      width: "100%", height: 340,
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
    }}>
      {/* Laptop body */}
      <div style={{
        width: 280, height: 180, borderRadius: 8,
        background: "linear-gradient(180deg, #2a2a4a 0%, #1e1e3a 100%)",
        border: "2px solid rgba(255,255,255,0.1)",
        display: "flex", flexDirection: "column", padding: 12, gap: 6,
      }}>
        {/* Screen lines simulating code */}
        {[0.7, 0.5, 0.85, 0.4, 0.65, 0.55, 0.75, 0.3].map((w, i) => (
          <div key={i} style={{
            height: 6, borderRadius: 3, width: `${w * 100}%`,
            background: i % 3 === 0 ? "rgba(0,120,212,0.5)" : i % 3 === 1 ? "rgba(16,124,16,0.4)" : "rgba(255,255,255,0.15)",
          }} />
        ))}
      </div>
      {/* Laptop base */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, 90px)",
        width: 320, height: 12, borderRadius: "0 0 8px 8px",
        background: "linear-gradient(180deg, #3a3a5a 0%, #2a2a4a 100%)",
      }} />
      {/* Decorative glow */}
      <div style={{
        position: "absolute", width: 200, height: 200, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,120,212,0.15) 0%, transparent 70%)",
        top: "30%", left: "50%", transform: "translate(-50%, -50%)",
      }} />
    </div>
  </div>
);
