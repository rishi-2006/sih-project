"""
ORCA — Geospatial Agent
Handles zone lookup, distance calculations, route selection, and geofence enforcement.
All spatial math is deterministic (geo_utils). No LLM-invented numbers.
"""
from typing import Dict, Any
from backend.agents.base import BaseAgent
from backend.data.adapters.geo_adapter import GeospatialAdapter


class GeospatialAgent(BaseAgent):
    def __init__(self):
        super().__init__("Geospatial Agent", "geo")
        self.adapter = GeospatialAdapter(demo_mode=True)

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        location = state.get("target_location", {"lat": 17.6868, "lon": 83.2185})

        # Fetch enriched geodata
        geo_info = self.adapter.fetch_data(location)

        # Compute routes
        nearest_pfz = geo_info.get("nearest_pfz", {})
        destination = (
            {"lat": nearest_pfz["center"][0], "lon": nearest_pfz["center"][1]}
            if nearest_pfz and nearest_pfz.get("center")
            else {"lat": 17.78, "lon": 83.46}
        )
        route_data = self.adapter.get_routes(location, destination)

        # Geofence breach warnings
        breaches = geo_info.get("geofence_breaches", [])

        # Fishing zone summary (closest 2 by distance)
        fishing_zones = geo_info.get("fishing_zones", [])[:2]

        # Build state keys for other agents
        state["geofences"] = geo_info.get("geofences", [])
        state["geofence_breaches"] = breaches
        state["nearest_pfz"] = nearest_pfz
        state["fishing_zones"] = fishing_zones
        state["routes"] = route_data.get("routes", [])

        # --- Build rich output ---
        nearest = nearest_pfz or {}
        breach_names = [b["name"] for b in breaches] if breaches else []

        zones_summary = "; ".join(
            f"{z['name']} ({z.get('distance_km', '?')} km {z.get('direction', '')})"
            for z in fishing_zones
        ) or "No PFZ data available"

        route_summary = "; ".join(
            f"{r['name']}: {r.get('length_km', '?')} km ({r.get('estimated_duration', '?')}) — {r['hazard_exposure']} hazard"
            for r in route_data.get("routes", [])
        )

        description = (
            f"Nearest PFZ: {nearest.get('name', 'N/A')} at "
            f"{nearest.get('distance_km', '?')} km / {nearest.get('distance_nm', '?')} NM "
            f"({nearest.get('direction', '?')} · {nearest.get('bearing_deg', '?')}°). "
            f"Geofence breaches: {breach_names if breach_names else 'None'}. "
            f"Routes computed: {len(route_data.get('routes', []))}."
        )

        return {
            "description": description,
            "summary": "Geospatial & Boundary Analysis Complete",
            "output": {
                "nearest_pfz": {
                    "name": nearest.get("name"),
                    "distance_km": nearest.get("distance_km"),
                    "distance_nm": nearest.get("distance_nm"),
                    "bearing_deg": nearest.get("bearing_deg"),
                    "direction": nearest.get("direction"),
                    "suitability": nearest.get("suitability"),
                },
                "fishing_zones": zones_summary,
                "geofence_breaches": breach_names,
                "routes": [
                    {
                        "name": r["name"],
                        "type": r["type"],
                        "length_km": r.get("length_km"),
                        "length_nm": r.get("length_nm"),
                        "duration": r.get("estimated_duration"),
                        "hazard_exposure": r["hazard_exposure"],
                    }
                    for r in route_data.get("routes", [])
                ],
                "route_recommendation": (
                    "Take the Recommended Safe Route (coastal inshore corridor). "
                    "Avoid shortest route — passes through HIGH WAVE ZONE."
                    if route_data.get("routes") else "No route data available."
                ),
            },
        }
