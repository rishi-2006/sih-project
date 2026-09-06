// =====================================================
// ORCA — Frontend API Service
// =====================================================
import type { ChatResponse, WeatherData, OceanData, Alert, FishingZone, RiskAssessment } from '@/src/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  chat: (message: string, location?: { lat: number; lon: number }, language?: string) =>
    apiFetch<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, location, language, demoMode: true }),
    }),

  sendChat: (message: string, location?: { lat: number; lon: number }, language?: string) =>
    apiFetch<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, location, language, demoMode: true }),
    }),

  getWeather: (lat: number, lon: number) =>
    apiFetch<WeatherData>(`/api/weather?lat=${lat}&lon=${lon}`),

  getOcean: (lat: number, lon: number) =>
    apiFetch<OceanData>(`/api/ocean?lat=${lat}&lon=${lon}`),

  getAlerts: (lat: number, lon: number) =>
    apiFetch<Alert[]>(`/api/alerts?lat=${lat}&lon=${lon}`),

  getGeospatial: (lat: number, lon: number) =>
    apiFetch<any>(`/api/geospatial?lat=${lat}&lon=${lon}`),

  getFishingZones: (lat: number, lon: number) =>
    apiFetch<FishingZone[]>(`/api/fishing-zones?lat=${lat}&lon=${lon}`),

  getRisk: (lat: number, lon: number) =>
    apiFetch<RiskAssessment>(`/api/risk?lat=${lat}&lon=${lon}`),

  getRoute: (start: { lat: number; lon: number }, end: { lat: number; lon: number }) =>
    apiFetch<import('@/src/types').RouteData>('/api/route', {
      method: 'POST',
      body: JSON.stringify({ start, end }),
    }),
};

export default api;
