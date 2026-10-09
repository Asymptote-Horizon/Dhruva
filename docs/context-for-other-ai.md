# Dhruva — Context for AI Continuation

## What is this project?
**Dhruva** is a gamified urban exploration platform. Two modes:
1. **Game Mode** — Quest-based city exploration with XP, levels, leaderboards, Three.js intro
2. **Normal Mode** — Clean Google Maps-like UI with AI chatbot, safety scores, place comparisons

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + React 18 + Motion.dev + ReactBits + Leaflet.js
- **Backend**: Python FastAPI
- **AI**: OpenRouter API (free tier) — key in `.env`
- **Maps**: OpenStreetMap + Leaflet
- **3D**: Three.js (intro cinematic only, already built)

## Folder Structure
```
Dhruva/
├── Frontend/          # Next.js app
│   ├── src/app/       # App Router pages
│   ├── src/components/# React components
│   ├── src/lib/       # Utils, API clients
│   └── src/data/      # Static demo data (places, quests)
├── backend/           # Python FastAPI
│   ├── main.py        # API server
│   ├── routers/       # Route modules
│   └── services/      # Business logic
├── data/              # Downloaded OSM data, datasets
├── docs/              # PRD, TRD, prompt history
└── .env               # API keys
```

## Current State
- Three.js intro: ✅ DONE (Frontend/dhruva-intro.html)
- Folder structure: ✅ DONE
- Next.js frontend: [check latest status]
- FastAPI backend: [check latest status]
- OpenRouter integration: [check latest status]

## Key Requirements
- Must work WITHOUT backend connection (fallback to local data)
- Never show "backend not connected" messages on UI
- Safety scores calculated mathematically (weighted formula)
- Real GPS with Pune as fallback
- Demo cities: Pune, Mumbai, Delhi, Bangalore
- Use Dijkstra's shortest path for nearby distances
- GitHub: https://github.com/Asymptote-Horizon/Dhruvaa
