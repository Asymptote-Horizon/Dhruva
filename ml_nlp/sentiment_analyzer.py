"""
Dhruva NLP: Traveler Sentiment & Aspect Analysis Engine
Analyzes community explorer reviews to extract safety sentiment and highlight tags.
"""
import re
from typing import Dict, List, Any

POSITIVE_WORDS = {
    "safe", "bright", "vibrant", "peaceful", "crowded", "well-lit",
    "beautiful", "historic", "majestic", "friendly", "clean", "easy",
    "police", "guards", "lively", "scenic", "breathtaking", "family"
}

NEGATIVE_WORDS = {
    "dark", "dim", "isolated", "deserted", "pickpocket", "unsafe",
    "shady", "rough", "potholes", "dirty", "unlit", "broken",
    "scary", "sketchy", "harassment", "aggressive"
}

ASPECT_PATTERNS = {
    "lighting": ["light", "lighting", "dark", "streetlights", "lamp"],
    "crowd": ["crowd", "people", "busy", "empty", "isolated", "family"],
    "transit": ["metro", "auto", "cab", "bus", "parking", "walk"],
    "cleanliness": ["clean", "dirty", "garbage", "maintained", "hygiene"]
}

class TravelerSentimentAnalyzer:
    """Extracts sentiment polarity score and safety tags from unstructured review text."""

    def analyze_review(self, text: str) -> Dict[str, Any]:
        cleaned = re.sub(r'[^a-zA-Z\s]', '', text.lower())
        tokens = cleaned.split()

        pos_count = sum(1 for w in tokens if w in POSITIVE_WORDS)
        neg_count = sum(1 for w in tokens if w in NEGATIVE_WORDS)
        total = pos_count + neg_count

        if total == 0:
            score = 0.5  # neutral baseline
        else:
            score = round((pos_count - neg_count) / total, 3)

        # Normalize score to 0.0 - 1.0 range
        normalized_sentiment = round((score + 1.0) / 2.0, 3)

        # Extract aspects mentioned
        detected_aspects = []
        for aspect, keywords in ASPECT_PATTERNS.items():
            if any(k in tokens for k in keywords):
                detected_aspects.append(aspect)

        return {
            "text_length": len(tokens),
            "polarity_score": score,
            "normalized_sentiment": normalized_sentiment,
            "sentiment_label": "POSITIVE" if score > 0.1 else "NEGATIVE" if score < -0.1 else "NEUTRAL",
            "detected_aspects": detected_aspects,
            "safety_telemetry_weight": round(normalized_sentiment * 0.20, 3)
        }

if __name__ == "__main__":
    analyzer = TravelerSentimentAnalyzer()
    reviews = [
        "Shaniwar Wada was beautifully lit in the evening, very crowded and felt totally safe with guards around.",
        "The back alley had broken streetlights, was completely deserted and felt sketchy after 9 PM."
    ]
    for r in reviews:
        print(r)
        print(analyzer.analyze_review(r))
        print("-" * 50)
