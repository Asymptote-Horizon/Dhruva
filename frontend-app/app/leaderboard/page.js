"use client";
import Navbar from "../components/Navbar";
import FloatingChatbox from "../components/FloatingChatbox";
import { LEADERBOARD } from "../data/cityData";

export default function LeaderboardPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#06080d", color: "#eef4ff" }}>
      <Navbar />
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 20px" }}>
        <header style={{ marginBottom: "32px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🏆</div>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: "700", letterSpacing: "0.04em", margin: "0 0 8px" }}>
            Explorer Hall of Fame
          </h1>
          <p style={{ color: "#8d98ab", fontSize: "15px", margin: 0 }}>
            Top ranked urban pioneers charting uncharted city corridors.
          </p>
        </header>

        <div
          style={{
            background: "rgba(12, 18, 30, 0.8)",
            border: "1px solid rgba(188, 212, 255, 0.15)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 100px 100px",
              padding: "16px 20px",
              background: "rgba(18, 26, 44, 0.9)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: "12.5px",
              color: "#8d98ab",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <span>Rank</span>
            <span>Explorer</span>
            <span style={{ textAlign: "center" }}>City</span>
            <span style={{ textAlign: "right" }}>Total XP</span>
          </div>

          <div>
            {LEADERBOARD.map((item) => (
              <div
                key={item.rank}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 100px 100px",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                  background: item.rank === 1 ? "rgba(245, 158, 11, 0.06)" : "transparent",
                }}
              >
                <div style={{ fontWeight: "700", fontSize: "15px", color: item.rank === 1 ? "#f59e0b" : item.rank === 2 ? "#e2e8f0" : item.rank === 3 ? "#d97706" : "#8d98ab" }}>
                  #{item.rank}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>{item.avatar}</span>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "15px" }}>{item.name}</div>
                    <div style={{ fontSize: "12px", color: "#8d98ab" }}>Level {item.level} Master</div>
                  </div>
                </div>
                <div style={{ textAlign: "center", fontSize: "13px", color: "#bcd4ff" }}>
                  {item.city}
                </div>
                <div style={{ textAlign: "right", fontWeight: "700", color: "#00f2fe", fontSize: "15px" }}>
                  {item.xp.toLocaleString()} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <FloatingChatbox />
    </div>
  );
}
