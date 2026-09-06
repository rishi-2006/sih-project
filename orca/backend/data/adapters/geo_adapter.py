"""
ORCA — Geospatial Data Adapter
Wraps demo data + Python geo_utils calculations.
PostGIS: swap fetch_data() body with ST_AsGeoJSON queries.
"""
from typing import Dict, Any, List, Optional
from backend.data.adapters.base import BaseDataAdapter
from backend.utils.geo_utils import (
    haversine_distance, km_to_nm, bearing, cardinal_dir,
    nearest_zone, zone_distances, route_length_km,
    geofence_check, point_in_polygon,
)

# ── Demo GeoData (Visakhapatnam Region) ──────────────────────────
FISHING_ZONES = [
    {
        "id": "pfz-visakha-north",
        "name": "Visakha North PFZ",
        "type": "fishing",
        "severity": "caution",
        "center": [17.78, 83.46],
        "coords": [[17.82, 83.40], [17.82, 83.54], [17.73, 83.52], [17.72, 83.38]],
        "sst": 29.1, "chlorophyll": 0.8, "suitability": "High",
    },
    {
        "id": "pfz-bheemunipatnam",
        "name": "Bheemunipatnam Sector PFZ",
        "type": "fishing",
        "severity": "caution",
        "center": [17.89, 83.52],
        "coords": [[17.94, 83.46], [17.94, 83.60], [17.84, 83.57], [17.84, 83.43]],
        "sst": 28.8, "chlorophyll": 0.6, "suitability": "Moderate",
    },
    {
        "id": "pfz-kakinada-south",
        "name": "Kakinada South Offshore PFZ",
        "type": "fishing",
        "severity": "recommended",
        "center": [16.85, 82.35],
        "coords": [[16.92, 82.28], [16.92, 82.44], [16.78, 82.42], [16.78, 82.26]],
        "sst": 28.4, "chlorophyll": 1.1, "suitability": "High",
    },
]

GEOFENCES = [
    {
        "id": "geo-imbl",
        "name": "International Maritime Boundary Line",
        "type": "restricted",
        "severity": "restricted",
        "center": [17.10, 84.00],
        "coords": [[18.20, 83.88], [18.20, 84.30], [16.00, 84.30], [16.00, 83.88]],
        "authority": "Ministry of External Affairs / Indian Navy",
    },
    {
        "id": "geo-kambalakonda-mpa",
        "name": "Kambalakonda Marine Protected Area",
        "type": "mpa",
        "severity": "restricted",
        "center": [17.76, 83.34],
        "coords": [[17.80, 83.29], [17.82, 83.38], [17.73, 83.40], [17.71, 83.31]],
        "authority": "AP Forest Dept / MoEFCC",
    },
    {
        "id": "geo-navy-exclusion",
        "name": "Naval Exercise Exclusion Zone",
        "type": "restricted",
        "severity": "restricted",
        "center": [17.72, 83.58],
        "coords": [[17.77, 83.53], [17.77, 83.65], [17.67, 83.63], [17.67, 83.51]],
        "authority": "Eastern Naval Command",
    },
    {
        "id": "geo-cargo-lane",
        "name": "Cargo Traffic Separation Scheme",
        "type": "caution",
        "severity": "caution",
        "center": [17.50, 83.30],
        "coords": [[17.56, 83.22], [17.56, 83.38], [17.44, 83.38], [17.44, 83.22]],
        "authority": "Visakhapatnam Port Authority",
    },
]

ROUTES = [
    {
        "id": "route-recommended",
        "name": "Recommended Safe Route",
        "type": "recommended",
        "waypoints_latlon": [
            [17.6868, 83.2185], [17.70, 83.26], [17.72, 83.32],
            [17.75, 83.38], [17.78, 83.44], [17.79, 83.46],
        ],
        "hazard_exposure": "MODERATE",
    },
    {
        "id": "route-shortest",
        "name": "Shortest Route (High Hazard)",
        "type": "shortest",
        "waypoints_latlon": [
            [17.6868, 83.2185], [17.60, 83.42], [17.50, 83.55], [17.79, 83.46],
        ],
        "hazard_exposure": "HIGH",
    },
]


class GeospatialAdapter(BaseDataAdapter):
    """
    PostGIS upgrade path:
      fetch_data()  → execute ST_AsGeoJSON + ST_DWithin queries
      get_routes()  → execute pgRouting shortest-path queries
    """

    def fetch_data(
        self, location: Dict[str, float], params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        user_lat = location.get("lat", 17.6868)
        user_lon = location.get("lon", 83.2185)

        # Enrich fishing zones with real distances
        fishing_enriched = zone_distances(user_lat, user_lon, FISHING_ZONES)
        geofence_enriched = zone_distances(user_lat, user_lon, GEOFENCES)

        # Geofence breach check
        breached = geofence_check(user_lat, user_lon, GEOFENCES)

        # Nearest fishing zone
        nearest_pfz = nearest_zone(user_lat, user_lon, FISHING_ZONES)

        payload = {
            "user_location": {"lat": user_lat, "lon": user_lon},
            "fishing_zones": fishing_enriched,
            "geofences": geofence_enriched,
            "geofence_breaches": breached,
            "nearest_pfz": nearest_pfz,
        }

        source = "PostGIS / OpenStreetMap Marine GIS (Demo Mode)" if self.demo_mode else "PostGIS Spatial Engine"
        metadata = {
            "real_api_mapping": "PostGIS ST_DWithin / ST_AsGeoJSON / pgRouting",
            "spatial_ref": "EPSG:4326 (WGS 84)"
        }

        return self.build_response(source=source, location=location, data=payload, metadata=metadata)

    def get_geofences(self, location: Dict[str, float]) -> List[Dict]:
        user_lat = location.get("lat", 17.6868)
        user_lon = location.get("lon", 83.2185)
        return zone_distances(user_lat, user_lon, GEOFENCES)

    def get_routes(
        self, start: Dict[str, float], end: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Compute route lengths deterministically using Haversine.
        PostGIS upgrade: use pgRouting + OSM maritime road graph.
        """
        result = []
        for route in ROUTES:
            wps = route["waypoints_latlon"]
            length_km = route_length_km([(wp[0], wp[1]) for wp in wps])
            length_nm = km_to_nm(length_km)
            # Estimate duration at avg 10 knots for fishing vessels
            duration_h = length_nm / 10.0
            hours = int(duration_h)
            mins = int((duration_h - hours) * 60)
            result.append({
                **route,
                "length_km": length_km,
                "length_nm": length_nm,
                "estimated_duration": f"{hours}h {mins:02d}m",
                "avg_speed_knots": 10,
            })
        return {
            "start": start,
            "end": end,
            "routes": result,
        }
