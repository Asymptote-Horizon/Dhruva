# 🌌 DHRUVA Cognitive Multi-Agent Architecture (`AGENTS.md`)

Welcome to the **Dhruva Agentic Mesh Specification**. Dhruva leverages an ensemble of distributed cognitive agents to power autonomous urban guidance, real-time safety vector synthesis, dynamic ludic quest generation, and multi-modal geospatial exploration.

---

## 🏛️ Multi-Agent Topology Overview

```
                            ┌────────────────────────────────────────┐
                            │        DHRUVA METACRITIC ORCHESTRATOR   │
                            │        (Intent Parsing & Routing)      │
                            └───────────────────┬────────────────────┘
                                                │
         ┌──────────────────────┬───────────────┴───────────────┬──────────────────────┐
         ▼                      ▼                               ▼                      ▼
┌──────────────────┐  ┌──────────────────┐            ┌──────────────────┐  ┌──────────────────┐
│ 🧭 DHRUVA ORACLE │  │ 🛡️ SAFETY SENTINEL│            │ ⚔️ QUEST MASTER  │  │ 🗺️ PATHFINDER    │
│  (LLM Reasoning) │  │(Vector Synthesis)│            │  (Ludic Engine)  │  │ (Dijkstra/Graph) │
└──────────────────┘  └──────────────────┘            └──────────────────┘  └──────────────────┘
```

---

## 🤖 Active Agent Specifications

### 1. 🧭 Dhruva Oracle (`dhruva-oracle`)
* **Role**: Primary conversational exploration companion and cognitive guide.
* **Inference Core**: OpenRouter API (`meta-llama/llama-3.1-8b-instruct:free` with zero-latency local rule-based fallback).
* **Capabilities**:
  * Context-aware place recommendations based on temporal windows and user sentiment.
  * Real-time conversational spatial reasoning and cultural storytelling.
  * Adaptive personality modulation (encouraging, protective, and historically informative).

#### System Prompt Specification
```markdown
You are Dhruva (ध्रुव), an AI-powered urban exploration companion named after the Pole Star — the immutable guide through uncharted territory.

Operational Guidelines:
1. When recommending POIs, always provide: Safety Score (/100), Recommended Temporal Window, and Local Context.
2. Cross-reference recommendations with current weather alerts and crowd density vectors.
3. Foster discovery without compromising urban security.
```

---

### 2. 🛡️ Safety Telemetry Sentinel (`safety-sentinel`)
* **Role**: Deterministic quantification of micro-district urban safety vectors.
* **Mathematical Heuristic**:
  $$\mathcal{S} = \sum_{i=1}^{6} w_i \cdot \phi_i(x)$$
* **Vector Parameters**:
  * $w_1 = 0.25$ — Inverse Crime Density ($\mathcal{C}_{\text{crime}}$)
  * $w_2 = 0.15$ — Infrastructure & Public Lighting Index ($\mathcal{L}_{\text{lux}}$)
  * $w_3 = 0.15$ — Pedestrian Crowd Vitality ($\mathcal{D}_{\text{crowd}}$)
  * $w_4 = 0.20$ — Verified Explorer Telemetry ($\mathcal{R}_{\text{telemetry}}$)
  * $w_5 = 0.15$ — Emergency & Medical Proximity ($\mathcal{E}_{\text{proximity}}$)
  * $w_6 = 0.10$ — Pedestrian Artery Quality ($\mathcal{T}_{\text{transit}}$)

---

### 3. ⚔️ Ludic Quest Master (`quest-master`)
* **Role**: Procedural generation of scavenger missions, historical enigmas, and milestone incentives.
* **Mechanics**:
  * Dynamic XP allocation based on waypoint difficulty, transit distance, and current weather.
  * Tier escalation logic (Novice Nomad ➔ Urban Sentinel ➔ Astral Navigator).
  * Geofenced checkpoint validation and badge issuance.

---

### 4. 🗺️ Geospatial Pathfinder (`pathfinder-agent`)
* **Role**: Graph traversal and multi-point waypoint optimization.
* **Algorithms**:
  * Haversine spherical geodesic calculation.
  * Dijkstra shortest-path topological routing.
  * Safety-weighted path optimization (prioritizing high-lux well-trafficked arteries over isolated shortcuts).

---

## 🛠️ Tool & Function Call Schemas

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "query_safety_vector",
        "description": "Calculates composite multi-factor safety index for given coordinates",
        "parameters": {
          "type": "object",
          "properties": {
            "lat": { "type": "number", "description": "Latitude coordinate" },
            "lng": { "type": "number", "description": "Longitude coordinate" },
            "city": { "type": "string", "enum": ["Pune", "Mumbai", "Delhi", "Bangalore"] }
          },
          "required": ["lat", "lng", "city"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "generate_quest_target",
        "description": "Synthesizes an active quest objective with XP reward and tier rating",
        "parameters": {
          "type": "object",
          "properties": {
            "city": { "type": "string" },
            "player_level": { "type": "integer", "minimum": 1 },
            "category_preference": { "type": "string" }
          },
          "required": ["city", "player_level"]
        }
      }
    }
  ]
}
```

---

## ⚡ Failure Tolerance & Offline Fallback Matrix

| Subsystem Failure | Fallback Protocol | UX Impact |
| :--- | :--- | :--- |
| **OpenRouter LLM Timeout** | Built-in contextual heuristics & cached knowledge graphs | Zero latency, reliable response |
| **FastAPI Microservice Offline** | Next.js Serverless Route Handlers & internal dataset hydration | Uninterrupted browsing on Vercel |
| **GPS / Telemetry Loss** | City centroid fallback coordinates (e.g. Pune: 18.5204, 73.8567) | Seamless map centering |

---

*Dhruva Autonomous Systems • Built for resilient spatial computing.*
