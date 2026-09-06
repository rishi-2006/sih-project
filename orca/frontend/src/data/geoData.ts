// =====================================================
// ORCA — GeoJSON Demo Dataset
// Visakhapatnam Coastal Region
// All coordinates in [lat, lon] format for Leaflet
// GeoJSON features use [lon, lat] (standard GeoJSON)
// PostGIS-ready: every feature has a `postgis_query` hint
// =====================================================

export interface ZoneFeature {
  id: string;
  name: string;
  type: 'fishing' | 'hazard_cyclone' | 'hazard_wave' | 'hazard_lightning' |
        'restricted' | 'mpa' | 'geofence' | 'caution';
  severity: 'recommended' | 'caution' | 'hazardous' | 'restricted';
  center: [number, number]; // [lat, lon]
  coords?: [number, number][]; // [lat, lon] for Leaflet polygons
  radius?: number; // meters, for circle overlays
  properties: Record<string, string | number | boolean>;
  postgisHint?: string; // SQL hint for PostGIS integration
}

export interface RouteFeature {
  id: string;
  name: string;
  type: 'recommended' | 'shortest' | 'coastal';
  path: [number, number][]; // [lat, lon] waypoints
  distanceKm: number;
  distanceNM: number;
  duration: string;
  hazardExposure: 'LOW' | 'MODERATE' | 'HIGH';
  waypoints: string[];
  color: string;
  dashArray?: string;
  weight: number;
}

// ---- USER LOCATION ----
export const USER_LOCATION: [number, number] = [17.6868, 83.2185];
export const USER_LOCATION_NAME = 'Visakhapatnam Harbor';

// ---- POTENTIAL FISHING ZONES (PFZ) ----
// PostGIS: SELECT id, name, ST_AsGeoJSON(geometry) FROM fishing_zones WHERE ST_DWithin(geometry, ST_MakePoint($lon,$lat)::geography, $radius)
export const FISHING_ZONES: ZoneFeature[] = [
  {
    id: 'pfz-visakha-north',
    name: 'Visakha North PFZ (High Potential)',
    type: 'fishing',
    severity: 'caution', // High fish potential but risk today
    center: [17.78, 83.46],
    coords: [
      [17.82, 83.40], [17.82, 83.54],
      [17.73, 83.52], [17.72, 83.38],
    ],
    properties: {
      sst: '29.1°C', chlorophyll: '0.8 mg/m³',
      suitability: 'High', distance_km: 28.5,
      distance_nm: 15.4, safety: 'HIGH RISK today',
      isDemo: true,
    },
    postgisHint: "SELECT * FROM fishing_zones WHERE id='pfz-visakha-north'",
  },
  {
    id: 'pfz-bheemunipatnam',
    name: 'Bheemunipatnam Sector PFZ',
    type: 'fishing',
    severity: 'caution',
    center: [17.89, 83.52],
    coords: [
      [17.94, 83.46], [17.94, 83.60],
      [17.84, 83.57], [17.84, 83.43],
    ],
    properties: {
      sst: '28.8°C', chlorophyll: '0.6 mg/m³',
      suitability: 'Moderate', distance_km: 38.0,
      distance_nm: 20.5, safety: 'HIGH RISK today',
      isDemo: true,
    },
    postgisHint: "SELECT * FROM fishing_zones WHERE id='pfz-bheemunipatnam'",
  },
  {
    id: 'pfz-kakinada-south',
    name: 'Kakinada South Offshore PFZ',
    type: 'fishing',
    severity: 'recommended',
    center: [16.85, 82.35],
    coords: [
      [16.92, 82.28], [16.92, 82.44],
      [16.78, 82.42], [16.78, 82.26],
    ],
    properties: {
      sst: '28.4°C', chlorophyll: '1.1 mg/m³',
      suitability: 'High', distance_km: 112,
      distance_nm: 60.5, safety: 'LOW RISK — far from alert zone',
      isDemo: true,
    },
    postgisHint: "SELECT * FROM fishing_zones WHERE id='pfz-kakinada-south'",
  },
];

