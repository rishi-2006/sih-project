'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Circle,
  Polygon, Polyline, Tooltip, useMap, ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  haversineDistance, kmToNM, bearing, cardinalDir,
  pointInPolygon, nearestZone,
} from '@/src/utils/geoUtils';
import {
  USER_LOCATION, USER_LOCATION_NAME,
  FISHING_ZONES, HAZARD_ZONES, GEOFENCES, ROUTES,
  LAYER_CONFIGS, ZoneFeature,
} from '@/src/data/geoData';

/* ── Fix Leaflet icon paths in Next.js ── */
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

/* ── Custom SVG Markers ── */
function makeIcon(color: string, emoji: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <ellipse cx="20" cy="46" rx="8" ry="3" fill="rgba(0,0,0,0.3)"/>
      <path d="M20 2 C10 2 4 10 4 18 C4 30 20 44 20 44 C20 44 36 30 36 18 C36 10 30 2 20 2 Z"
            fill="${color}" stroke="white" stroke-width="2" filter="url(#shadow)"/>
      <text x="20" y="22" text-anchor="middle" dominant-baseline="middle" font-size="14">${emoji}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
}

const ICONS = {
  user:     makeIcon('#06b6d4', '📍'),
  fishing:  makeIcon('#22c55e', '🐟'),
  hazard:   makeIcon('#ef4444', '⚠️'),
  caution:  makeIcon('#f59e0b', '⚡'),
  restrict: makeIcon('#64748b', '🚫'),
};

/* ── Severity → styling map ── */
const SEVERITY_STYLES: Record<ZoneFeature['severity'], { color: string; fill: string; opacity: number }> = {
  recommended: { color: '#22c55e', fill: '#22c55e', opacity: 0.22 },
  caution:     { color: '#f59e0b', fill: '#f59e0b', opacity: 0.20 },
  hazardous:   { color: '#ef4444', fill: '#ef4444', opacity: 0.28 },
  restricted:  { color: '#64748b', fill: '#475569', opacity: 0.35 },
};

/* ── Map control helpers ── */
function FlyToUser({ center }: { center: [number, number] }) {
  const map = useMap();
  const fly = useCallback(() => { map.flyTo(center, 10, { duration: 1.2 }); }, [map, center]);
  useEffect(() => { fly(); }, [fly]);
  return null;
}

function MapControls({ onReset }: { onReset: () => void }) {
  return (
    <div className="orca-map-controls">
      <button onClick={onReset} title="Recenter to Visakhapatnam">🎯</button>
    </div>
  );
}

/* ── Distance Ruler Overlay (static info panel) ── */
function DistancePanel({ userLat, userLon, activeLayerIds }: {
  userLat: number; userLon: number; activeLayerIds: Set<string>;
}) {
  const visible = activeLayerIds.has('fishing');
  if (!visible) return null;
  const nearest = nearestZone(userLat, userLon, FISHING_ZONES);
  if (!nearest) return null;

  const dist = haversineDistance(userLat, userLon, nearest.center[0], nearest.center[1]);
  const nm = kmToNM(dist);
  const brng = bearing(userLat, userLon, nearest.center[0], nearest.center[1]);
  const dir = cardinalDir(brng);

  return (
    <div className="orca-distance-panel">
      <div className="orca-dp-title">📏 Nearest PFZ</div>
      <div className="orca-dp-name">{nearest.name}</div>
      <div className="orca-dp-row">
        <span className="orca-dp-val">{dist.toFixed(1)} km</span>
        <span className="orca-dp-sep">·</span>
        <span className="orca-dp-val">{nm} NM</span>
      </div>
      <div className="orca-dp-dir">
        {dir} · {Math.round(brng)}°
      </div>
    </div>
  );
}

/* ── Geofence breach indicator ── */
function GeofenceStatus({ userLat, userLon }: { userLat: number; userLon: number }) {
  const breached = GEOFENCES.filter(z =>
    z.coords ? pointInPolygon(userLat, userLon, z.coords) : false
  );
  if (!breached.length) return null;
  return (
    <div className="orca-geofence-alert">
      🚨 Location inside: {breached.map(z => z.name).join(', ')}
    </div>
  );
}

