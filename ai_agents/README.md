# 🤖 Dhruva LangGraph Cognitive Multi-Agent Mesh

This module implements Dhruva's distributed multi-agent system utilizing **LangGraph** architectural patterns.

## 🗺️ StateGraph Architecture

```
                    ┌─────────────────────────┐
                    │    IntentRouterNode     │
                    └────────────┬────────────┘
                                 │ (Conditional Edge)
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ SafetySentinel   │    │   QuestMaster    │    │    Pathfinder    │
│ (Vector Telemetry│    │ (Procedural XP)  │    │ (Dijkstra Routing│
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │   SynthesisOracleNode   │
                    └─────────────────────────┘
```

## 🚀 Execution Example

```python
from ai_agents.graph import DhruvaCognitiveMesh

mesh = DhruvaCognitiveMesh()
result = mesh.execute("Is Shaniwar Wada safe tonight?", city="Pune")
print(result["final_response"])
```
