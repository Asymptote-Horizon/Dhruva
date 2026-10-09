"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./FloatingChatbox.module.css";
import { PLACES } from "../data/cityData";

export default function FloatingChatbox({ city = "Pune" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Greetings, Explorer! I'm Dhruva (ध्रुव) 🌟 — your AI urban guide. Need real-time safety scores, secret city quests, or safe transit routes?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, city }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "I am with you. What would you like to explore?" },
      ]);
    } catch {
      // Offline fallback from local data
      const cityPlaces = PLACES[city] || PLACES.Pune;
      const topSafe = [...cityPlaces].sort((a, b) => b.safety_score - a.safety_score)[0];
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `🌟 Dhruva Sentinel: For ${city}, ${topSafe.name} has our highest security clearance (${topSafe.safety_score}/100). Ideal time: ${topSafe.best_time}. How else can I guide your path?`,
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className={styles.chatFloatContainer}>
      {!isOpen && (
        <button
          className={styles.chatToggleBtn}
          onClick={() => setIsOpen(true)}
          aria-label="Open Dhruva AI Oracle Chat"
        >
          <span className={styles.pulseDot} aria-hidden="true" />
          <span>✨ Call Dhruva</span>
        </button>
      )}

      {isOpen && (
        <div className={styles.chatWindow} role="dialog" aria-label="Dhruva AI Companion Chat">
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderTitle}>
              <span>🌟 Dhruva Oracle</span>
              <span className={styles.agentBadge}>Active ({city})</span>
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat window"
            >
              ✕
            </button>
          </div>

          <div className={styles.chatBody} ref={bodyRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.message} ${m.role === "user" ? styles.msgUser : styles.msgBot}`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className={`${styles.message} ${styles.msgBot}`}>
                Dhruva is consulting spatial telemetry...
              </div>
            )}
          </div>

          <div className={styles.quickPrompts}>
            <button
              className={styles.promptChip}
              onClick={() => sendMessage("Is it safe to explore tonight?")}
            >
              🛡️ Night Safety?
            </button>
            <button
              className={styles.promptChip}
              onClick={() => sendMessage("Give me an active exploration quest!")}
            >
              ⚔️ Give Quest
            </button>
            <button
              className={styles.promptChip}
              onClick={() => sendMessage("Top cultural landmark to see?")}
            >
              🏛️ Top Landmark
            </button>
          </div>

          <form
            className={styles.chatInputArea}
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              className={styles.chatInput}
              placeholder="Ask Dhruva anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Chat input"
            />
            <button type="submit" className={styles.sendBtn} aria-label="Send message">
              ➔
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
