// =====================================================
// ORCA GeoUtils — Deterministic Spatial Calculations
// PostGIS-compatible geometry functions (no LLM)
// =====================================================

export const EARTH_RADIUS_KM = 6371;
export const NAUTICAL_MILE_KM = 1.852;

/** Convert degrees to radians */
export const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Haversine formula — accurate geodetic distance between two coordinates (km) */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Convert km to nautical miles */
export const kmToNM = (km: number): number =>
  parseFloat((km / NAUTICAL_MILE_KM).toFixed(1));

/** Bearing from point A to point B (degrees, 0–360) */
export function bearing(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Cardinal direction from bearing degrees */
export function cardinalDir(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

/** Point-in-polygon using ray casting (works for convex and concave polygons) */
export function pointInPolygon(
  lat: number, lon: number,
  polygon: [number, number][]
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0];
    const xj = polygon[j][1], yj = polygon[j][0];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Compute polygon centroid */
export function polygonCentroid(coords: [number, number][]): [number, number] {
  const n = coords.length;
  const lat = coords.reduce((s, c) => s + c[0], 0) / n;
  const lon = coords.reduce((s, c) => s + c[1], 0) / n;
  return [lat, lon];
}

/** Approximate polygon area in km² (Shoelace formula + scale) */
export function polygonAreaKm2(coords: [number, number][]): number {
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += toRad(coords[j][1] - coords[i][1]) *
      (2 + Math.sin(toRad(coords[i][0])) + Math.sin(toRad(coords[j][0])));
  }
  return Math.abs(area * EARTH_RADIUS_KM * EARTH_RADIUS_KM) / 2;
}

/** Returns nearest zone from user location */
export function nearestZone<T extends { center: [number, number] }>(
  userLat: number, userLon: number, zones: T[]
): T & { distanceKm: number } | null {
  if (!zones.length) return null;
  let nearest = zones[0];
  let minDist = haversineDistance(userLat, userLon, zones[0].center[0], zones[0].center[1]);
  for (const z of zones.slice(1)) {
    const d = haversineDistance(userLat, userLon, z.center[0], z.center[1]);
    if (d < minDist) { minDist = d; nearest = z; }
  }
  return { ...nearest, distanceKm: parseFloat(minDist.toFixed(1)) };
}

/**
 * PostGIS-compatible GeoJSON feature builders.
 * When PostGIS is connected, replace these with ST_AsGeoJSON() queries.
 */
export function makePointFeature(
  lat: number, lon: number,
  properties: Record<string, unknown>
): GeoJsonFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lon, lat] },
    properties,
  };
}

export function makePolygonFeature(
  coords: [number, number][],
  properties: Record<string, unknown>
): GeoJsonFeature {
  // GeoJSON: [lon, lat] order; close ring
  const ring = [...coords.map(([lat, lon]) => [lon, lat]), [coords[0][1], coords[0][0]]];
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [ring] },
    properties,
  };
}

export function makeLineFeature(
  coords: [number, number][],
  properties: Record<string, unknown>
): GeoJsonFeature {
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: coords.map(([lat, lon]) => [lon, lat]) },
    properties,
  };
}

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: unknown;
  };
  properties: Record<string, unknown>;
}
