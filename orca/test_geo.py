from backend.utils.geo_utils import haversine_distance, km_to_nm, bearing, cardinal_dir
from backend.data.adapters.geo_adapter import GeospatialAdapter

d = haversine_distance(17.6868, 83.2185, 17.78, 83.46)
nm = km_to_nm(d)
brng = bearing(17.6868, 83.2185, 17.78, 83.46)
print("Distance:", round(d, 2), "km /", nm, "NM")

adapter = GeospatialAdapter(demo_mode=True)
loc = {"lat": 17.6868, "lon": 83.2185}
info = adapter.fetch_data(loc)
nearest = info["nearest_pfz"]
print("Nearest PFZ:", nearest["name"])
print("Distance:", nearest["distance_km"], "km /", nearest["distance_nm"], "NM")
print("Bearing:", nearest["bearing_deg"], "deg", nearest["direction"])

routes = adapter.get_routes(loc, {"lat": 17.78, "lon": 83.46})
for r in routes["routes"]:
    print("Route:", r["name"], "-", r["length_km"], "km,", r["estimated_duration"])

print("GEO TEST PASSED")