// ---- HAZARD ZONES ----
// PostGIS: SELECT * FROM hazard_zones WHERE ST_DWithin(geometry, ST_MakePoint($lon,$lat)::geography, 500000)
export const HAZARD_ZONES: ZoneFeature[] = [
  {
    id: 'hz-cyclone-bob',
    name: 'Cyclone Advisory Zone',
    type: 'hazard_cyclone',
    severity: 'hazardous',
    center: [17.20, 84.20],
    radius: 45000,
    properties: {
      alert_type: 'Cyclone Advisory',
      distance_km: 300, direction: 'East',
      wind_speed: '85 km/h (gusts 110 km/h)',
      movement: 'WNW @ 12 km/h',
      valid_until: '48 hours',
      source: 'DEMO DATA (IMD Cyclone Warning Center)',
      isDemo: true,
    },
    postgisHint: "SELECT * FROM hazard_zones WHERE type='cyclone' AND is_active=true",
  },
  {
    id: 'hz-high-wave-ap-coast',
    name: 'High Wave Advisory — AP Coast',
    type: 'hazard_wave',
    severity: 'hazardous',
    center: [17.35, 83.65],
    radius: 30000,
    properties: {
      wave_height: '2.4 – 3.1 m',
      period: '8–10 seconds',
      condition: 'Rough Sea',
      valid_until: '24 hours',
      source: 'DEMO DATA (INCOIS High Wave Warning)',
      isDemo: true,
    },
    postgisHint: "SELECT * FROM hazard_zones WHERE type='high_waves' AND severity IN ('HIGH','EXTREME')",
  },
  {
    id: 'hz-lightning-risk',
    name: 'Lightning Risk Zone',
    type: 'hazard_lightning',
    severity: 'caution',
    center: [17.60, 83.40],
    radius: 18000,
    properties: {
      thunderstorm_probability: '65%',
      condition: 'Convective activity',
      valid_until: '12 hours',
      source: 'DEMO DATA (IMD Thunderstorm Advisory)',
      isDemo: true,
    },
    postgisHint: "SELECT * FROM hazard_zones WHERE type='lightning'",
  },
];

// ---- GEOFENCES & RESTRICTED ZONES ----
// PostGIS: SELECT * FROM geofences WHERE ST_Intersects(geometry, ST_Buffer(ST_MakePoint($lon,$lat)::geography, $radius))
export const GEOFENCES: ZoneFeature[] = [
  {
    id: 'geo-imbl',
    name: 'International Maritime Boundary Line (IMBL)',
    type: 'restricted',
    severity: 'restricted',
    center: [17.10, 84.00],
    coords: [
      [18.20, 83.88], [18.20, 84.30],
      [16.00, 84.30], [16.00, 83.88],
    ],
    properties: {
      authority: 'Ministry of External Affairs / Indian Navy',
      penalty: 'Arrest and detention',
      do_not_cross: true,
      isDemo: true,
    },
    postgisHint: "SELECT * FROM geofences WHERE type='international_boundary'",
  },
  {
    id: 'geo-kambalakonda-mpa',
    name: 'Kambalakonda Marine Protected Area',
    type: 'mpa',
    severity: 'restricted',
    center: [17.76, 83.34],
    coords: [
      [17.80, 83.29], [17.82, 83.38],
      [17.73, 83.40], [17.71, 83.31],
    ],
    properties: {
      authority: 'AP Forest Dept / MoEFCC',
      protected_species: 'Coral, Sea Turtle, Dugong',
      fishing_prohibited: true,
      isDemo: true,
    },
    postgisHint: "SELECT * FROM geofences WHERE type='mpa'",
  },
  {
    id: 'geo-navy-exclusion',
    name: 'Naval Exercise Exclusion Zone',
    type: 'restricted',
    severity: 'restricted',
    center: [17.72, 83.58],
    coords: [
      [17.77, 83.53], [17.77, 83.65],
      [17.67, 83.63], [17.67, 83.51],
    ],
    properties: {
      authority: 'Eastern Naval Command',
      notam: 'NOTAM VIZAG 2026-09-04',
      valid_until: '48 hours',
      isDemo: true,
    },
    postgisHint: "SELECT * FROM geofences WHERE type='restricted' AND is_active=true",
  },
  {
    id: 'geo-cargo-lane',
    name: 'Cargo Traffic Separation Scheme',
    type: 'caution',
    severity: 'caution',
    center: [17.50, 83.30],
    coords: [
      [17.56, 83.22], [17.56, 83.38],
      [17.44, 83.38], [17.44, 83.22],
    ],
    properties: {
      authority: 'Visakhapatnam Port Authority',
      note: 'Heavy vessel traffic — exercise extreme caution',
      isDemo: true,
    },
    postgisHint: "SELECT * FROM geofences WHERE type='traffic_separation'",
  },
];

