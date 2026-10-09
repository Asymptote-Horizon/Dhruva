import test from "node:test";
import assert from "node:assert/strict";
import { PLACES, WEATHER, LEADERBOARD } from "../app/data/cityData.js";

test("Datasets - Pune, Mumbai, Delhi, Bangalore exist with complete telemetry", () => {
  const cities = ["Pune", "Mumbai", "Delhi", "Bangalore"];
  for (const city of cities) {
    assert.ok(PLACES[city], `Missing data for city: ${city}`);
    assert.ok(PLACES[city].length > 0, `Empty places list for: ${city}`);
    
    for (const place of PLACES[city]) {
      assert.ok(place.id, "Place must have an ID");
      assert.ok(place.name, "Place must have a name");
      assert.ok(typeof place.lat === "number", "Latitude must be a number");
      assert.ok(typeof place.lng === "number", "Longitude must be a number");
      assert.ok(place.safety_score >= 0 && place.safety_score <= 100, "Safety score must be between 0 and 100");
      assert.ok(place.rating >= 1 && place.rating <= 5, "Rating must be between 1 and 5");
      assert.ok(place.safety_factors, "Safety factors must exist");
      assert.ok(place.safety_factors.crime_inverse !== undefined, "crime_inverse factor must exist");
      assert.ok(place.safety_factors.lighting !== undefined, "lighting factor must exist");
    }
  }
});

test("Weather Telemetry - Valid temperature and conditions", () => {
  const cities = ["Pune", "Mumbai", "Delhi", "Bangalore"];
  for (const city of cities) {
    const w = WEATHER[city];
    assert.ok(w, `Weather must exist for ${city}`);
    assert.ok(typeof w.temp === "number", "Temperature must be a number");
    assert.ok(w.condition, "Condition string must exist");
    assert.ok(w.icon, "Weather icon must exist");
  }
});

test("Leaderboard - Correct ranking and XP ordering", () => {
  assert.ok(LEADERBOARD.length >= 5, "Leaderboard should have at least 5 entries");
  for (let i = 0; i < LEADERBOARD.length - 1; i++) {
    assert.ok(LEADERBOARD[i].rank <= LEADERBOARD[i + 1].rank, "Ranks should be sequential");
    assert.ok(LEADERBOARD[i].xp >= LEADERBOARD[i + 1].xp, "XP should be in descending order");
  }
});
