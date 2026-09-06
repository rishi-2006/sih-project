from fastapi import APIRouter, HTTPException, Query
from backend.agents.risk import RiskAgent
from backend.data.adapters.weather_adapter import WeatherAdapter
from backend.logger import logger

router = APIRouter()
risk_agent = RiskAgent()
weather_adapter = WeatherAdapter(demo_mode=True)

@router.get("/risk")
def get_risk(
    lat: float = Query(17.6868, ge=-90, le=90),
    lon: float = Query(83.2185, ge=-180, le=180)
):
    try:
        weather_res = weather_adapter.fetch_data({"lat": lat, "lon": lon})
        alerts_res = weather_adapter.get_alerts({"lat": lat, "lon": lon})
        
        weather_data = weather_res.get("data", weather_res)
        alerts_data = alerts_res.get("data", {}).get("alerts", [])
        
        state = {
            "target_location": {"lat": lat, "lon": lon},
            "weather_data": weather_data,
            "alerts_data": alerts_data
        }
        risk_agent.run(state)
        return {
            "location": {"lat": lat, "lon": lon},
            "riskAssessment": state.get("risk_assessment")
        }
    except Exception as e:
        logger.error(f"Error computing risk assessment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to compute risk assessment: {str(e)}")
