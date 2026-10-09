# Dhruva — Technical Requirements Document (TRD)

## 1. System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Client (Browser)                   │
│  ┌─────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │Three.js │  │ Next.js  │  │ Leaflet.js + OSM     │ │
│  │Cinematic│→ │ React App│→ │ Interactive Maps      │ │
│  └─────────┘  └────┬─────┘  └──────────────────────┘ │
│                     │                                  │
│         ┌───────────┼───────────┐                      │
│         ▼           ▼           ▼                      │
│    Geolocation  LocalStorage  WebSocket                │
│       API       (offline)    (real-time)               │
└─────────┬───────────┬───────────┬──────────────────────┘
          │           │           │
          ▼           ▼           ▼
┌──────────────────────────────────────────────────────┐
│              FastAPI Backend (Python)                  │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────────┐ │
│  │OpenRouter│ │ Safety   │ │ OSM Overpass API      │ │
│  │  AI Chat │ │ Engine   │ │ Weather API           │ │
│  └──────────┘ └──────────┘ └───────────────────────┘ │
│                     │                                  │
│              ┌──────┴──────┐                          │
│              │   SQLite    │                          │
│              │  Database   │                          │
│              └─────────────┘                          │
└──────────────────────────────────────────────────────┘
```

## 2. API Endpoints

### 2.1 Chat & AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to Dhruva AI agent |
| GET | `/api/chat/history` | Retrieve chat history |

### 2.2 Places & Exploration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places?city={city}&lat={lat}&lng={lng}` | Get places near location |
| GET | `/api/places/{id}` | Get place details + safety score |
| GET | `/api/places/{id}/reviews` | Get reviews for a place |
| POST | `/api/places/{id}/reviews` | Submit a review (earns XP) |
| GET | `/api/places/compare?ids={id1,id2}` | Compare two places |

### 2.3 Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quests?city={city}` | Get available quests |
| POST | `/api/quests/{id}/complete` | Mark quest checkpoint complete |
| GET | `/api/leaderboard` | Get leaderboard |
| GET | `/api/profile` | Get user profile, XP, badges |

### 2.4 Data & Safety
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/safety?lat={lat}&lng={lng}` | Get safety score for location |
| GET | `/api/weather?city={city}` | Get weather alerts |
| GET | `/api/route?from={}&to={}` | Shortest path between points |

## 3. Safety Score Algorithm

```python
def calculate_safety_score(place_data):
    weights = {
        'crime_density': 0.25,      # w₁ - Inverse crime rate
        'lighting': 0.15,           # w₂ - Street lighting coverage
        'crowd_density': 0.15,      # w₃ - Foot traffic (time-aware)
        'user_reports': 0.20,       # w₄ - Community incident reports
        'emergency_proximity': 0.15,# w₅ - Nearest police/hospital
        'road_condition': 0.10      # w₆ - Road quality index
    }
    
    score = sum(weights[k] * normalize(place_data[k]) for k in weights)
    return round(score * 100)  # 0-100 scale
```

## 4. Data Sources

| Source | Data | API |
|--------|------|-----|
| OpenStreetMap | POIs, roads, buildings | Overpass API |
| OpenWeatherMap | Weather, alerts | REST API |
| OpenRouter | AI chat responses | REST API (free tier) |
| OSM Nominatim | Geocoding, reverse geocoding | REST API |
| YouTube Data API | Related videos | REST API v3 |
| Browser | GPS coordinates | Geolocation API |

## 5. Frontend Architecture

```
Frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.js             # Landing (mode selection)
│   │   ├── intro/page.js       # Three.js cinematic
│   │   ├── game/               # Game mode pages
│   │   │   ├── page.js         # Game dashboard
│   │   │   ├── quest/[id]/     # Individual quest
│   │   │   ├── map/            # Interactive map
│   │   │   └── leaderboard/    # Rankings
│   │   └── explore/            # Normal mode pages
│   │       ├── page.js         # Explore dashboard
│   │       ├── place/[id]/     # Place details
│   │       ├── chat/           # Dhruva AI chat
│   │       └── compare/        # Place comparison
│   ├── components/             # Reusable React components
│   ├── lib/                    # Utilities, API clients
│   ├── data/                   # Static demo data
│   └── styles/                 # CSS modules
```

## 6. Libraries & Dependencies

### Frontend
- `next` ^14 — React framework
- `react` ^18 — UI library
- `motion` — Animation library (motion.dev)
- `reactbits` — UI component toolkit
- `leaflet` + `react-leaflet` — Maps
- `three` — 3D WebGL (intro cinematic)
- `lucide-react` — Icons

### Backend
- `fastapi` — Web framework
- `uvicorn` — ASGI server
- `httpx` — Async HTTP client
- `python-dotenv` — Env management
- `sqlite3` — Database (stdlib)

## 7. Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 85 |
| API Response Time | < 500ms |
| Map Load Time | < 2s |
