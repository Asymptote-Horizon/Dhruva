"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

/* ─── Dynamic imports for mode pages ─── */
import GameMode from "./components/GameMode";
import NormalMode from "./components/NormalMode";

export default function Home() {
  const [mode, setMode] = useState(null); // null = landing, 'game', 'normal'
  const [fadeOut, setFadeOut] = useState(false);
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef(null);

  /* ─── Starfield Canvas ─── */
  useEffect(() => {
    if (mode !== null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate stars
    const STAR_COUNT = 280;
    starsRef.current = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      brightness: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    const draw = () => {
      ctx.fillStyle = "#06080d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Torch light effect near mouse
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && my > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
        grad.addColorStop(0, "rgba(188,212,255,0.06)");
        grad.addColorStop(0.5, "rgba(0,242,254,0.02)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      for (const s of starsRef.current) {
        s.brightness += s.twinkleSpeed;
        const alpha = 0.3 + Math.abs(Math.sin(s.brightness)) * 0.7;
        // distance to mouse
        const dx = s.x - mx;
        const dy = s.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const glow = dist < 200 ? 1.5 : 1;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(188,212,255,${alpha * glow * 0.8})`;
        ctx.fill();

        if (s.r > 1 && glow > 1) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,242,254,${alpha * 0.12})`;
          ctx.fill();
        }

        s.y -= s.speed;
        if (s.y < -5) {
          s.y = canvas.height + 5;
          s.x = Math.random() * canvas.width;
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(animRef.current);
    };
  }, [mode]);

  const selectMode = (m) => {
    setFadeOut(true);
    setTimeout(() => setMode(m), 600);
  };

  /* ─── Render selected mode ─── */
  if (mode === "game") return <GameMode onBack={() => setMode(null)} />;
  if (mode === "normal") return <NormalMode onBack={() => setMode(null)} />;

  /* ─── Landing / Mode Selector ─── */
  return (
    <main
      role="main"
      aria-label="Dhruva Urban Exploration Landing"
      className={`${styles.landing} ${fadeOut ? styles.fadeOut : ""}`}
    >
      <canvas
        ref={canvasRef}
        className={styles.starCanvas}
        role="img"
        aria-label="Interactive starry cosmos background animation"
      />

      {/* Pole Star SVG */}
      <div className={styles.poleStar} aria-hidden="true">
        <svg viewBox="0 0 100 100" fill="none" width="56" height="56" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="#bcd4ff"
            strokeOpacity=".45"
            strokeWidth="1.2"
          />
          <path
            d="M50 8 L57 43 L92 50 L57 57 L50 92 L43 57 L8 50 L43 43 Z"
            fill="#eef4ff"
          />
        </svg>
      </div>

      <div className={styles.heroContent}>
        <h1 className={styles.title}>DHRUVA</h1>
        <p className={styles.tagline}>
          <span className={styles.tagSpan}>From City Chaos to Confidence,</span>
          <span className={styles.tagSpan}>Anxiety to Adventure</span>
          <span className={styles.tagSpan}>
            & Doomed Dark to Light of "DHRUV".
          </span>
        </p>
        <p className={styles.subtitle}>
          Choose your journey through the urban frontier.
        </p>

        <nav className={styles.modeSelector} aria-label="Exploration Modalities">
          <button
            className={`${styles.modeBtn} ${styles.gameBtn}`}
            onClick={() => selectMode("game")}
            id="btn-game-mode"
            aria-label="Launch Ludic Odyssey Game Mode: Quests, XP, Leaderboards, 3D World"
          >
            <span className={styles.modeIcon} aria-hidden="true">⚔️</span>
            <span className={styles.modeLabel}>Ludic Odyssey</span>
            <span className={styles.modeDesc}>
              Quests • XP • Leaderboards • 3D World
            </span>
          </button>

          <button
            className={`${styles.modeBtn} ${styles.normalBtn}`}
            onClick={() => selectMode("normal")}
            id="btn-normal-mode"
            aria-label="Launch Zenith Cartography Normal Mode: Maps, AI Oracle, Safety Scores"
          >
            <span className={styles.modeIcon} aria-hidden="true">🧭</span>
            <span className={styles.modeLabel}>Zenith Cartography</span>
            <span className={styles.modeDesc}>
              Maps • AI Oracle • Safety Scores
            </span>
          </button>
        </nav>
      </div>

      <div className={styles.hint} aria-live="polite">Your cursor is the torch. Move it.</div>
    </main>
  );
}