/* ── Legend ── */
function MapLegend() {
  return (
    <div className="orca-map-legend">
      <div className="orca-legend-title">Map Legend</div>
      {[
        { color: '#22c55e', label: 'Safe / Recommended' },
        { color: '#f59e0b', label: 'Caution Zone' },
        { color: '#ef4444', label: 'Hazardous Zone' },
        { color: '#64748b', label: 'Restricted / No-Go' },
      ].map(({ color, label }) => (
        <div key={label} className="orca-legend-row">
          <div className="orca-legend-swatch" style={{ background: color }} />
          <span>{label}</span>
        </div>
      ))}
      <div className="orca-legend-row">
        <div className="orca-legend-swatch" style={{ background: '#22c55e', border: '1px dashed #22c55e', opacity: 0.7 }} />
        <span>Safe Route</span>
      </div>
      <div className="orca-legend-row">
        <div className="orca-legend-swatch" style={{ background: '#ef4444', border: '1px dashed #ef4444', opacity: 0.5 }} />
        <span>Risk Route</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                  */
/* ─────────────────────────────────────────────────────────────── */

interface MarineMapProps {
  activeTab?: string;
  userLat?: number;
  userLon?: number;
  analysisResult?: any; // live analysis output from agents
}

export default function MarineMap({
  activeTab = 'Map',
  userLat = USER_LOCATION[0],
  userLon = USER_LOCATION[1],
  analysisResult,
}: MarineMapProps) {
  const [mounted, setMounted] = useState(false);
  const [activeLayerIds, setActiveLayerIds] = useState<Set<string>>(
    new Set(LAYER_CONFIGS.filter(l => l.defaultVisible).map(l => l.id))
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(USER_LOCATION);
  const [selectedZone, setSelectedZone] = useState<ZoneFeature | null>(null);

  useEffect(() => {
    fixLeafletIcons();
    setMounted(true);
  }, []);

  // Sync selected zone with activeTab
  useEffect(() => {
    const tab = activeTab.toLowerCase();
    if (tab === 'fishing zones') setActiveLayerIds(new Set(['fishing']));
    else if (tab === 'hazards') setActiveLayerIds(new Set(['hazards']));
    else if (tab === 'geofences') setActiveLayerIds(new Set(['geofences']));
    else if (tab === 'safe route') setActiveLayerIds(new Set(['fishing', 'routes']));
    else if (tab === 'map') setActiveLayerIds(new Set(LAYER_CONFIGS.filter(l => l.defaultVisible).map(l => l.id)));
  }, [activeTab]);

  const toggleLayer = (layerId: string) => {
    setActiveLayerIds(prev => {
      const next = new Set(prev);
      next.has(layerId) ? next.delete(layerId) : next.add(layerId);
      return next;
    });
  };

  const showFishing   = activeLayerIds.has('fishing');
  const showHazards   = activeLayerIds.has('hazards');
  const showGeofences = activeLayerIds.has('geofences');
  const showRoutes    = activeLayerIds.has('routes');

  if (!mounted) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--panel-bg)', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
          <div>Loading Marine Map…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>

      {/* ── Layer Toggle Controls ── */}
      <div className="orca-layer-controls">
        {LAYER_CONFIGS.map(layer => (
          <button
            key={layer.id}
            className={`orca-layer-btn ${activeLayerIds.has(layer.id) ? 'active' : ''}`}
            style={{ '--layer-color': layer.color } as React.CSSProperties}
            onClick={() => toggleLayer(layer.id)}
            title={layer.label}
          >
            <span>{layer.icon}</span>
            <span>{layer.label}</span>
          </button>
        ))}
      </div>

      {/* ── Distance Panel ── */}
      <DistancePanel userLat={userLat} userLon={userLon} activeLayerIds={activeLayerIds} />

      {/* ── Geofence Breach Alert ── */}
      <GeofenceStatus userLat={userLat} userLon={userLon} />

      {/* ── Legend ── */}
      <MapLegend />

      {/* ── Leaflet Map ── */}
      <MapContainer
        center={mapCenter}
        zoom={9}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        <FlyToUser center={mapCenter} />

        {/* ── USER LOCATION ── */}
        <Marker position={[userLat, userLon]} icon={ICONS.user}>
          <Popup>
            <div className="orca-popup">
              <div className="orca-popup-title" style={{ color: '#06b6d4' }}>📍 {USER_LOCATION_NAME}</div>
              <div className="orca-popup-row"><span>Lat:</span><span>{userLat.toFixed(4)}° N</span></div>
              <div className="orca-popup-row"><span>Lon:</span><span>{userLon.toFixed(4)}° E</span></div>
              <div className="orca-popup-row"><span>Status:</span><span>Current Position</span></div>
            </div>
          </Popup>
        </Marker>

        {/* ── POTENTIAL FISHING ZONES ── */}
        {showFishing && FISHING_ZONES.map(zone => {
          const style = SEVERITY_STYLES[zone.severity];
          const distKm = haversineDistance(userLat, userLon, zone.center[0], zone.center[1]);
          const distNM = kmToNM(distKm);
          const brng = bearing(userLat, userLon, zone.center[0], zone.center[1]);
          const inside = zone.coords ? pointInPolygon(userLat, userLon, zone.coords) : false;

          return (
            <React.Fragment key={zone.id}>
              {zone.coords && (
                <Polygon
                  positions={zone.coords}
                  pathOptions={{
                    color: style.color,
                    fillColor: style.fill,
                    fillOpacity: style.opacity,
                    weight: 2.5,
                    dashArray: '6, 4',
                  }}
                  eventHandlers={{ click: () => setSelectedZone(zone) }}
                >
                  <Popup>
                    <div className="orca-popup">
                      <div className="orca-popup-title" style={{ color: style.color }}>
                        🐟 {zone.name}
                      </div>
                      <div className="orca-popup-badge" style={{ background: style.color }}>
                        {zone.properties.suitability as string} Suitability
                      </div>
                      <div className="orca-popup-row"><span>SST:</span><span>{zone.properties.sst as string}</span></div>
                      <div className="orca-popup-row"><span>Chlorophyll:</span><span>{zone.properties.chlorophyll as string}</span></div>
                      <div className="orca-popup-row"><span>Distance:</span><span>{distKm.toFixed(1)} km · {distNM} NM</span></div>
                      <div className="orca-popup-row"><span>Bearing:</span><span>{cardinalDir(brng)} · {Math.round(brng)}°</span></div>
                      <div className="orca-popup-row"><span>Status:</span><span style={{ color: style.color }}>{zone.properties.safety as string}</span></div>
                      {inside && <div className="orca-popup-inside">⚡ YOU ARE IN THIS ZONE</div>}
                      <div className="orca-popup-hint">PostGIS: {zone.postgisHint}</div>
                    </div>
                  </Popup>
                  <Tooltip sticky>
                    <span style={{ color: style.color, fontWeight: 700, fontSize: 11 }}>
                      🐟 {zone.name.split(' ')[0]} · {distKm.toFixed(0)} km
                    </span>
                  </Tooltip>
                </Polygon>
              )}
            </React.Fragment>
          );
        })}

        {/* ── HAZARD ZONES ── */}
        {showHazards && HAZARD_ZONES.map(zone => {
          const style = SEVERITY_STYLES[zone.severity];
          const icon = zone.type === 'hazard_cyclone' ? '🌀'
            : zone.type === 'hazard_wave' ? '🌊' : '⚡';
          const distKm = haversineDistance(userLat, userLon, zone.center[0], zone.center[1]);

          return (
            <Circle
              key={zone.id}
              center={zone.center}
              radius={zone.radius || 25000}
              pathOptions={{
                color: style.color,
                fillColor: style.fill,
                fillOpacity: style.opacity,
                weight: 2.5,
              }}
              eventHandlers={{ click: () => setSelectedZone(zone) }}
            >
              <Popup>
                <div className="orca-popup">
                  <div className="orca-popup-title" style={{ color: style.color }}>
                    {icon} {zone.name}
                  </div>
                  <div className="orca-popup-badge" style={{ background: style.color }}>
                    {zone.severity.toUpperCase()}
                  </div>
                  <div className="orca-popup-row"><span>Distance from you:</span><span>{distKm.toFixed(0)} km</span></div>
                  {zone.properties.wind_speed && (
                    <div className="orca-popup-row"><span>Wind Speed:</span><span>{zone.properties.wind_speed as string}</span></div>
                  )}
                  {zone.properties.wave_height && (
                    <div className="orca-popup-row"><span>Wave Height:</span><span>{zone.properties.wave_height as string}</span></div>
                  )}
                  {zone.properties.thunderstorm_probability && (
                    <div className="orca-popup-row"><span>Thunderstorm:</span><span>{zone.properties.thunderstorm_probability as string}</span></div>
                  )}
                  <div className="orca-popup-row"><span>Valid Until:</span><span>{zone.properties.valid_until as string}</span></div>
                  <div className="orca-popup-row"><span>Source:</span><span style={{ fontSize: 10 }}>{zone.properties.source as string}</span></div>
                </div>
              </Popup>
              <Tooltip permanent direction="center">
                <span style={{ color: style.color, fontWeight: 700, fontSize: 11 }}>
                  {icon} {zone.name.split(' ').slice(0, 3).join(' ')}
                </span>
              </Tooltip>
            </Circle>
          );
        })}

        {/* ── GEOFENCES & RESTRICTED ZONES ── */}
        {showGeofences && GEOFENCES.map(zone => {
          const style = SEVERITY_STYLES[zone.severity];
          const icon = zone.type === 'restricted' ? '⛔'
            : zone.type === 'mpa' ? '🐢'
            : zone.type === 'caution' ? '⚠️' : '🚫';
          return (
            <React.Fragment key={zone.id}>
              {zone.coords && (
                <Polygon
                  positions={zone.coords}
                  pathOptions={{
                    color: style.color,
                    fillColor: style.fill,
                    fillOpacity: style.opacity,
                    weight: 2,
                    dashArray: '8, 6',
                  }}
                  eventHandlers={{ click: () => setSelectedZone(zone) }}
                >
                  <Popup>
                    <div className="orca-popup">
                      <div className="orca-popup-title" style={{ color: style.color }}>
                        {icon} {zone.name}
                      </div>
                      <div className="orca-popup-badge" style={{ background: style.color }}>
                        {zone.severity.toUpperCase()}
                      </div>
                      <div className="orca-popup-row"><span>Authority:</span><span>{zone.properties.authority as string}</span></div>
                      {zone.properties.penalty && (
                        <div className="orca-popup-row"><span>Penalty:</span><span>{zone.properties.penalty as string}</span></div>
                      )}
                      {zone.properties.protected_species && (
                        <div className="orca-popup-row"><span>Protected:</span><span>{zone.properties.protected_species as string}</span></div>
                      )}
                      {zone.properties.notam && (
                        <div className="orca-popup-row"><span>NOTAM:</span><span>{zone.properties.notam as string}</span></div>
                      )}
                      {zone.properties.valid_until && (
                        <div className="orca-popup-row"><span>Until:</span><span>{zone.properties.valid_until as string}</span></div>
                      )}
                    </div>
                  </Popup>
                  <Tooltip permanent direction="center">
                    <span style={{ color: style.color, fontWeight: 700, fontSize: 10 }}>
                      {icon} {zone.name.split(' ').slice(0, 3).join(' ')}
                    </span>
                  </Tooltip>
                </Polygon>
              )}
            </React.Fragment>
          );
        })}

        {/* ── ROUTE VISUALIZATIONS ── */}
        {showRoutes && ROUTES.map(route => {
          const badge = route.hazardExposure === 'LOW' ? '🟢'
            : route.hazardExposure === 'MODERATE' ? '🟡' : '🔴';
          return (
            <React.Fragment key={route.id}>
              {/* Waypoint markers on recommended route */}
              {route.type === 'recommended' && route.path.map((pos, i) => (
                i > 0 && i < route.path.length - 1 ? (
                  <Circle
                    key={`wp-${route.id}-${i}`}
                    center={pos}
                    radius={400}
                    pathOptions={{ color: route.color, fillColor: route.color, fillOpacity: 0.9, weight: 1 }}
                  >
                    <Tooltip>
                      <span style={{ fontSize: 10, color: route.color }}>
                        WP{i}: {route.waypoints[i] || 'Waypoint'}
                      </span>
                    </Tooltip>
                  </Circle>
                ) : null
              ))}

              <Polyline
                positions={route.path}
                pathOptions={{
                  color: route.color,
                  weight: route.weight,
                  opacity: route.type === 'recommended' ? 0.95 : 0.65,
                  dashArray: route.dashArray,
                }}
              >
                <Popup>
                  <div className="orca-popup">
                    <div className="orca-popup-title" style={{ color: route.color }}>
                      {badge} {route.name}
                    </div>
                    <div className="orca-popup-row"><span>Distance:</span><span>{route.distanceKm} km · {route.distanceNM} NM</span></div>
                    <div className="orca-popup-row"><span>Duration:</span><span>{route.duration}</span></div>
                    <div className="orca-popup-row"><span>Hazard Exposure:</span><span style={{ color: route.color }}>{route.hazardExposure}</span></div>
                    <div style={{ marginTop: 6, fontSize: 10, color: '#64748b' }}>
                      <strong>Waypoints:</strong><br />
                      {route.waypoints.map((wp, i) => <div key={i}>→ {wp}</div>)}
                    </div>
                  </div>
                </Popup>
                <Tooltip sticky>
                  <span style={{ color: route.color, fontWeight: 700, fontSize: 11 }}>
                    {badge} {route.name} ({route.distanceKm} km · {route.duration})
                  </span>
                </Tooltip>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* ── DEMO "FISH SCHOOL" MARKERS inside recommended zone ── */}
        {showFishing && [
          { pos: [17.76, 83.43] as [number, number], density: 'High', species: 'Tuna, Sardines' },
          { pos: [17.80, 83.48] as [number, number], density: 'Medium', species: 'Mackerel' },
        ].map((spot, i) => (
          <Marker key={`fish-${i}`} position={spot.pos} icon={ICONS.fishing}>
            <Popup>
              <div className="orca-popup">
                <div className="orca-popup-title" style={{ color: '#22c55e' }}>🐟 Fish School Hotspot</div>
                <div className="orca-popup-row"><span>Density:</span><span>{spot.density}</span></div>
                <div className="orca-popup-row"><span>Species:</span><span>{spot.species}</span></div>
                <div className="orca-popup-row"><span>Source:</span><span>INCOIS PFZ Bulletin (Demo)</span></div>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>

      {/* ── Selected Zone Detail Panel ── */}
      {selectedZone && (
        <div className="orca-zone-detail">
          <button className="orca-zone-close" onClick={() => setSelectedZone(null)}>×</button>
          <div className="orca-zone-detail-title">{selectedZone.name}</div>
          <div className="orca-zone-detail-badge" style={{ background: SEVERITY_STYLES[selectedZone.severity].color }}>
            {selectedZone.severity.toUpperCase()}
          </div>
          {Object.entries(selectedZone.properties)
            .filter(([k]) => k !== 'isDemo')
            .map(([k, v]) => (
              <div key={k} className="orca-zone-detail-row">
                <span>{k.replace(/_/g, ' ')}:</span>
                <span>{String(v)}</span>
              </div>
            ))}
          {selectedZone.postgisHint && (
            <div className="orca-zone-detail-hint">
              <div style={{ color: '#64748b', fontSize: 9, marginBottom: 2 }}>PostGIS SQL</div>
              <code style={{ fontSize: 9, wordBreak: 'break-all' }}>{selectedZone.postgisHint}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
