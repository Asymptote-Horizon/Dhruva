"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import FloatingChatbox from "../components/FloatingChatbox";
import { PLACES } from "../data/cityData";

const CITIES = ["Pune", "Mumbai", "Delhi", "Bangalore"];

export default function QuestsPage() {
  const [selectedCity, setSelectedCity] = useState("Pune");
  const [completedQuests, setCompletedQuests] = useState(new Set());
  const [totalXp, setTotalXp] = useState(450);

  const cityPlaces = PLACES[selectedCity] || PLACES.Pune;

  const quests = cityPlaces.map((p, idx) => ({
    id: `q-${p.id}`,
    title: idx % 2 === 0 ? `Historical Reconnaissance: ${p.name}` : `Scenic Sunset Odyssey: ${p.name}`,
    target: p.name,
    category: p.category,
    safetyScore: p.safety_score,
    xp: 100 + (idx * 25),
    objective: `Navigate to ${p.name} and explore its architectural and cultural perimeter.`,
    bestTime: p.best_time,
    perk: `+${p.safety_score} Sentinel Resilience Point`,
  }));

  const handleComplete = (id, xp) => {
    if (completedQuests.has(id)) return;
    setCompletedQuests(new Set([...completedQuests, id]));
    setTotalXp((prev) => prev + xp);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06080d", color: "#eef4ff" }}>
      <Navbar />
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
        <header style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: "700", letterSpacing: "0.04em", margin: "0 0 6px" }}>
                🎯 Active Quest Board
              </h1>
              <p style={{ color: "#8d98ab", fontSize: "15px", margin: 0 }}>
                Procedurally synthesized exploration missions for urban travelers.
              </p>
            </div>
            <div style={{ background: "rgba(188, 212, 255, 0.08)", border: "1px solid rgba(188, 212, 255, 0.2)", padding: "10px 20px", borderRadius: "12px", textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#8d98ab", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total XP Earned</div>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#00f2fe" }}>⭐ {totalXp} XP</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCity(c)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  border: c === selectedCity ? "1px solid #00f2fe" : "1px solid rgba(255, 255, 255, 0.12)",
                  background: c === selectedCity ? "rgba(0, 242, 254, 0.15)" : "rgba(255, 255, 255, 0.04)",
                  color: c === selectedCity ? "#00f2fe" : "#8d98ab",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {quests.map((q) => {
            const isDone = completedQuests.has(q.id);
            return (
              <div
                key={q.id}
                style={{
                  background: "rgba(14, 20, 32, 0.75)",
                  border: isDone ? "1px solid #10b981" : "1px solid rgba(188, 212, 255, 0.15)",
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.08)", color: "#00f2fe" }}>
                      {q.category}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#f59e0b" }}>
                      +{q.xp} XP
                    </span>
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: "600", margin: "0 0 8px" }}>{q.title}</h3>
                  <p style={{ fontSize: "13.5px", color: "#8d98ab", lineHeight: "1.5", margin: "0 0 14px" }}>
                    {q.objective}
                  </p>
                  <div style={{ fontSize: "12.5px", color: "#bcd4ff", marginBottom: "16px" }}>
                    🕒 Recommended Window: <strong>{q.bestTime}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleComplete(q.id, q.xp)}
                  disabled={isDone}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: isDone ? "#10b981" : "linear-gradient(135deg, #00f2fe, #4facfe)",
                    color: "#050811",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: isDone ? "default" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {isDone ? "✓ Quest Completed" : "Claim & Complete"}
                </button>
              </div>
            );
          })}
        </div>
      </main>
      <FloatingChatbox city={selectedCity} />
    </div>
  );
}
