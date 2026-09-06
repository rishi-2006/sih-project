from typing import Dict, Any
from backend.agents.base import BaseAgent
from datetime import datetime, timezone

class ReasoningAgent(BaseAgent):
    def __init__(self):
        super().__init__("Reasoning Agent", "reasoning")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        risk = state.get("risk_assessment", {})
        raw_weather = state.get("weather_data", {})
        raw_ocean = state.get("ocean_data", {})

        weather = raw_weather.get("data", raw_weather) if isinstance(raw_weather, dict) else {}
        ocean = raw_ocean.get("data", raw_ocean) if isinstance(raw_ocean, dict) else {}

        now_iso = datetime.now(timezone.utc).isoformat()

        evidence = [
            {
                "category": "Weather Data",
                "source": "IMD / OpenWeatherMap",
                "timestamp": now_iso,
                "data": {
                    "Wind Speed": f"{weather.get('windSpeed', 32)} km/h {weather.get('windDirection', 'NE')}",
                    "Wave Height": f"{weather.get('waveHeight', 2.8)} m",
                    "Rainfall": weather.get("rainfall", "Light Rain"),
                    "Visibility": f"{weather.get('visibility', 8.5)} km"
                },
                "isDemo": True
            },
            {
                "category": "Ocean Data",
                "source": "INCOIS Ocean State Forecast",
                "timestamp": now_iso,
                "data": {
                    "SST": f"{ocean.get('sst', 29.1)}°C",
                    "Chlorophyll": f"{ocean.get('chlorophyll', 0.8)} mg/m³",
                    "Condition": ocean.get("condition", "Rough Sea"),
                    "Current": f"{ocean.get('currentSpeed', 1.8)} kn {ocean.get('currentDirection', 'SW')}"
                },
                "isDemo": True
            },
            {
                "category": "Risk Engine",
                "source": "ORCA Deterministic Risk Engine",
                "timestamp": now_iso,
                "data": {
                    "Wind Risk": risk.get("wind", "HIGH"),
                    "Wave Risk": risk.get("wave", "HIGH"),
                    "Cyclone Risk": risk.get("cyclone", "MODERATE"),
                    "Final Risk": risk.get("overall", "HIGH")
                },
                "isDemo": True
            }
        ]

        state["evidence"] = evidence

        return {
            "description": "Synthesized observational evidence and risk parameters across agents.",
            "summary": "Cross-source Evidence Synthesized",
            "output": {"evidence": evidence}
        }
