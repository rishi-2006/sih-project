from fastapi import APIRouter, Query
from backend.data.adapters.alerts_adapter import AlertsAdapter

router = APIRouter()
adapter = AlertsAdapter(demo_mode=True)

@router.get("/alerts")
def get_alerts(
    lat: float = Query(17.6868, description="Latitude"),
    lon: float = Query(83.2185, description="Longitude")
):
    """Retrieve active meteorological & marine hazard alerts for given coordinates."""
    return adapter.fetch_data({"lat": lat, "lon": lon})
