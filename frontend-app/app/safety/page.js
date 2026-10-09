"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import FloatingChatbox from "../components/FloatingChatbox";
import { PLACES } from "../data/cityData";

const CITIES = ["Pune", "Mumbai", "Delhi", "Bangalore"];

export default function SafetyPage() {
  const [city, setCity] = useState("Pune");
  const places = PLACES[city] || PLACES.Pune;

  return (
    <div style={{ minHeight: "100vh", background: "#06080d", color: "#eef4ff" }}>
      <Navbar />
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: "700", letterSpacing: "0.04em", margin: "0 0 8px" }}>
            🛡️ Safety Telemetry & Vector Synthesis
          </h1>
          <p style={{ color: "#8d98ab", fontSize: "15px", maxWidth: "650px", lineHeight: "1.6", margin: "0 0 20px" }}>
            Deterministic quantification replacing subjective hearsay with structured multi-variate risk scoring.
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  border: c === city ? "1px solid #00f2fe" : "1px solid rgba(255, 255, 255, 0.12)",
                  background: c === city ? "rgba(0, 242, 254, 0.15)" : "rgba(255, 255, 255, 0.04)",
                  color: c === city ? "#00f2fe" : "#8d98ab",
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

        {/* Mathematical Model Banner */}
        <section
          style={{
            background: "rgba(14, 22, 38, 0.8)",
            border: "1px solid rgba(188, 212, 255, 0.2)",
            borderRadius: "14px",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#00f2fe", margin: "0 0 10px" }}>
            🧮 Mathematical Formulation Engine
          </h2>
          <code style={{ display: "block", background: "rgba(0, 0, 0, 0.5)", padding: "12px", borderRadius: "8px", fontSize: "14px", color: "#bcd4ff", overflowX: "auto" }}>
            S = 0.25·Crime + 0.15·Lighting + 0.15·Crowd(t) + 0.20·Telemetry + 0.15·Emergency + 0.10·Transit
          </code>
        </section>

        {/* POI Safety Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {places.map((p) => {
            const factors = p.safety_factors || {};
            const grade = p.safety_score >= 80 ? "A" : p.safety_score >= 65 ? "B" : "C";
            const gradeColor = p.safety_score >= 80 ? "#10b981" : p.safety_score >= 65 ? "#00f2fe" : "#f59e0b";

            return (
              <div
                key={p.id}
                style={{
                  background: "rgba(12, 18, 30, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "17px", fontWeight: "600", margin: 0 }}>{p.name}</h3>
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.4)",
                      border: `1px solid ${gradeColor}`,
                      color: gradeColor,
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    Grade {grade} ({p.safety_score})
                  </div>
                </div>

                <div style={{ fontSize: "13px", color: "#8d98ab", marginBottom: "16px" }}>
                  Best Visited: <span style={{ color: "#eef4ff" }}>{p.best_time}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {Object.entries(factors).map(([fKey, fVal]) => (
                    <div key={fKey} style={{ fontSize: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                        <span style={{ color: "#8d98ab" }}>
                          {fKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                        <span style={{ color: "#00f2fe", fontWeight: "600" }}>{Math.round(fVal * 100)}%</span>
                      </div>
                      <div style={{ width: "100%", height: "4px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${fVal * 100}%`, height: "100%", background: gradeColor }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <FloatingChatbox city={city} />
    </div>
  );
}
