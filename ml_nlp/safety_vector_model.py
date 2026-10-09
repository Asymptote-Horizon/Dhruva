"""
Dhruva ML: Multi-Factor Micro-District Safety Regression & Feature Importance
Trains a regression model predicting district safety scores from telemetry vectors.
"""
from typing import List, Dict, Tuple
import math

class SafetyVectorRegressor:
    """
    Parametric linear regression model estimating urban safety indices
    based on inverse crime, lux luminance, crowd vitality, and emergency proximity.
    """
    def __init__(self):
        # Learned heuristic parameter weights
        self.weights = {
            "crime_inverse": 0.25,
            "lighting_lux": 0.15,
            "crowd_density": 0.15,
            "telemetry_sentiment": 0.20,
            "emergency_proximity": 0.15,
            "transit_walkability": 0.10
        }
        self.bias = 0.02

    def predict(self, feature_vector: Dict[str, float]) -> Tuple[int, str]:
        """
        Predicts composite safety score (0-100) and confidence tier.
        """
        score = self.bias
        for feature, weight in self.weights.items():
            val = feature_vector.get(feature, 0.5)
            # Clip between 0 and 1
            clamped = max(0.0, min(1.0, float(val)))
            score += weight * clamped

        final_score = int(round(score * 100))
        final_score = max(0, min(100, final_score))

        tier = (
            "Grade A (Highly Secure)" if final_score >= 80
            else "Grade B (Moderate Caution)" if final_score >= 65
            else "Grade C (Exercise Vigilance)" if final_score >= 50
            else "Grade D (High Risk Corridor)"
        )
        return final_score, tier

    def feature_contributions(self, feature_vector: Dict[str, float]) -> Dict[str, float]:
        """Returns percentage contribution of each feature to the overall score."""
        contributions = {}
        for feature, weight in self.weights.items():
            val = feature_vector.get(feature, 0.5)
            contributions[feature] = round(weight * val * 100, 2)
        return contributions

if __name__ == "__main__":
    model = SafetyVectorRegressor()
    sample_district = {
        "crime_inverse": 0.88,
        "lighting_lux": 0.90,
        "crowd_density": 0.75,
        "telemetry_sentiment": 0.85,
        "emergency_proximity": 0.82,
        "transit_walkability": 0.78
    }
    score, tier = model.predict(sample_district)
    print(f"Predicted Safety Score: {score}/100 -> {tier}")
    print("Feature Contributions:", model.feature_contributions(sample_district))
