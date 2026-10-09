"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "./GameMode.module.css";

import { PLACES, LEADERBOARD, WEATHER } from "../data/cityData";

const API = process.env.NEXT_PUBLIC_API_URL || "";

const CITIES = ["Pune", "Mumbai", "Delhi", "Bangalore"];

export default function GameMode({ onBack, onSwitchToNormal, initialPhase = "city-select" }) {
  const [phase, setPhase] = useState(initialPhase); // intro, city-select, dashboard
  const [city, setCity] = useState("Pune");
  const [places, setPlaces] = useState(PLACES.Pune || []);
  const [leaderboard, setLeaderboard] = useState(LEADERBOARD);
  const [weather, setWeather] = useState(WEATHER.Pune);
  const [player, setPlayer] = useState({
    name: "Explorer",
    xp: 0,
    level: 1,
    questsCompleted: 0,
    badges: [],
    streak: 0,
  });
  const [activeQuest, setActiveQuest] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [checkedPlaces, setCheckedPlaces] = useState(new Set());
  const [animClass, setAnimClass] = useState("");

  /* ── Fetch city data ── */
  const fetchCityData = useCallback(async (c) => {
    try {
      const [placesRes, lbRes, weatherRes] = await Promise.all([
        fetch(`${API}/api/places?city=${c}`),
        fetch(`${API}/api/leaderboard`),
        fetch(`${API}/api/weather?city=${c}`),
      ]);
      const pData = await placesRes.json();
      const lbData = await lbRes.json();
      const wData = await weatherRes.json();
      setPlaces(pData.places && pData.places.length > 0 ? pData.places : (PLACES[c] || PLACES.Pune));
      setLeaderboard(lbData.leaderboard && lbData.leaderboard.length > 0 ? lbData.leaderboard : LEADERBOARD);
      setWeather(wData || WEATHER[c] || WEATHER.Pune);
    } catch {
      // use built-in fallback data for zero-latency & offline Vercel demo
      setPlaces(PLACES[c] || PLACES.Pune);
      setLeaderboard(LEADERBOARD);
      setWeather(WEATHER[c] || WEATHER.Pune);
    }
  }, []);

  useEffect(() => {
    if (phase === "dashboard") fetchCityData(city);
  }, [phase, city, fetchCityData]);

  /* ── Quest generation ── */
  const generateQuest = useCallback(() => {
    if (places.length === 0) return;
    const unchecked = places.filter((p) => !checkedPlaces.has(p.id));
    const pool = unchecked.length > 0 ? unchecked : places;
    const target = pool[Math.floor(Math.random() * pool.length)];
    const questTypes = [
      {
        title: `Discover ${target.name}`,
        desc: `Navigate to ${target.name} and explore its surroundings.`,
        xp: 100,
        type: "discover",
      },
      {
        title: `Photography Quest: ${target.name}`,
        desc: `Capture the beauty of ${target.name} at the perfect golden hour.`,
        xp: 150,
        type: "photo",
      },
      {
        title: `Safety Scout: ${target.name}`,
        desc: `Evaluate the safety conditions around ${target.name} and submit a report.`,
        xp: 200,
        type: "safety",
      },
      {
        title: `Cultural Deep Dive`,
        desc: `Learn 3 historical facts about ${target.name} and share your review.`,
        xp: 175,
        type: "cultural",
      },
    ];
    const q = questTypes[Math.floor(Math.random() * questTypes.length)];
    setActiveQuest({ ...q, place: target, completed: false });
  }, [places, checkedPlaces]);

  /* ── Complete Quest ── */
  const completeQuest = () => {
    if (!activeQuest) return;
    const xpGain = activeQuest.xp;
    setPlayer((prev) => {
      const newXp = prev.xp + xpGain;
      const newLevel = Math.floor(newXp / 300) + 1;
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        questsCompleted: prev.questsCompleted + 1,
        streak: prev.streak + 1,
        badges:
          prev.questsCompleted + 1 === 3 && !prev.badges.includes("🏅")
            ? [...prev.badges, "🏅"]
            : prev.questsCompleted + 1 === 5 && !prev.badges.includes("🎖️")
              ? [...prev.badges, "🎖️"]
              : prev.questsCompleted + 1 === 10 &&
                  !prev.badges.includes("🏆")
                ? [...prev.badges, "🏆"]
                : prev.badges,
      };
    });
    setCheckedPlaces((prev) => new Set([...prev, activeQuest.place.id]));
    setActiveQuest({ ...activeQuest, completed: true });
    setAnimClass("xpPop");
    setTimeout(() => setAnimClass(""), 800);
  };

  /* ── Check-in at a place (earn XP by reviewing) ── */
  const checkIn = (place) => {
    if (checkedPlaces.has(place.id)) return;
    setCheckedPlaces((prev) => new Set([...prev, place.id]));
    setPlayer((prev) => ({
      ...prev,
      xp: prev.xp + 50,
      level: Math.floor((prev.xp + 50) / 300) + 1,
    }));
    setAnimClass("xpPop");
    setTimeout(() => setAnimClass(""), 800);
  };

  /* ─── INTRO PHASE ─── */
  if (phase === "intro") {
    return (
      <div className={styles.introScreen}>
        <div className={styles.introContent}>
          <div className={styles.introStar}>
            <svg viewBox="0 0 100 100" fill="none" width="72" height="72">
              <circle cx="50" cy="50" r="44" stroke="#f59e0b" strokeOpacity=".5" strokeWidth="1.5" />
              <path d="M50 8 L57 43 L92 50 L57 57 L50 92 L43 57 L8 50 L43 43 Z" fill="#fef3c7" />
            </svg>
          </div>
          <h1 className={styles.introTitle}>⚔️ Ludic Odyssey</h1>
          <p className={styles.introDesc}>
            Embark on a quest-driven expedition through India's most iconic
            cities. Earn XP, unlock badges, climb the leaderboard, and discover
            hidden gems along the way.
          </p>
          <div className={styles.introFeatures}>
            <div className={styles.introFeature}>
              <span>🎯</span> Dynamic Quests
            </div>
            <div className={styles.introFeature}>
              <span>⭐</span> XP & Levels
            </div>
            <div className={styles.introFeature}>
              <span>🏆</span> Leaderboards
            </div>
            <div className={styles.introFeature}>
              <span>🏅</span> Badges
            </div>
          </div>
          <button
            className={styles.startBtn}
            onClick={() => setPhase("city-select")}
          >
            Begin Your Odyssey →
          </button>
          <button className={styles.backLink} onClick={onBack}>
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  /* ─── CITY SELECT PHASE ─── */
  if (phase === "city-select") {
    return (
      <div className={styles.citySelect}>
        <h2 className={styles.cityTitle}>Choose Your Battleground</h2>
        <p className={styles.citySubtitle}>
          Each city holds unique quests, landmarks, and challenges.
        </p>
        <div className={styles.cityGrid}>
          {CITIES.map((c) => (
            <button
              key={c}
              className={`${styles.cityCard} ${city === c ? styles.cityActive : ""}`}
              onClick={() => setCity(c)}
            >
              <span className={styles.cityEmoji}>
                {c === "Pune"
                  ? "🏰"
                  : c === "Mumbai"
                    ? "🌊"
                    : c === "Delhi"
                      ? "🕌"
                      : "🌿"}
              </span>
              <span className={styles.cityName}>{c}</span>
            </button>
          ))}
        </div>
        <button
          className={styles.startBtn}
          onClick={() => setPhase("dashboard")}
        >
          Enter {city} →
        </button>
        <button className={styles.backLink} onClick={() => setPhase("intro")}>
          ← Back
        </button>
      </div>
    );
  }

  /* ─── GAME DASHBOARD ─── */
  const xpToNext = 300 - (player.xp % 300);
  const xpProgress = ((player.xp % 300) / 300) * 100;

  return (
    <div className={styles.dashboard}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Menu
        </button>
        <div className={styles.citySelector}>
          {CITIES.map((c) => (
            <button
              key={c}
              className={`${styles.cityTab} ${c === city ? styles.cityTabActive : ""}`}
              onClick={() => setCity(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          className={styles.lbBtn}
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          🏆 Leaderboard
        </button>
      </header>

      <div className={styles.mainGrid}>
        {/* LEFT: Player + Quest */}
        <aside className={styles.sidebar}>
          {/* Player Card */}
          <div className={`${styles.playerCard} ${animClass ? styles[animClass] : ""}`}>
            <div className={styles.playerAvatar}>
              <span className={styles.levelBadge}>Lv.{player.level}</span>
              <div className={styles.avatarCircle}>🧭</div>
            </div>
            <h3 className={styles.playerName}>{player.name}</h3>
            <div className={styles.xpBar}>
              <div className={styles.xpFill} style={{ width: `${xpProgress}%` }} />
              <span className={styles.xpText}>
                {player.xp} XP • {xpToNext} to next level
              </span>
            </div>
            <div className={styles.playerStats}>
              <div className={styles.stat}>
                <span className={styles.statVal}>{player.questsCompleted}</span>
                <span className={styles.statLabel}>Quests</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>{player.streak}🔥</span>
                <span className={styles.statLabel}>Streak</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>
                  {checkedPlaces.size}/{places.length}
                </span>
                <span className={styles.statLabel}>Places</span>
              </div>
            </div>
            {player.badges.length > 0 && (
              <div className={styles.badges}>
                {player.badges.map((b, i) => (
                  <span key={i} className={styles.badgeItem}>
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Weather */}
          {weather && (
            <div className={styles.weatherCard}>
              <span className={styles.weatherIcon}>{weather.icon}</span>
              <div>
                <div className={styles.weatherTemp}>{weather.temp}°C</div>
                <div className={styles.weatherCond}>{weather.condition}</div>
              </div>
              {weather.alert && (
                <div className={styles.weatherAlert}>⚠️ {weather.alert}</div>
              )}
            </div>
          )}

          {/* Active Quest */}
          <div className={styles.questCard}>
            <h4 className={styles.questHeader}>🎯 Active Quest</h4>
            {activeQuest ? (
              <div className={styles.questBody}>
                <h5 className={styles.questTitle}>{activeQuest.title}</h5>
                <p className={styles.questDesc}>{activeQuest.desc}</p>
                <div className={styles.questReward}>+{activeQuest.xp} XP</div>
                {activeQuest.completed ? (
                  <div className={styles.questComplete}>
                    ✅ Completed!
                    <button className={styles.newQuestBtn} onClick={generateQuest}>
                      New Quest →
                    </button>
                  </div>
                ) : (
                  <button className={styles.completeBtn} onClick={completeQuest}>
                    Mark Complete
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.questEmpty}>
                <p>No active quest.</p>
                <button className={styles.newQuestBtn} onClick={generateQuest}>
                  Generate Quest →
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT: Places Grid */}
        <main className={styles.placesSection}>
          <h2 className={styles.sectionTitle}>
            📍 Explore {city}
            <span className={styles.placeCount}>{places.length} landmarks</span>
          </h2>
          <div className={styles.placesGrid}>
            {places.map((place, idx) => {
              const isChecked = checkedPlaces.has(place.id);
              return (
                <div
                  key={place.id}
                  className={`${styles.placeCard} ${isChecked ? styles.placeChecked : ""}`}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className={styles.placeImageWrap}>
                    <img
                      src={place.image}
                      alt={place.name}
                      className={styles.placeImage}
                      loading="lazy"
                    />
                    <div className={styles.safetyBadge}>
                      <span
                        className={
                          place.safety_score >= 80
                            ? styles.safetyA
                            : place.safety_score >= 65
                              ? styles.safetyB
                              : styles.safetyC
                        }
                      >
                        {place.safety_score}
                      </span>
                    </div>
                    {isChecked && (
                      <div className={styles.checkedOverlay}>✅ Visited</div>
                    )}
                  </div>
                  <div className={styles.placeInfo}>
                    <h4 className={styles.placeName}>{place.name}</h4>
                    <span className={styles.placeCat}>{place.category}</span>
                    <p className={styles.placeDesc}>
                      {place.description.slice(0, 90)}...
                    </p>
                    <div className={styles.placeMeta}>
                      <span>⭐ {place.rating}</span>
                      <span>🕐 {place.best_time}</span>
                    </div>
                    <div className={styles.placeActions}>
                      {!isChecked ? (
                        <button
                          className={styles.checkinBtn}
                          onClick={() => checkIn(place)}
                        >
                          📍 Check In (+50 XP)
                        </button>
                      ) : (
                        <span className={styles.visited}>Explored ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Leaderboard Overlay */}
      {showLeaderboard && (
        <div
          className={styles.lbOverlay}
          onClick={() => setShowLeaderboard(false)}
        >
          <div className={styles.lbPanel} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.lbTitle}>🏆 Global Leaderboard</h3>
            <table className={styles.lbTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Explorer</th>
                  <th>XP</th>
                  <th>Level</th>
                  <th>City</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.rank}>
                    <td>
                      {entry.rank <= 3
                        ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                        : entry.rank}
                    </td>
                    <td>
                      {entry.avatar} {entry.name}
                    </td>
                    <td className={styles.lbXp}>{entry.xp.toLocaleString()}</td>
                    <td>{entry.level}</td>
                    <td>{entry.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className={styles.lbClose}
              onClick={() => setShowLeaderboard(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
