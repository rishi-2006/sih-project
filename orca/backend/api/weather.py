from fastapi import APIRouter, HTTPException, Query
from backend.data.adapters.weather_adapter import WeatherAdapter
from backend.logger import logger

router = APIRouter()
adapter = WeatherAdapter(demo_mode=True)

@router.get("/weather")
def get_weather(
    lat: float = Query(17.6868, ge=-90, le=90, description="Latitude"),
    lon: float = Query(83.2185, ge=-180, le=180, description="Longitude")
):
    try:
        return adapter.fetch_data({"lat": lat, "lon": lon})
    except Exception as e:
        logger.error(f"Error fetching weather data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather data: {str(e)}")
