"use client";
import Navbar from "../components/Navbar";
import NormalMode from "../components/NormalMode";
import FloatingChatbox from "../components/FloatingChatbox";

export default function ExplorePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#06080d" }}>
      <Navbar />
      <NormalMode
        onBack={() => { window.location.href = "/"; }}
        onSwitchToGame={() => { window.location.href = "/game"; }}
      />
      <FloatingChatbox />
    </div>
  );
}
