"use client";
import Navbar from "../components/Navbar";
import GameMode from "../components/GameMode";
import FloatingChatbox from "../components/FloatingChatbox";

export default function GamePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#06080d" }}>
      <Navbar />
      <GameMode initialPhase="city-select" onBack={() => { window.location.href = "/"; }} />
      <FloatingChatbox />
    </div>
  );
}
