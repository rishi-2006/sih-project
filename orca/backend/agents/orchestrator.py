import time
from typing import Dict, Any
from backend.agents.planner import PlannerAgent
from backend.agents.weather import WeatherAgent
from backend.agents.ocean import OceanAgent
from backend.agents.geo import GeospatialAgent
from backend.agents.risk import RiskAgent
from backend.agents.reasoning import ReasoningAgent
from backend.agents.response import ResponseAgent

class AgentOrchestrator:
    def __init__(self):
        self.agent_registry = {
            "planner": PlannerAgent(),
            "weather": WeatherAgent(),
            "ocean": OceanAgent(),
            "geo": GeospatialAgent(),
            "risk": RiskAgent(),
            "reasoning": ReasoningAgent(),
            "response": ResponseAgent(),
        }

    def process_query(self, message: str, location: Dict[str, float] = None, language: str = "en") -> Dict[str, Any]:
        start_time = time.time()
        
        state: Dict[str, Any] = {
            "message": message,
            "location": location or {"lat": 17.6868, "lon": 83.2185},
            "language": language,
            "agent_trace": []
        }

        # Step 1: Execute Planner Agent dynamically
        self.agent_registry["planner"].execute(state)

        # Step 2: Dynamically invoke required agents selected by Planner
        required_agents = state.get("required_agents", ["weather", "ocean", "geo", "risk", "reasoning", "response"])
        for agent_key in required_agents:
            if agent_key in self.agent_registry and agent_key != "planner":
                self.agent_registry[agent_key].execute(state)

        total_duration = round(time.time() - start_time, 2)

        return {
            "state": state,
            "response": state.get("response_content", ""),
            "risk_assessment": state.get("risk_assessment"),
            "agent_trace": {
                "steps": state.get("agent_trace", []),
                "totalDuration": total_duration,
                "isDemo": True
            },
            "evidence": state.get("evidence", []),
            "weather_data": state.get("weather_data"),
            "ocean_data": state.get("ocean_data"),
            "alerts": state.get("alerts_data", []),
            "fishing_zones": state.get("fishing_zones", []),
            "routes": state.get("routes", {})
        }
