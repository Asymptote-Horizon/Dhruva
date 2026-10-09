# Dhruva — Product Requirements Document (PRD)

## 1. Product Overview

**Dhruva** (ध्रुव — "The Pole Star") is a gamified urban exploration platform that transforms everyday city navigation into an engaging, score-driven adventure. It combines real-time geolocation, AI-powered recommendations, interactive maps, and community-driven safety analytics to help users discover, explore, and rate places in Indian cities.

## 2. Vision & Mission

- **Vision**: To be the guiding star for every urban explorer — making city discovery safe, fun, and social.
- **Mission**: Transform mundane city navigation into a rewarding game where exploring earns points, unlocks achievements, and builds community knowledge.

## 3. Target Users

| Persona | Description |
|---------|-------------|
| Urban Explorer | Young adults (18–35) who love discovering hidden gems in cities |
| Safety-Conscious Traveller | Solo travellers, women, tourists wanting data-backed safety scores |
| Social Planner | Groups of friends planning outings with collaborative journey features |
| Local Guide | Residents who earn reputation points by contributing reviews and tips |

## 4. Two-Mode Architecture

### 4.1 Game Mode
- Immersive Three.js cinematic introduction
- Quest-based exploration with XP, levels, and leaderboards
- Scavenger hunt-style challenges at real landmarks
- Multiplayer journey planning
- Achievement badges and streak rewards

### 4.2 Normal Mode
- Clean, Google Maps-like recommendation UI
- AI-powered Dhruva chatbot with agentic capabilities
- Place cards with safety scores, timings, and smart recommendations
- YouTube video integration for places
- Best vs. Worst location comparisons (AI analysis + raw user feedback)

## 5. Core Features

### 5.1 Geolocation & Maps
- Real-time GPS integration via Geolocation API
- OpenStreetMap data with Leaflet.js interactive maps
- Shortest-path algorithm (Dijkstra's) for nearby distance calculations
- Points of interest from OSM Overpass API

### 5.2 AI/ML & NLP
- Agentic Dhruva chatbot (OpenRouter API — free tier)
- Sentiment analysis on user reviews
- Smart recommendations based on time, weather, and crowd data
- Natural language place search

### 5.3 Safety Score System
- Mathematical composite score based on:
  - Crime data density (normalized)
  - Lighting infrastructure score
  - Crowd density patterns (time-based)
  - User-reported incidents
  - Emergency services proximity
  - Road condition metrics
- Formula: `S = w₁·Crime + w₂·Lighting + w₃·Crowd + w₄·Reports + w₅·Emergency + w₆·Road`

### 5.4 Real-time Data Integration
- Weather alerts (OpenWeatherMap API)
- Traffic updates
- Citizen reports (photos, voice notes, text)
- Social media data aggregation

### 5.5 Gamification Engine
- XP system with level progression
- Daily/weekly quests
- Achievement badges
- Friend leaderboards
- Review-for-points economy
- Streak bonuses

## 6. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, ReactBits, Motion.dev |
| 3D Intro | Three.js (WebGL cinematic) |
| Maps | Leaflet.js + OpenStreetMap |
| Backend | Python FastAPI |
| AI/NLP | OpenRouter API (free models) |
| Geolocation | Browser Geolocation API + OSM Nominatim |
| Weather | OpenWeatherMap API |
| Database | SQLite (demo) / PostgreSQL (prod) |
| Deployment | Vercel (frontend) + Railway (backend) |

## 7. Demo Cities

| City | Status | # Places |
|------|--------|----------|
| Pune | Primary (fallback) | 25+ |
| Mumbai | Secondary | 20+ |
| Delhi | Secondary | 20+ |
| Bangalore | Secondary | 15+ |

## 8. Success Metrics

- Demo runs end-to-end without backend dependency
- AI chat responds with real OpenRouter API
- GPS detection works → falls back to Pune
- Game mode score/XP system fully functional
- Safety scores displayed on place cards
- Leaderboard shows demo players

## 9. Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Structure & Config | 5 min | Full folder structure, PRD, TRD, .env |
| Frontend Shell | 10 min | Next.js app with routing, both modes |
| Game Mode UI | 8 min | Quest cards, map, XP system, leaderboard |
| Normal Mode UI | 5 min | Place cards, chat, comparisons |
| Backend API | 5 min | FastAPI with OpenRouter, safety calc |
| Polish | 2 min | Animations, final demo check |
