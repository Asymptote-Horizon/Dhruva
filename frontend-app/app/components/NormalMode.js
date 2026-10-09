"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import styles from "./NormalMode.module.css";

import { PLACES, WEATHER } from "../data/cityData";

const API = process.env.NEXT_PUBLIC_API_URL || "";
const CITIES = ["Pune", "Mumbai", "Delhi", "Bangalore"];

/* Dynamic import for Map (no SSR for Leaflet) */
const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function NormalMode({ onBack }) {
  const [city, setCity] = useState("Pune");
  const [places, setPlaces] = useState(PLACES.Pune || []);
  const [weather, setWeather] = useState(WEATHER.Pune);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [tab, setTab] = useState("explore"); // explore, chat, compare
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey there! I'm Dhruva 🌟 — your AI exploration companion. Ask me anything about places, safety, routes, or local tips in any of our cities!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const chatEndRef = useRef(null);

  /* ── Fetch Data ── */
  const fetchData = useCallback(async (c) => {
    try {
      const [pRes, wRes] = await Promise.all([
        fetch(`${API}/api/places?city=${c}`),
        fetch(`${API}/api/weather?city=${c}`),
      ]);
      const pData = await pRes.json();
      const wData = await wRes.json();
      setPlaces(pData.places && pData.places.length > 0 ? pData.places : (PLACES[c] || PLACES.Pune));
      setWeather(wData || WEATHER[c] || WEATHER.Pune);
    } catch {
      setPlaces(PLACES[c] || PLACES.Pune);
      setWeather(WEATHER[c] || WEATHER.Pune);
    }
  }, []);

  useEffect(() => {
    fetchData(city);
  }, [city, fetchData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* ── Chat with Dhruva AI ── */
  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, city }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      // Intelligent localized response based on city knowledge
      const cityPlaces = PLACES[city] || PLACES.Pune;
      const topSafe = [...cityPlaces].sort((a, b) => b.safety_score - a.safety_score)[0];
      const reply = `🌟 Dhruva Guide here for ${city}: Top recommended highlight is ${topSafe.name} (Safety Score: ${topSafe.safety_score}/100, Rating: ${topSafe.rating}★). Best time to visit: ${topSafe.best_time}. Local tip: Great crowd management and transit connectivity!`;
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    }
    setChatLoading(false);
  };

  /* ── Filtering ── */
  const categories = [
    "All",
    ...new Set(places.map((p) => p.category)),
  ];
  const filteredPlaces = places.filter((p) => {
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  /* ── Safety grade helper ── */
  const safetyGrade = (score) =>
    score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";
  const safetyClass = (score) =>
    score >= 80
      ? styles.safetyA
      : score >= 65
        ? styles.safetyB
        : score >= 50
          ? styles.safetyC
          : styles.safetyD;

  return (
    <div className={styles.normalMode}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <button className={styles.backBtn} onClick={onBack}>
            ← Menu
          </button>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>🧭</span>
            <span className={styles.brandName}>Dhruva</span>
          </div>
        </div>

        {/* City Selector */}
        <div className={styles.cityRow}>
          {CITIES.map((c) => (
            <button
              key={c}
              className={`${styles.cityChip} ${c === city ? styles.cityChipActive : ""}`}
              onClick={() => {
                setCity(c);
                setSelectedPlace(null);
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Weather Mini */}
        {weather && (
          <div className={styles.weatherMini}>
            <span>{weather.icon}</span>
            <span>{weather.temp}°C</span>
            <span className={styles.weatherCondText}>{weather.condition}</span>
            {weather.alert && <span className={styles.alertDot}>⚠️</span>}
          </div>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${tab === "explore" ? styles.tabActive : ""}`}
            onClick={() => setTab("explore")}
          >
            📍 Explore
          </button>
          <button
            className={`${styles.tabBtn} ${tab === "chat" ? styles.tabActive : ""}`}
            onClick={() => setTab("chat")}
          >
            💬 Dhruva AI
          </button>
          <button
            className={`${styles.tabBtn} ${tab === "compare" ? styles.tabActive : ""}`}
            onClick={() => setTab("compare")}
          >
            ⚖️ Compare
          </button>
        </div>

        {/* ── Explore Tab ── */}
        {tab === "explore" && (
          <div className={styles.exploreTab} role="region" aria-label="Explore places">
            <input
              className={styles.searchInput}
              placeholder="Search places..."
              aria-label="Search places by name or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={styles.catRow} role="toolbar" aria-label="Filter categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.catChip} ${cat === categoryFilter ? styles.catChipActive : ""}`}
                  aria-pressed={cat === categoryFilter}
                  aria-label={`Filter by ${cat}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className={styles.placeList} role="list" aria-label="Places list">
              {filteredPlaces.map((place) => (
                <div
                  key={place.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${place.name}, safety score ${place.safety_score} out of 100`}
                  className={`${styles.placeItem} ${selectedPlace?.id === place.id ? styles.placeItemActive : ""}`}
                  onClick={() => setSelectedPlace(place)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPlace(place);
                    }
                  }}
                >
                  <img
                    src={place.image}
                    alt={`Scenic photograph of ${place.name}`}
                    className={styles.placeThumb}
                    loading="lazy"
                  />
                  <div className={styles.placeItemInfo}>
                    <h4 className={styles.placeItemName}>{place.name}</h4>
                    <div className={styles.placeItemMeta}>
                      <span className={safetyClass(place.safety_score)}>
                        {safetyGrade(place.safety_score)} ({place.safety_score})
                      </span>
                      <span>⭐ {place.rating}</span>
                    </div>
                    <span className={styles.placeItemCat}>{place.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Chat Tab ── */}
        {tab === "chat" && (
          <div className={styles.chatTab} role="region" aria-label="Dhruva AI Chat">
            <div className={styles.chatHeader}>
              <span className={styles.chatAgentDot} aria-hidden="true" />
              <span>Dhruva AI Oracle</span>
              <span className={styles.chatAgentTag}>Agentic</span>
            </div>
            <div className={styles.chatMessages} role="log" aria-live="polite">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.chatMsg} ${msg.role === "user" ? styles.chatUser : styles.chatBot}`}
                >
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div className={`${styles.chatMsg} ${styles.chatBot}`} aria-label="Dhruva is typing">
                  <span className={styles.typingDots} aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className={styles.chatInputRow}>
              <input
                className={styles.chatInputField}
                placeholder="Ask Dhruva anything..."
                aria-label="Type your message to Dhruva AI"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
              />
              <button
                className={styles.chatSendBtn}
                onClick={sendChat}
                aria-label="Send message to Dhruva AI"
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* ── Compare Tab ── */}
        {tab === "compare" && (
          <div className={styles.compareTab} role="region" aria-label="Compare places">
            <p className={styles.compareInfo}>
              Select two places to compare side-by-side.
            </p>
            <div className={styles.compareSelects}>
              <select
                className={styles.compareSelect}
                aria-label="Select first place to compare"
                value={compareA?.id || ""}
                onChange={(e) =>
                  setCompareA(places.find((p) => p.id === e.target.value) || null)
                }
              >
                <option value="">Place A</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <span className={styles.vsText} aria-hidden="true">VS</span>
              <select
                className={styles.compareSelect}
                aria-label="Select second place to compare"
                value={compareB?.id || ""}
                onChange={(e) =>
                  setCompareB(places.find((p) => p.id === e.target.value) || null)
                }
              >
                <option value="">Place B</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {compareA && compareB && (
              <div className={styles.compareGrid}>
                <CompareRow label="Safety" a={compareA.safety_score} b={compareB.safety_score} suffix="/100" />
                <CompareRow label="Rating" a={compareA.rating} b={compareB.rating} suffix="/5" />
                <CompareRow label="Reviews" a={compareA.reviews_count} b={compareB.reviews_count} />
                <CompareRow label="Category" a={compareA.category} b={compareB.category} isText />
                <CompareRow label="Best Time" a={compareA.best_time} b={compareB.best_time} isText />
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ── Main Map + Detail ── */}
      <main className={styles.mainArea}>
        {selectedPlace ? (
          <div className={styles.placeDetail}>
            <button
              className={styles.closeDetail}
              onClick={() => setSelectedPlace(null)}
            >
              ✕
            </button>
            <div className={styles.detailImageWrap}>
              <img
                src={selectedPlace.image}
                alt={selectedPlace.name}
                className={styles.detailImage}
              />
              <div className={styles.detailSafetyBig}>
                <span className={safetyClass(selectedPlace.safety_score)}>
                  {selectedPlace.safety_score}
                </span>
                <span className={styles.detailSafetyLabel}>Safety Score</span>
              </div>
            </div>
            <div className={styles.detailBody}>
              <h2 className={styles.detailName}>{selectedPlace.name}</h2>
              <div className={styles.detailTags}>
                <span className={styles.detailCat}>{selectedPlace.category}</span>
                <span className={styles.detailRating}>⭐ {selectedPlace.rating}</span>
                <span className={styles.detailReviews}>{selectedPlace.reviews_count} reviews</span>
              </div>
              <p className={styles.detailDesc}>{selectedPlace.description}</p>

              <div className={styles.detailMeta}>
                <div className={styles.detailMetaItem}>
                  <span className={styles.metaLabel}>🕐 Best Time</span>
                  <span className={styles.metaValue}>{selectedPlace.best_time}</span>
                </div>
                <div className={styles.detailMetaItem}>
                  <span className={styles.metaLabel}>📍 Coordinates</span>
                  <span className={styles.metaValue}>
                    {selectedPlace.lat.toFixed(4)}, {selectedPlace.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {selectedPlace.tags && (
                <div className={styles.tagRow}>
                  {selectedPlace.tags.map((t) => (
                    <span key={t} className={styles.tag}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Safety Factors */}
              {selectedPlace.safety_factors && (
                <div className={styles.safetyFactors}>
                  <h4 className={styles.sfTitle}>Safety Factor Breakdown</h4>
                  {Object.entries(selectedPlace.safety_factors).map(([key, val]) => (
                    <div key={key} className={styles.sfRow}>
                      <span className={styles.sfLabel}>
                        {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <div className={styles.sfBar}>
                        <div
                          className={styles.sfFill}
                          style={{
                            width: `${val * 100}%`,
                            background:
                              val >= 0.8
                                ? "var(--emerald)"
                                : val >= 0.6
                                  ? "var(--cyan)"
                                  : "var(--gold)",
                          }}
                        />
                      </div>
                      <span className={styles.sfVal}>{(val * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* YouTube Embed */}
              {selectedPlace.youtube_id && (
                <div className={styles.youtubeWrap}>
                  <h4 className={styles.sfTitle}>📺 Video Tour</h4>
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedPlace.youtube_id}`}
                    title={selectedPlace.name}
                    className={styles.youtubeFrame}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.mapContainer}>
            <MapView
              places={filteredPlaces}
              city={city}
              onSelectPlace={setSelectedPlace}
            />
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Compare Row Sub-Component ── */
function CompareRow({ label, a, b, suffix = "", isText = false }) {
  const aWins = !isText && a > b;
  const bWins = !isText && b > a;
  return (
    <div className={styles.cmpRow}>
      <span className={styles.cmpLabel}>{label}</span>
      <span className={`${styles.cmpVal} ${aWins ? styles.cmpWin : ""}`}>
        {a}{suffix}
      </span>
      <span className={`${styles.cmpVal} ${bWins ? styles.cmpWin : ""}`}>
        {b}{suffix}
      </span>
    </div>
  );
}
