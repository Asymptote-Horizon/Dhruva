"""
Dhruva OpenStreetMap (Overpass API) Client & Geospatial Telemetry Service
Fetches live OSM nodes with local caching and offline fallback.
"""
import os
import json
import httpx
from typing import Dict, Any, List, Optional

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
CACHE_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'osm')

class OSMTelemetryService:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=15.0)

    async def fetch_city_pois(self, city: str = "Pune", lat: float = 18.5204, lng: float = 73.8567) -> List[Dict[str, Any]]:
        """Queries Overpass API or loads cached GeoJSON if offline."""
        cached_file = os.path.join(CACHE_DIR, f"{city.lower()}_osm_pois.geojson")
        
        # 1. Try local cache first for zero-latency response
        if os.path.exists(cached_file):
            try:
                with open(cached_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return data.get("features", [])
            except Exception:
                pass

        # 2. Live Overpass query
        overpass_query = f"""
        [out:json][timeout:15];
        (
          node["tourism"](around:5000, {lat}, {lng});
          node["historic"](around:5000, {lat}, {lng});
        );
        out body 15;
        """
        try:
            res = await self.client.post(OVERPASS_URL, data={"data": overpass_query})
            if res.status_code == 200:
                elements = res.json().get("elements", [])
                return elements
        except Exception:
            pass

        return []

if __name__ == "__main__":
    import asyncio
    service = OSMTelemetryService()
    pois = asyncio.run(service.fetch_city_pois("Pune"))
    print(f"Loaded {len(pois)} OpenStreetMap landmarks.")
