"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";

/* ─── Dynamic imports for client-only 3D & map components ─── */
const Dhruva3DIntro = dynamic(() => import("./components/Dhruva3DIntro"), { ssr: false });
const GameMode = dynamic(() => import("./components/GameMode"), { ssr: false });
const NormalMode = dynamic(() => import("./components/NormalMode"), { ssr: false });
const FloatingChatbox = dynamic(() => import("./components/FloatingChatbox"), { ssr: false });

export default function Home() {
  const [mode, setMode] = useState(null); // null = 3D Intro Gate, 'game', 'normal'
  const [activeCity, setActiveCity] = useState("Pune");

  /* ─── 1. Initial 3D Cinematic Opening (dhruva-intro.html in Next.js) ─── */
  if (mode === null) {
    return (
      <Dhruva3DIntro
        onStartGame={() => setMode("game")}
        onStartNormal={() => setMode("normal")}
      />
    );
  }

  /* ─── 2. Game Mode (Ludic Odyssey) ─── */
  if (mode === "game") {
    return (
      <main role="main" aria-label="Dhruva Game Mode">
        <GameMode
          onBack={() => setMode(null)}
          onSwitchToNormal={() => setMode("normal")}
          initialPhase="city-select"
        />
        <FloatingChatbox city={activeCity} />
      </main>
    );
  }

  /* ─── 3. Normal Mode (Zenith Cartography) ─── */
  return (
    <main role="main" aria-label="Dhruva Zenith Cartography Mode">
      <NormalMode
        onBack={() => setMode(null)}
        onSwitchToGame={() => setMode("game")}
      />
      <FloatingChatbox city={activeCity} />
    </main>
  );
}
