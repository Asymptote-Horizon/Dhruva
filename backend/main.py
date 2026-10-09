"""
Dhruva Backend — FastAPI Server
Gamified Urban Exploration Platform
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os
import json
import math
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(
    title="Dhruva API",
    description="Backend for Dhruva — Gamified Urban Exploration Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ────────────────────────────────────────────
class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None
    city: Optional[str] = "Pune"

class ReviewSubmission(BaseModel):
    place_id: str
    rating: int
    text: str
    user_name: Optional[str] = "Explorer"

class RouteRequest(BaseModel):
    from_lat: float
    from_lng: float
    to_lat: float
    to_lng: float

# ─── Dhruva AI System Prompt ──────────────────────────
DHRUVA_SYSTEM_PROMPT = """You are Dhruva (ध्रुव), an AI-powered urban exploration companion named after the Pole Star — the unwavering guide in the night sky.

Your capabilities:
- Recommend places to visit based on user preferences, time of day, and safety
- Calculate and explain safety scores for locations
- Plan optimal routes between multiple destinations
- Provide weather-aware suggestions
- Share local tips, historical context, and cultural significance
- Help plan group outings and adventures
- Analyze reviews and provide sentiment-based summaries

Personality: Friendly, knowledgeable, safety-conscious, adventurous. You speak like a well-traveled local friend who genuinely cares about the user's experience.

Cities you know well: Pune, Mumbai, Delhi, Bangalore (India)

When recommending places, always mention:
1. Safety score (out of 100)
2. Best time to visit
3. One interesting fact or local tip

Keep responses concise but informative. Use emojis sparingly for warmth."""

# ─── Chat Endpoint ────────────────────────────────────
@app.post("/api/chat")
async def chat(msg: ChatMessage):
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        return {"response": "I'm Dhruva, your exploration guide! I'm currently in offline mode, but I can still help you explore. What city are you interested in?", "source": "fallback"}
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://dhruva.app",
                    "X-Title": "Dhruva Explorer"
                },
                json={
                    "model": os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free"),
                    "messages": [
                        {"role": "system", "content": DHRUVA_SYSTEM_PROMPT},
                        {"role": "user", "content": f"[City context: {msg.city}] {msg.message}"}
                    ],
                    "max_tokens": 500,
                    "temperature": 0.7
                }
            )
            data = response.json()
            if "choices" in data and len(data["choices"]) > 0:
                return {"response": data["choices"][0]["message"]["content"], "source": "openrouter"}
            else:
                return {"response": "Let me think about that... Could you rephrase your question?", "source": "fallback"}
    except Exception as e:
        return {"response": f"I'm having trouble connecting right now. Try asking me about places in {msg.city}!", "source": "fallback", "error": str(e)}

# ─── Safety Score Engine ──────────────────────────────
def calculate_safety_score(place_data: dict) -> int:
    """
    Composite safety score based on weighted factors.
    S = w₁·Crime + w₂·Lighting + w₃·Crowd + w₄·Reports + w₅·Emergency + w₆·Road
    All factors normalized to 0-1 scale, output is 0-100.
    """
    weights = {
        'crime_inverse': 0.25,
        'lighting': 0.15,
        'crowd_safety': 0.15,
        'user_reports': 0.20,
        'emergency_proximity': 0.15,
        'road_condition': 0.10
    }
    
    defaults = {
        'crime_inverse': 0.7,
        'lighting': 0.6,
        'crowd_safety': 0.65,
        'user_reports': 0.75,
        'emergency_proximity': 0.5,
        'road_condition': 0.6
    }
    
    score = 0
    for factor, weight in weights.items():
        value = place_data.get(factor, defaults.get(factor, 0.5))
        score += weight * min(max(value, 0), 1)
    
    return round(score * 100)

@app.get("/api/safety")
async def get_safety(lat: float, lng: float):
    """Get safety score for a GPS coordinate"""
    # Simulate safety based on known areas
    base_score = {
        'crime_inverse': 0.6 + (hash(f"{lat:.3f}{lng:.3f}") % 30) / 100,
        'lighting': 0.5 + (hash(f"{lng:.3f}") % 40) / 100,
        'crowd_safety': 0.55 + (hash(f"{lat:.3f}") % 35) / 100,
        'user_reports': 0.7 + (hash(f"{lat:.2f}{lng:.2f}") % 20) / 100,
        'emergency_proximity': 0.4 + (hash(f"{lat:.4f}") % 50) / 100,
        'road_condition': 0.5 + (hash(f"{lng:.4f}") % 40) / 100
    }
    
    score = calculate_safety_score(base_score)
    return {
        "score": score,
        "grade": "A" if score >= 80 else "B" if score >= 65 else "C" if score >= 50 else "D",
        "factors": base_score,
        "lat": lat,
        "lng": lng
    }

# ─── Shortest Path (Dijkstra's) ──────────────────────
def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance between two GPS points in km"""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

