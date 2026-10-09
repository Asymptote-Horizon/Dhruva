"""
Dhruva ML: Geospatial POI Clustering & Hotspot Identification
Uses Haversine spherical distance to group POIs into walkable exploration zones.
"""
import math
from typing import List, Dict, Any

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))

class SpatialClusterEngine:
    """Groups landmarks within max_radius_km into interconnected exploration corridors."""
    def __init__(self, max_radius_km: float = 2.5):
        self.max_radius_km = max_radius_km

    def cluster_places(self, places: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        visited = set()
        clusters = []

        for i, place in enumerate(places):
            if i in visited:
                continue

            current_cluster = [place]
            visited.add(i)

            for j, candidate in enumerate(places):
                if j in visited:
                    continue

                dist = haversine_km(
                    place["lat"], place["lng"],
                    candidate["lat"], candidate["lng"]
                )
                if dist <= self.max_radius_km:
                    current_cluster.append(candidate)
                    visited.add(j)

            avg_safety = round(
                sum(p["safety_score"] for p in current_cluster) / len(current_cluster), 1
            )

            clusters.append({
                "cluster_id": f"zone-{len(clusters) + 1}",
                "center_lat": round(sum(p["lat"] for p in current_cluster) / len(current_cluster), 4),
                "center_lng": round(sum(p["lng"] for p in current_cluster) / len(current_cluster), 4),
                "place_count": len(current_cluster),
                "average_safety_score": avg_safety,
                "poi_names": [p["name"] for p in current_cluster]
            })

        return clusters

if __name__ == "__main__":
    sample_places = [
        {"name": "Shaniwar Wada", "lat": 18.5195, "lng": 73.8553, "safety_score": 82},
        {"name": "Dagdusheth Temple", "lat": 18.5167, "lng": 73.8567, "safety_score": 88},
        {"name": "FC Road", "lat": 18.5263, "lng": 73.8408, "safety_score": 76},
        {"name": "Sinhagad Fort", "lat": 18.3662, "lng": 73.7551, "safety_score": 68}
    ]
    engine = SpatialClusterEngine(max_radius_km=2.0)
    zones = engine.cluster_places(sample_places)
    print("Identified Exploration Zones:")
    for z in zones:
        print(z)
