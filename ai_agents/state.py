"""
LangGraph Multi-Agent State Definition for Dhruva
"""
from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    """Shared state dictionary traversed across all LangGraph nodes."""
    user_query: str
    city: str
    lat: Optional[float]
    lng: Optional[float]
    user_archetype: str
    user_level: int
    intent: Optional[str] # "EXPLORE", "SAFETY_QUERY", "QUEST_GEN", "ROUTE_PLAN"
    matched_places: List[Dict[str, Any]]
    safety_evaluation: Optional[Dict[str, Any]]
    active_quest: Optional[Dict[str, Any]]
    recommended_route: Optional[Dict[str, Any]]
    final_response: str
    execution_trace: List[str]
