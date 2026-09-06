from typing import Dict, Any, Optional
from backend.data.adapters.base import BaseDataAdapter
from backend.data.demo_data import DEMO_OCEAN_DATA, DEMO_FISHING_ZONES
from backend.logger import logger

class OceanAdapter(BaseDataAdapter):
    """
    Ocean Data Adapter.
    Demo Source: INCOIS Ocean State Forecast (OSF) Simulation
    Real API Replacement: INCOIS Web Services API / Copernicus Marine Service (CMEMS)
    """

    def fetch_data(self, location: Dict[str, float], params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        source = "INCOIS Ocean State Forecast (Demo Mode)" if self.demo_mode else "INCOIS OSF Live API"
        logger.info(f"Fetching ocean data for location {location}")

        ocean_payload = {
            "sst": DEMO_OCEAN_DATA.get("sst", 29.1),
            "sstUnit": "°C",
            "chlorophyll": DEMO_OCEAN_DATA.get("chlorophyll", 0.8),
            "chlorophyllUnit": "mg/m³",
            "condition": DEMO_OCEAN_DATA.get("condition", "Rough Sea"),
            "currentSpeed": DEMO_OCEAN_DATA.get("currentSpeed", 1.8),
            "currentDirection": DEMO_OCEAN_DATA.get("currentDirection", "SW"),
            "swellHeight": DEMO_OCEAN_DATA.get("swellHeight", 2.1)
        }

        metadata = {
            "real_api_mapping": "https://incois.gov.in/portal/osf/osf.jsp",
            "copernicus_mapping": "GLOBAL_ANALYSISFORECAST_PHY_001_024",
            "resolution": "0.083 deg x 0.083 deg grid"
        }

        return self.build_response(source=source, location=location, data=ocean_payload, metadata=metadata)

    def get_fishing_zones(self, location: Dict[str, float]) -> Dict[str, Any]:
        source = "INCOIS PFZ Advisories (Demo Mode)"
        metadata = {
            "real_api_mapping": "https://incois.gov.in/portal/pfz/pfz.jsp",
            "zone_count": len(DEMO_FISHING_ZONES)
        }
        return self.build_response(source=source, location=location, data={"fishingZones": DEMO_FISHING_ZONES}, metadata=metadata)
