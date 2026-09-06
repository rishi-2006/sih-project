"""
ORCA — GeoSpatial Utilities (Python / Backend)
Deterministic spatial math — no LLM involvement.
PostGIS-compatible geometry function signatures.
"""
import math
from typing import Tuple, List, Dict, Any, Optional

EARTH_RADIUS_KM = 6371.0
NAUTICAL_MILE_KM = 1.852


def to_rad(deg: float) -> float:
    return deg * math.pi / 180


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Accurate geodetic distance between two WGS-84 coordinates (km)."""
    d_lat = to_rad(lat2 - lat1)
    d_lon = to_rad(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.sin(d_lon / 2) ** 2)
    return EARTH_RADIUS_KM * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def km_to_nm(km: float) -> float:
    """Kilometres to nautical miles."""
    return round(km / NAUTICAL_MILE_KM, 1)


def bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Initial bearing (degrees 0–360) from point A to point B."""
    d_lon = to_rad(lon2 - lon1)
    y = math.sin(d_lon) * math.cos(to_rad(lat2))
    x = (math.cos(to_rad(lat1)) * math.sin(to_rad(lat2)) -
         math.sin(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.cos(d_lon))
    return (math.atan2(y, x) * 180 / math.pi + 360) % 360


def cardinal_dir(deg: float) -> str:
    dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return dirs[round(deg / 45) % 8]


def point_in_polygon(lat: float, lon: float, polygon: List[Tuple[float, float]]) -> bool:
    """Ray-casting algorithm for point-in-polygon test. Coords as (lat, lon)."""
    inside = False
    n = len(polygon)
    for i in range(n):
        j = (i - 1) % n
        xi, yi = polygon[i][1], polygon[i][0]
        xj, yj = polygon[j][1], polygon[j][0]
        if (yi > lat) != (yj > lat):
            if lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
                inside = not inside
    return inside


def polygon_area_km2(coords: List[Tuple[float, float]]) -> float:
    """Approximate polygon area in km² (Shoelace + spherical scale)."""
    area = 0.0
    n = len(coords)
    for i in range(n):
        j = (i + 1) % n
        area += to_rad(coords[j][1] - coords[i][1]) * (
            2 + math.sin(to_rad(coords[i][0])) + math.sin(to_rad(coords[j][0]))
        )
    return abs(area * EARTH_RADIUS_KM ** 2) / 2


def polygon_centroid(coords: List[Tuple[float, float]]) -> Tuple[float, float]:
    n = len(coords)
    return (sum(c[0] for c in coords) / n, sum(c[1] for c in coords) / n)


def nearest_zone(user_lat: float, user_lon: float, zones: List[Dict]) -> Optional[Dict]:
    """Find nearest zone by Haversine distance."""
    if not zones:
        return None
    def dist(z):
        c = z.get("center", [0, 0])
        return haversine_distance(user_lat, user_lon, c[0], c[1])
    nearest = min(zones, key=dist)
    d = dist(nearest)
    return {
        **nearest,
        "distance_km": round(d, 1),
        "distance_nm": km_to_nm(d),
        "bearing_deg": round(bearing(user_lat, user_lon, nearest["center"][0], nearest["center"][1]), 1),
        "direction": cardinal_dir(bearing(user_lat, user_lon, nearest["center"][0], nearest["center"][1])),
    }


def route_length_km(waypoints: List[Tuple[float, float]]) -> float:
    """Compute total route length from a list of (lat, lon) waypoints."""
    total = 0.0
    for i in range(len(waypoints) - 1):
        total += haversine_distance(waypoints[i][0], waypoints[i][1],
                                    waypoints[i+1][0], waypoints[i+1][1])
    return round(total, 2)


def geofence_check(
    user_lat: float, user_lon: float,
    geofences: List[Dict]
) -> List[Dict]:
    """Return all geofences that contain the user's location."""
    breached = []
    for gf in geofences:
        if gf.get("coords"):
            coords = [(c[0], c[1]) for c in gf["coords"]]
            if point_in_polygon(user_lat, user_lon, coords):
                breached.append({
                    "id": gf["id"],
                    "name": gf["name"],
                    "type": gf["type"],
                    "severity": gf["severity"],
                })
    return breached


def make_geojson_feature(geometry_type: str, coordinates, properties: Dict) -> Dict:
    """PostGIS-compatible GeoJSON Feature builder."""
    return {
        "type": "Feature",
        "geometry": {"type": geometry_type, "coordinates": coordinates},
        "properties": properties,
    }


def zone_distances(user_lat: float, user_lon: float, zones: List[Dict]) -> List[Dict]:
    """Compute distance + bearing to each zone center. Returns enriched zone list."""
    result = []
    for z in zones:
        c = z.get("center", [0, 0])
        d = haversine_distance(user_lat, user_lon, c[0], c[1])
        brng = bearing(user_lat, user_lon, c[0], c[1])
        result.append({
            **z,
            "distance_km": round(d, 1),
            "distance_nm": km_to_nm(d),
            "bearing_deg": round(brng, 1),
            "direction": cardinal_dir(brng),
        })
    return sorted(result, key=lambda z: z["distance_km"])
