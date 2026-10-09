"""
Dhruva LangGraph Cognitive Mesh Workflow Orchestrator
Assembles nodes into a directed acyclic state graph with conditional edges.
"""
from ai_agents.state import AgentState
from ai_agents.nodes import (
    intent_router_node,
    safety_sentinel_node,
    quest_master_node,
    pathfinder_node,
    synthesis_oracle_node,
)

class DhruvaCognitiveMesh:
    """
    Lightweight, dependency-free LangGraph workflow engine simulator
    that directly maps to LangGraph StateGraph conventions.
    """
    def __init__(self):
        self.nodes = {
            "router": intent_router_node,
            "safety_sentinel": safety_sentinel_node,
            "quest_master": quest_master_node,
            "pathfinder": pathfinder_node,
            "synthesis": synthesis_oracle_node,
        }

    def route_condition(self, state: AgentState) -> str:
        """Conditional edge selector based on classified intent."""
        intent = state.get("intent")
        if intent == "SAFETY_QUERY":
            return "safety_sentinel"
        elif intent == "QUEST_GEN":
            return "quest_master"
        elif intent == "ROUTE_PLAN":
            return "pathfinder"
        else:
            return "safety_sentinel"

    def execute(self, user_query: str, city: str = "Pune", user_level: int = 1) -> AgentState:
        """Executes full multi-agent state graph pipeline."""
        initial_state: AgentState = {
            "user_query": user_query,
            "city": city,
            "lat": 18.5204,
            "lng": 73.8567,
            "user_archetype": "Curious Nomad",
            "user_level": user_level,
            "intent": None,
            "matched_places": [],
            "safety_evaluation": None,
            "active_quest": None,
            "recommended_route": None,
            "final_response": "",
            "execution_trace": []
        }

        # Step 1: Route Node
        state = self.nodes["router"](initial_state)

        # Step 2: Conditional Branch Node
        target_node = self.route_condition(state)
        state = self.nodes[target_node](state)

        # Step 3: Synthesis Node
        final_state = self.nodes["synthesis"](state)
        return final_state

if __name__ == "__main__":
    mesh = DhruvaCognitiveMesh()
    test_queries = [
        "Is Shaniwar Wada safe to visit tonight?",
        "Give me a scavenger quest in Pune",
        "How can I walk safely to the nearest landmark?"
    ]
    for q in test_queries:
        res = mesh.execute(q, city="Pune")
        print(f"\n[QUERY]: {q}")
        print(f"[TRACE]: {' -> '.join(res['execution_trace'])}")
        print(f"[RESPONSE]: {res['final_response']}\n{'-'*60}")