@app.post("/api/route")
async def get_route(req: RouteRequest):
    """Calculate route between two points"""
    distance = haversine(req.from_lat, req.from_lng, req.to_lat, req.to_lng)
    # Estimate time: 30 km/h average city speed
    time_mins = round((distance / 30) * 60)
    return {
        "distance_km": round(distance, 2),
        "estimated_time_mins": max(time_mins, 1),
        "mode": "driving",
        "algorithm": "haversine_direct"
    }

# ─── Places Endpoint ─────────────────────────────────
@app.get("/api/places")
async def get_places(city: str = "Pune", lat: Optional[float] = None, lng: Optional[float] = None):
    """Get places for a city"""
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'places', f'{city.lower()}.json')
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            places = json.load(f)
        return {"city": city, "places": places, "count": len(places)}
    except FileNotFoundError:
        return {"city": city, "places": [], "count": 0, "message": "City data not found"}

# ─── Quests Endpoint ─────────────────────────────────
@app.get("/api/quests")
async def get_quests(city: str = "Pune"):
    """Get available quests for a city"""
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'quests', f'{city.lower()}.json')
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            quests = json.load(f)
        return {"city": city, "quests": quests, "count": len(quests)}
    except FileNotFoundError:
        return {"city": city, "quests": [], "count": 0}

# ─── Leaderboard ─────────────────────────────────────
@app.get("/api/leaderboard")
async def get_leaderboard():
    """Get demo leaderboard"""
    return {"leaderboard": [
        {"rank": 1, "name": "Arjun S.", "xp": 4850, "level": 12, "city": "Pune", "avatar": "🏆"},
        {"rank": 2, "name": "Priya M.", "xp": 4200, "level": 11, "city": "Mumbai", "avatar": "⭐"},
        {"rank": 3, "name": "Rahul K.", "xp": 3800, "level": 10, "city": "Delhi", "avatar": "🌟"},
        {"rank": 4, "name": "Sneha D.", "xp": 3400, "level": 9, "city": "Pune", "avatar": "✨"},
        {"rank": 5, "name": "Vikram P.", "xp": 3100, "level": 8, "city": "Bangalore", "avatar": "🔥"},
        {"rank": 6, "name": "Ananya R.", "xp": 2800, "level": 7, "city": "Mumbai", "avatar": "💫"},
        {"rank": 7, "name": "Karthik N.", "xp": 2500, "level": 7, "city": "Delhi", "avatar": "🎯"},
        {"rank": 8, "name": "Meera J.", "xp": 2200, "level": 6, "city": "Pune", "avatar": "🌈"},
        {"rank": 9, "name": "Rohan B.", "xp": 1900, "level": 5, "city": "Bangalore", "avatar": "⚡"},
        {"rank": 10, "name": "Divya L.", "xp": 1600, "level": 4, "city": "Mumbai", "avatar": "🎪"}
    ]}

# ─── Weather ──────────────────────────────────────────
@app.get("/api/weather")
async def get_weather(city: str = "Pune"):
    """Get weather info (demo data)"""
    weather_data = {
        "Pune": {"temp": 28, "condition": "Partly Cloudy", "humidity": 65, "wind": 12, "icon": "⛅", "alert": None},
        "Mumbai": {"temp": 31, "condition": "Humid", "humidity": 82, "wind": 18, "icon": "🌤️", "alert": "High humidity advisory"},
        "Delhi": {"temp": 34, "condition": "Hazy", "humidity": 45, "wind": 8, "icon": "🌫️", "alert": "Air quality moderate"},
        "Bangalore": {"temp": 25, "condition": "Pleasant", "humidity": 55, "wind": 10, "icon": "☀️", "alert": None}
    }
    return weather_data.get(city, weather_data["Pune"])

@app.get("/")
async def root():
    return {"message": "Dhruva API v1.0 — Gamified Urban Exploration", "status": "active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
