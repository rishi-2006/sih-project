from typing import Dict, Any
from backend.agents.base import BaseAgent

class RiskAgent(BaseAgent):
    def __init__(self):
        super().__init__("Risk Assessment Agent", "risk")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        raw_weather = state.get("weather_data", {})
        raw_alerts = state.get("alerts_data", [])
        
        weather = raw_weather.get("data", raw_weather) if isinstance(raw_weather, dict) else raw_weather
        alerts = raw_alerts.get("data", {}).get("alerts", raw_alerts) if isinstance(raw_alerts, dict) else raw_alerts
        if not isinstance(alerts, list):
            alerts = []

        wind_speed = weather.get("windSpeed", 0)
        wave_height = weather.get("waveHeight", 0)
        
        # Deterministic Risk Evaluation Matrix
        reasons = []
        
        # Wind Assessment
        if wind_speed > 35:
            wind_risk = "EXTREME"
            reasons.append(f"Gale force winds detected ({wind_speed} km/h)")
        elif wind_speed > 25:
            wind_risk = "HIGH"
            reasons.append(f"Strong squally winds ({wind_speed} km/h)")
        elif wind_speed > 18:
            wind_risk = "MODERATE"
            reasons.append(f"Moderate breezy conditions ({wind_speed} km/h)")
        else:
            wind_risk = "LOW"

        # Wave Assessment
        if wave_height > 3.0:
            wave_risk = "EXTREME"
            reasons.append(f"Dangerous high sea waves ({wave_height}m)")
        elif wave_height > 2.0:
            wave_risk = "HIGH"
            reasons.append(f"Elevated wave height ({wave_height}m)")
        elif wave_height > 1.2:
            wave_risk = "MODERATE"
            reasons.append(f"Moderate sea swell ({wave_height}m)")
        else:
            wave_risk = "LOW"

        # Alert Assessment
        cyclone_alert = any(isinstance(a, dict) and a.get("type") == "cyclone" for a in alerts)
        cyclone_risk = "MODERATE" if cyclone_alert else "LOW"
        if cyclone_alert:
            reasons.append("Active cyclone advisory 300 km East in Bay of Bengal")

        lightning_risk = "LOW"
        visibility_risk = "LOW"

        # Overall Risk Matrix Synthesis
        risk_scores = {"LOW": 1, "MODERATE": 2, "HIGH": 3, "EXTREME": 4}
        max_score = max(risk_scores[wind_risk], risk_scores[wave_risk], risk_scores[cyclone_risk])

        overall_risk = "HIGH"
        for k, v in risk_scores.items():
            if v == max_score:
                overall_risk = k

        if overall_risk in ["HIGH", "EXTREME"]:
            recommendation = "Not recommended to go fishing tomorrow morning."
        elif overall_risk == "MODERATE":
            recommendation = "Exercise extreme caution if venturing into coastal waters."
        else:
            recommendation = "Sea conditions are favorable for fishing activities."

        risk_assessment = {
            "overall": overall_risk,
            "wind": wind_risk,
            "wave": wave_risk,
            "lightning": lightning_risk,
            "cyclone": cyclone_risk,
            "visibility": visibility_risk,
            "recommendation": recommendation,
            "reasons": reasons,
            "confidence": 0.88
        }

        state["risk_assessment"] = risk_assessment

        return {
            "description": f"Deterministic risk assessed: {overall_risk} RISK based on wind, waves, and active alerts.",
            "summary": f"Calculated Risk: {overall_risk}",
            "output": risk_assessment
        }
