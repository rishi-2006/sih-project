from typing import Dict, Any, Optional
from backend.data.adapters.base import BaseDataAdapter
from backend.data.demo_data import DEMO_WEATHER_DATA, DEMO_ALERTS
from backend.logger import logger

class WeatherAdapter(BaseDataAdapter):
    """
    Weather Data Adapter.
    Demo Source: IMD / OpenWeatherMap Simulation
    Real API Replacement: OpenWeatherMap One Call API 3.0 / IMD Weather Web Services
    """

    def fetch_data(self, location: Dict[str, float], params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        source = "IMD / OpenWeatherMap (Demo Mode)" if self.demo_mode else "OpenWeatherMap Live API"
        logger.info(f"Fetching weather data for location {location}")
        
        weather_payload = {
            "temperature": DEMO_WEATHER_DATA.get("temperature", 28.5),
            "windSpeed": DEMO_WEATHER_DATA.get("windSpeed", 32.0),
            "windDirection": DEMO_WEATHER_DATA.get("windDirection", "NE"),
            "waveHeight": DEMO_WEATHER_DATA.get("waveHeight", 2.8),
            "rainfall": DEMO_WEATHER_DATA.get("rainfall", "Light Rain"),
            "visibility": DEMO_WEATHER_DATA.get("visibility", 8.5),
            "humidity": DEMO_WEATHER_DATA.get("humidity", 82),
            "forecast": DEMO_WEATHER_DATA.get("forecast", "Squally weather with wind speeds reaching 35-45 km/h")
        }

        metadata = {
            "real_api_mapping": "https://api.openweathermap.org/data/3.0/onecall",
            "update_interval": "1 hour",
            "station": "Visakhapatnam Coastal Weather Radar"
        }

        return self.build_response(source=source, location=location, data=weather_payload, metadata=metadata)

    def get_alerts(self, location: Dict[str, float]) -> Dict[str, Any]:
        source = "IMD Severe Weather Warnings (Demo Mode)"
        metadata = {
            "real_api_mapping": "https://mausam.imd.gov.in/api/warnings",
            "alert_count": len(DEMO_ALERTS)
        }
        return self.build_response(source=source, location=location, data={"alerts": DEMO_ALERTS}, metadata=metadata)
