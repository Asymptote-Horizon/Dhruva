"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { PLACES } from "../data/cityData";

const CITIES = ["Pune", "Mumbai", "Delhi", "Bangalore"];

export default function ChatPage() {
  const [city, setCity] = useState("Pune");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Greetings! I am Dhruva (ध्रुव) 🌟 — your autonomous cognitive guide named after the Pole Star. Ask me about micro-district safety, cultural landmarks, secret evening spots, or optimal routes across Indian cities.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, city }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      const cityPlaces = PLACES[city] || PLACES.Pune;
      const topSafe = [...cityPlaces].sort((a, b) => b.safety_score - a.safety_score)[0];
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `🌟 Dhruva Guide: For ${city}, our highest rated waypoint is ${topSafe.name} with a Safety Score of ${topSafe.safety_score}/100 and rating of ${topSafe.rating}★. Recommended visit window is ${topSafe.best_time}. Stay safe and explore fearlessly!`,
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06080d", color: "#eef4ff", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: "900px", width: "100%", margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px" }}>
              💬 Dhruva Autonomous AI Oracle
            </h1>
            <p style={{ color: "#8d98ab", fontSize: "14px", margin: 0 }}>
              Agentic conversational spatial reasoning and risk evaluation.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "16px",
                  border: c === city ? "1px solid #00f2fe" : "1px solid rgba(255, 255, 255, 0.12)",
                  background: c === city ? "rgba(0, 242, 254, 0.15)" : "transparent",
                  color: c === city ? "#00f2fe" : "#8d98ab",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </header>

        {/* Chat message stream */}
        <div
          style={{
            flex: 1,
            background: "rgba(12, 18, 30, 0.8)",
            border: "1px solid rgba(188, 212, 255, 0.15)",
            borderRadius: "16px",
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            minHeight: "420px",
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? "linear-gradient(135deg, #0284c7, #06b6d4)" : "rgba(22, 32, 54, 0.85)",
                color: "#eef4ff",
                border: m.role === "user" ? "none" : "1px solid rgba(188, 212, 255, 0.12)",
                padding: "12px 18px",
                borderRadius: "14px",
                maxWidth: "80%",
                lineHeight: "1.6",
                fontSize: "14.5px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", color: "#8d98ab", fontSize: "13.5px" }}>
              Dhruva is synthesizing spatial vectors...
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Quick prompt buttons */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "12px 0" }}>
          {[
            "🛡️ What are the safest places in this city?",
            "⚔️ Recommend an exploration quest!",
            "🍜 Top street food and culture spots?",
            "🌙 Is it safe to explore after 9 PM?",
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => handleSend(promptText)}
              style={{
                whiteSpace: "nowrap",
                padding: "7px 14px",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#bcd4ff",
                fontSize: "12.5px",
                cursor: "pointer",
              }}
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: "flex", gap: "10px" }}
        >
          <input
            style={{
              flex: 1,
              background: "rgba(18, 26, 44, 0.8)",
              border: "1px solid rgba(188, 212, 255, 0.2)",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#fff",
              fontSize: "14.5px",
              outline: "none",
            }}
            placeholder={`Ask Dhruva anything about ${city}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #00f2fe, #4facfe)",
              border: "none",
              borderRadius: "10px",
              padding: "0 24px",
              color: "#050811",
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Send ➔
          </button>
        </form>
      </main>
    </div>
  );
}
