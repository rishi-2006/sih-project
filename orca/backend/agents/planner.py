from typing import Dict, Any
from backend.agents.base import BaseAgent

class PlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__("Planner Agent", "planner")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        message = state.get("message", "").lower()
        
        # Determine intent & required agents dynamically
        if any(w in message for w in ["fishing zone", "where to fish", "pfz"]):
            intent = "FISHING_ZONE"
            required_agents = ["ocean", "geo", "weather", "risk", "reasoning", "response"]
        elif any(w in message for w in ["route", "path", "navigate", "safest route"]):
            intent = "SAFE_ROUTE"
            required_agents = ["geo", "weather", "ocean", "risk", "reasoning", "response"]
        else:
            intent = "FISHING_SAFETY"
            required_agents = ["weather", "ocean", "geo", "risk", "reasoning", "response"]

        location = state.get("location") or {"lat": 17.6868, "lon": 83.2185, "name": "Visakhapatnam"}
        
        state["intent"] = intent
        state["required_agents"] = required_agents
        state["target_location"] = location

        return {
            "description": f"Intent identified: {intent}. Triggering agents: {', '.join(required_agents)}",
            "summary": f"Intent: {intent}",
            "output": {"intent": intent, "required_agents": required_agents}
        }
