"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/game", label: "⚔️ Odyssey", key: "game" },
    { href: "/explore", label: "🧭 Explore Map", key: "explore" },
    { href: "/quests", label: "🎯 Quests", key: "quests" },
    { href: "/safety", label: "🛡️ Safety Telemetry", key: "safety" },
    { href: "/leaderboard", label: "🏆 Leaderboard", key: "leaderboard" },
    { href: "/chat", label: "💬 AI Oracle", key: "chat" },
  ];

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main Navigation">
      <Link href="/" className={styles.brand}>
        <span className={styles.brandIcon} aria-hidden="true">🌟</span>
        <span className={styles.brandText}>DHRUVA</span>
      </Link>

      <div className={`${styles.navLinks} ${mobileOpen ? styles.navLinksOpen : ""}`}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.key}
              href={link.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
        <Link href="/" className={styles.ctaBtn} onClick={() => setMobileOpen(false)}>
          🪐 3D Intro
        </Link>
      </div>

      <button
        className={styles.mobileMenuBtn}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>
    </nav>
  );
}
