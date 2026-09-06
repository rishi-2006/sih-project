from fastapi import APIRouter, HTTPException, Query
from backend.data.adapters.ocean_adapter import OceanAdapter
from backend.logger import logger

router = APIRouter()
adapter = OceanAdapter(demo_mode=True)

@router.get("/ocean")
def get_ocean(
    lat: float = Query(17.6868, ge=-90, le=90, description="Latitude"),
    lon: float = Query(83.2185, ge=-180, le=180, description="Longitude")
):
    try:
        return adapter.fetch_data({"lat": lat, "lon": lon})
    except Exception as e:
        logger.error(f"Error fetching ocean data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch ocean data: {str(e)}")

@router.get("/fishing-zones")
def get_fishing_zones(
    lat: float = Query(17.6868, ge=-90, le=90),
    lon: float = Query(83.2185, ge=-180, le=180)
):
    try:
        return adapter.get_fishing_zones({"lat": lat, "lon": lon})
    except Exception as e:
        logger.error(f"Error fetching fishing zones: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch fishing zones: {str(e)}")
