"""
Integration Tests for Dhruva FastAPI Endpoints
Tests:
- Root healthcheck
- Places endpoint with city parameter
- Weather endpoint
- Leaderboard ranking
- Safety score query
- Route calculation
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_status():
    """Verify backend health endpoint."""
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "active"
    assert "Dhruva API" in data["message"]

def test_get_places_pune():
    """Verify places dataset hydration for Pune."""
    res = client.get("/api/places?city=Pune")
    assert res.status_code == 200
    data = res.json()
    assert data["city"] == "Pune"
    assert data["count"] > 0
    assert len(data["places"]) > 0
    assert "safety_score" in data["places"][0]

def test_get_places_mumbai():
    """Verify places dataset hydration for Mumbai."""
    res = client.get("/api/places?city=Mumbai")
    assert res.status_code == 200
    data = res.json()
    assert data["city"] == "Mumbai"
    assert data["count"] > 0

def test_get_weather():
    """Verify weather data structure."""
    res = client.get("/api/weather?city=Bangalore")
    assert res.status_code == 200
    data = res.json()
    assert "temp" in data
    assert "condition" in data
    assert "humidity" in data

def test_get_leaderboard():
    """Verify explorer leaderboard structure and ranking order."""
    res = client.get("/api/leaderboard")
    assert res.status_code == 200
    data = res.json()
    assert "leaderboard" in data
    assert len(data["leaderboard"]) >= 5
    # Check rank order is ascending (1, 2, 3...)
    ranks = [item["rank"] for item in data["leaderboard"]]
    assert ranks == sorted(ranks)

def test_safety_vector_query():
    """Verify GPS-based dynamic safety score quantification."""
    res = client.get("/api/safety?lat=18.5204&lng=73.8567")
    assert res.status_code == 200
    data = res.json()
    assert 0 <= data["score"] <= 100
    assert data["grade"] in ["A", "B", "C", "D"]
    assert "factors" in data

def test_route_calculation():
    """Verify route calculation between two GPS coordinates."""
    payload = {
        "from_lat": 18.5195,
        "from_lng": 73.8553,
        "to_lat": 18.5523,
        "to_lng": 73.9015
    }
    res = client.post("/api/route", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["distance_km"] > 0
    assert data["estimated_time_mins"] >= 1
