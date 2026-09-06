from typing import Dict, Any, Optional
from backend.data.adapters.base import BaseDataAdapter
from backend.logger import logger

class SatelliteAdapter(BaseDataAdapter):
    """
    Satellite Data Adapter.
    Demo Source: Sentinel-3 OLCI & MODIS-Aqua Sea Surface Temperature & Chlorophyll-a Data
    Real API Replacement: Copernicus Open Access Hub / NASA Earthdata (LAADS DAAC)
    """

    def fetch_data(self, location: Dict[str, float], params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        source = "Sentinel-3 OLCI / MODIS Aqua (Demo Mode)"
        logger.info(f"Fetching satellite observations for location {location}")

        satellite_payload = {
            "satellite": "Sentinel-3A OLCI & MODIS-Aqua",
            "sst_map_url": "https://incois.gov.in/pfz/sst_image.png",
            "chlorophyll_map_url": "https://incois.gov.in/pfz/chlo_image.png",
            "cloud_cover_percent": 12.5,
            "pass_timestamp": "2026-09-05T06:30:00Z",
            "resolution_meters": 300
        }

        metadata = {
            "real_api_mapping": "https://dataspace.copernicus.eu/api/odata/v1/Products",
            "nasa_earthdata": "https://cmr.earthdata.nasa.gov/search/granules.json",
            "sensors": ["OLCI", "SLSTR", "MODIS-Aqua"]
        }

        return self.build_response(source=source, location=location, data=satellite_payload, metadata=metadata)
