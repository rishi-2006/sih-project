from typing import Dict, Any
from backend.agents.base import BaseAgent
from backend.data.adapters.weather_adapter import WeatherAdapter

class WeatherAgent(BaseAgent):
    def __init__(self):
        super().__init__("Weather Agent", "weather")
        self.adapter = WeatherAdapter(demo_mode=True)

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        location = state.get("target_location", {"lat": 17.6868, "lon": 83.2185})
        raw_weather = self.adapter.fetch_data(location)
        raw_alerts = self.adapter.get_alerts(location)
        
        # Unwrap data dictionary if wrapped in adapter envelope
        weather_payload = raw_weather.get("data", raw_weather)
        alerts_payload = raw_alerts.get("data", {}).get("alerts", raw_alerts.get("alerts", []))
        if isinstance(raw_alerts, list):
            alerts_payload = raw_alerts

        if "source" not in weather_payload or not isinstance(weather_payload["source"], dict):
            weather_payload["source"] = {"name": "IMD / OpenWeatherMap", "timestamp": "2026-09-05T12:00:00Z", "isDemo": True}

        state["weather_data"] = weather_payload
        state["alerts_data"] = alerts_payload

        wind = weather_payload.get("windSpeed", 0)
        waves = weather_payload.get("waveHeight", 0)
        alert_count = len(alerts_payload)

        return {
            "description": f"Weather analyzed: Wind {wind} km/h, Waves {waves}m, {alert_count} active alerts.",
            "summary": "Weather & Hazards Evaluated",
            "output": {"weather": weather_payload, "alerts": alerts_payload}
        }
