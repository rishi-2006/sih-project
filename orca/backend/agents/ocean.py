from typing import Dict, Any
from backend.agents.base import BaseAgent
from backend.data.adapters.ocean_adapter import OceanAdapter

class OceanAgent(BaseAgent):
    def __init__(self):
        super().__init__("Ocean Agent", "ocean")
        self.adapter = OceanAdapter(demo_mode=True)

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        location = state.get("target_location", {"lat": 17.6868, "lon": 83.2185})
        raw_ocean = self.adapter.fetch_data(location)
        raw_zones = self.adapter.get_fishing_zones(location)

        ocean_payload = raw_ocean.get("data", raw_ocean)
        zones_payload = raw_zones.get("data", {}).get("fishingZones", raw_zones.get("fishingZones", []))
        if isinstance(raw_zones, list):
            zones_payload = raw_zones

        if "source" not in ocean_payload or not isinstance(ocean_payload["source"], dict):
            ocean_payload["source"] = {"name": "INCOIS Ocean State Forecast", "timestamp": "2026-09-05T12:00:00Z", "isDemo": True}

        state["ocean_data"] = ocean_payload
        state["fishing_zones"] = zones_payload

        sst = ocean_payload.get("sst", 29.1)
        chlorophyll = ocean_payload.get("chlorophyll", 0.8)
        zone_count = len(zones_payload)

        return {
            "description": f"Ocean conditions evaluated: SST {sst}°C, Chlorophyll {chlorophyll} mg/m³, {zone_count} potential fishing zones.",
            "summary": "Ocean & PFZ Parameters Evaluated",
            "output": {"ocean": ocean_payload, "fishing_zones": zones_payload}
        }
