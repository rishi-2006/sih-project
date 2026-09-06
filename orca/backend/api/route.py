from fastapi import APIRouter
from backend.data.adapters.geo_adapter import GeospatialAdapter
from backend.models.schemas import RouteRequestModel, LocationModel

router = APIRouter()
adapter = GeospatialAdapter(demo_mode=True)

@router.post("/route")
def compute_route(request: RouteRequestModel):
    """Compute optimal safe route vs shortest route using Haversine & spatial constraints."""
    return adapter.get_routes(request.start.dict(), request.end.dict())

@router.get("/route")
def get_default_route(
    start_lat: float = 17.6868, start_lon: float = 83.2185,
    end_lat: float = 17.78, end_lon: float = 83.46
):
    """GET endpoint to compute route between coordinates."""
    return adapter.get_routes({"lat": start_lat, "lon": start_lon}, {"lat": end_lat, "lon": end_lon})