// ---- ROUTES ----
export const ROUTES: RouteFeature[] = [
  {
    id: 'route-recommended',
    name: 'Recommended Safe Route',
    type: 'recommended',
    path: [
      [17.6868, 83.2185], // Visakhapatnam Harbor
      [17.70, 83.26],     // Coastal inshore
      [17.72, 83.32],     // Clear of MPA buffer
      [17.75, 83.38],     // Coastal corridor
      [17.78, 83.44],     // Approach PFZ-1
      [17.79, 83.46],     // PFZ-1 entry
    ],
    distanceKm: 42.6,
    distanceNM: 23.0,
    duration: '2h 05m',
    hazardExposure: 'MODERATE',
    waypoints: ['Visakhapatnam Harbor', 'Coastal Inshore Corridor', 'Clear of MPA', 'PFZ-1'],
    color: '#22c55e',
    dashArray: '10, 6',
    weight: 4,
  },
  {
    id: 'route-shortest',
    name: 'Shortest Route (High Hazard Exposure)',
    type: 'shortest',
    path: [
      [17.6868, 83.2185], // Visakhapatnam Harbor
      [17.60, 83.42],     // Crosses high wave zone
      [17.50, 83.55],     // Near cyclone fringe
      [17.79, 83.46],     // PFZ-1
    ],
    distanceKm: 38.2,
    distanceNM: 20.6,
    duration: '1h 45m',
    hazardExposure: 'HIGH',
    waypoints: ['Visakhapatnam Harbor', 'HIGH WAVE ZONE', 'Cyclone Fringe', 'PFZ-1'],
    color: '#ef4444',
    dashArray: '4, 4',
    weight: 2,
  },
];

// ---- LAYER VISIBILITY CONFIG ----
export interface LayerConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  defaultVisible: boolean;
  tabKey: string;
}

export const LAYER_CONFIGS: LayerConfig[] = [
  { id: 'fishing',    label: 'Fishing Zones',   icon: '🐟', color: '#22c55e', defaultVisible: true,  tabKey: 'Fishing Zones' },
  { id: 'hazards',    label: 'Hazard Zones',     icon: '⚠️', color: '#ef4444', defaultVisible: true,  tabKey: 'Hazards' },
  { id: 'geofences',  label: 'Geofences',        icon: '🚫', color: '#64748b', defaultVisible: true,  tabKey: 'Geofences' },
  { id: 'routes',     label: 'Safe Route',       icon: '🗺️', color: '#22c55e', defaultVisible: true,  tabKey: 'Safe Route' },
  { id: 'sst',        label: 'SST Overlay',      icon: '🌡️', color: '#f59e0b', defaultVisible: false, tabKey: 'SST' },
  { id: 'chlorophyll',label: 'Chlorophyll',      icon: '🌿', color: '#16a34a', defaultVisible: false, tabKey: 'Chlorophyll' },
];
