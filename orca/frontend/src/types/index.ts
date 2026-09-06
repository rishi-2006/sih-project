// =====================================================
// ORCA — Shared TypeScript Types
// =====================================================

// --- Risk & Safety ---
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

export interface RiskAssessment {
  overall: RiskLevel;
  wind: RiskLevel;
  wave: RiskLevel;
  lightning: RiskLevel;
  cyclone: RiskLevel;
  visibility: RiskLevel;
  recommendation: string;
  reasons: string[];
  confidence: number;
}

// --- Weather ---
export interface WeatherData {
  temperature: number;
  temperatureUnit: string;
  windSpeed: number;
  windSpeedUnit: string;
  windDirection: string;
  waveHeight: number;
  waveHeightUnit: string;
  rainfall: string;
  visibility: number;
  visibilityUnit: string;
  humidity: number;
  forecast: string;
  source: DataSourceInfo;
}

// --- Ocean ---
export interface OceanData {
  sst: number;
  sstUnit: string;
  chlorophyll: number;
  chlorophyllUnit: string;
  condition: 'Favorable' | 'Moderate' | 'Unfavorable';
  currentSpeed: number;
  currentDirection: string;
  source: DataSourceInfo;
}

// --- Alerts ---
export interface Alert {
  id: string;
  type: 'cyclone' | 'lightning' | 'high_waves' | 'advisory' | 'storm_surge';
  severity: RiskLevel;
  title: string;
  description: string;
  distance?: number;
  distanceUnit?: string;
  direction?: string;
  validFrom: string;
  validUntil: string;
  source: DataSourceInfo;
}

// --- Fishing Zones ---
export interface FishingZone {
  id: string;
  name: string;
  center: [number, number]; // [lat, lng]
  boundary: [number, number][]; // polygon coords
  distance: number;
  distanceUnit: string;
  sst: number;
  chlorophyll: number;
  suitability: 'High' | 'Moderate' | 'Low';
  safetyScore: number; // 0-100
  risk: RiskLevel;
  hazards: string[];
  source: DataSourceInfo;
}

// --- Geofences ---
export interface Geofence {
  id: string;
  name: string;
  type: 'restricted' | 'mpa' | 'international_boundary' | 'ecological_sensitive';
  boundary: [number, number][];
  description: string;
  reason: string;
}

// --- Routes ---
export interface RouteData {
  shortest: RouteSegment;
  recommended: RouteSegment;
  hazardZones: HazardZone[];
}

export interface RouteSegment {
  name: string;
  distance: number;
  distanceUnit: string;
  duration: string;
  path: [number, number][];
  hazardExposure: RiskLevel;
  waypoints: string[];
}

export interface HazardZone {
  id: string;
  name: string;
  type: string;
  center: [number, number];
  radius: number;
  severity: RiskLevel;
}

// --- Agent Trace ---
export interface AgentStep {
  agentName: string;
  agentId: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  description: string;
  duration?: number; // in seconds
  result?: string;
  data?: Record<string, unknown>;
}

export interface AgentTrace {
  steps: AgentStep[];
  totalDuration: number;
  isDemo: boolean;
}

// --- Chat ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  analysisSteps?: AnalysisStep[];
  riskAssessment?: RiskAssessment;
  agentTrace?: AgentTrace;
  evidence?: EvidenceItem[];
  mapUpdates?: MapUpdate[];
  language?: string;
}

export interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number;
}

// --- Evidence ---
export interface EvidenceItem {
  category: string;
  source: string;
  timestamp: string;
  data: Record<string, string | number>;
  isDemo: boolean;
}

// --- Data Source ---
export interface DataSourceInfo {
  name: string;
  timestamp: string;
  isDemo: boolean;
}

// --- Map ---
export interface MapUpdate {
  type: 'center' | 'marker' | 'zone' | 'route' | 'hazard' | 'alert';
  data: Record<string, unknown>;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: 'fishing_zones' | 'hazards' | 'restricted' | 'routes' | 'sst' | 'chlorophyll' | 'geofences' | 'alerts';
}

// --- Chat API ---
export interface ChatRequest {
  message: string;
  location?: { lat: number; lon: number };
  language?: string;
  demoMode?: boolean;
}

export interface ChatResponse {
  message: ChatMessage;
  weatherData?: WeatherData;
  oceanData?: OceanData;
  alerts?: Alert[];
  riskAssessment?: RiskAssessment;
  fishingZones?: FishingZone[];
  agentTrace?: AgentTrace;
  evidence?: EvidenceItem[];
  mapUpdates?: MapUpdate[];
}

// --- App State ---
export interface AppState {
  demoMode: boolean;
  language: string;
  currentLocation: { lat: number; lon: number };
  selectedPage: string;
}
