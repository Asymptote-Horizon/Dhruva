"use client";
import { useEffect, useRef } from "react";
import styles from "./MapView.module.css";

const CITY_CENTERS = {
  Pune: [18.5204, 73.8567],
  Mumbai: [19.076, 72.8777],
  Delhi: [28.6139, 77.209],
  Bangalore: [12.9716, 77.5946],
};

export default function MapView({ places, city, onSelectPlace }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    /* Only run in browser */
    if (typeof window === "undefined") return;

    const L = require("leaflet");

    /* Fix default marker icons in Next.js/webpack */
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const center = CITY_CENTERS[city] || CITY_CENTERS.Pune;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
      }).setView(center, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView(center, 13, { animate: true });
    }

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add place markers
    places.forEach((place) => {
      const safetyColor =
        place.safety_score >= 80
          ? "#10b981"
          : place.safety_score >= 65
            ? "#00f2fe"
            : "#f59e0b";

      const icon = L.divIcon({
        className: styles.customMarker,
        html: `<div style="background:${safetyColor};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px ${safetyColor}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;padding:4px">
            <b>${place.name}</b><br/>
            <span style="color:${safetyColor};font-weight:600">Safety: ${place.safety_score}</span> · ⭐ ${place.rating}<br/>
            <span style="font-size:11px;color:#666">${place.category} · ${place.best_time}</span>
          </div>`,
          { maxWidth: 240 }
        );

      marker.on("click", () => {
        if (onSelectPlace) onSelectPlace(place);
      });

      markersRef.current.push(marker);
    });

    return () => {};
  }, [places, city, onSelectPlace]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} className={styles.mapWrap} />;
}
