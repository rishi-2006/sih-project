'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Home, MessageSquare, Map as MapIcon, Fish, CloudSun, AlertTriangle,
  Route, Database, FileText, Settings, Send, ChevronDown, ChevronRight,
  Search, Layers, Navigation, Anchor, Waves, Thermometer, Eye,
  Droplets, Wind, CloudLightning, Shield, Clock, CheckCircle2,
  XCircle, Loader2, MapPin, Info, TriangleAlert, CircleAlert, Sun, Moon
} from 'lucide-react';
import type {
  ChatMessage, AnalysisStep, RiskLevel, AgentStep,
  WeatherData, OceanData, Alert, RiskAssessment, EvidenceItem
} from '@/src/types';
import api from '@/src/services/api';

// Dynamic import for map (no SSR)
const MarineMap = dynamic(() => import('./components/MarineMap'), { ssr: false });

// =====================================================
// Demo Data (deterministic, clearly labeled)
// =====================================================
const DEMO_LOCATION = { lat: 17.6868, lon: 83.2185 };

const DEMO_WEATHER: WeatherData = {
  temperature: 28, temperatureUnit: '°C',
  windSpeed: 28, windSpeedUnit: 'km/h', windDirection: 'NE',
  waveHeight: 2.4, waveHeightUnit: 'm',
  rainfall: 'Moderate Rain', visibility: 8, visibilityUnit: 'km',
  humidity: 78, forecast: 'Deteriorating conditions expected',
  source: { name: 'Demo Weather Service', timestamp: new Date().toISOString(), isDemo: true },
};

const DEMO_OCEAN: OceanData = {
  sst: 29.1, sstUnit: '°C',
  chlorophyll: 0.8, chlorophyllUnit: 'mg/m³',
  condition: 'Moderate',
  currentSpeed: 1.2, currentDirection: 'SW',
  source: { name: 'Demo Ocean Service', timestamp: new Date().toISOString(), isDemo: true },
};

const DEMO_ALERTS: Alert[] = [
  {
    id: 'alert-1', type: 'cyclone', severity: 'MODERATE',
    title: 'Cyclone Alert', description: 'Cyclonic disturbance detected 300 km East',
    distance: 300, distanceUnit: 'km', direction: 'East',
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 48 * 3600000).toISOString(),
    source: { name: 'Demo Advisory Service', timestamp: new Date().toISOString(), isDemo: true },
  },
  {
    id: 'alert-2', type: 'high_waves', severity: 'HIGH',
    title: 'High Wave Warning', description: 'Wave heights expected to exceed 2.5m',
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 24 * 3600000).toISOString(),
    source: { name: 'Demo Advisory Service', timestamp: new Date().toISOString(), isDemo: true },
  },
];

const DEMO_RISK: RiskAssessment = {
  overall: 'HIGH',
  wind: 'HIGH', wave: 'HIGH', lightning: 'MODERATE', cyclone: 'MODERATE',
  visibility: 'LOW',
  recommendation: 'Not recommended to go fishing tomorrow morning.',
  reasons: [
    'Strong wind conditions (28 km/h, gusts expected higher)',
    'Elevated wave height (2.4m, rising trend)',
    'Active cyclone alert 300 km East',
    'Moderate rain reducing visibility',
  ],
  confidence: 0.85,
};

const DEMO_EVIDENCE: EvidenceItem[] = [
  {
    category: 'Weather Data',
    source: 'Demo Weather Service',
    timestamp: new Date().toISOString(),
    data: { 'Wind Speed': '28 km/h NE', 'Wave Height': '2.4 m', 'Rainfall': 'Moderate', 'Visibility': '8 km' },
    isDemo: true,
  },
  {
    category: 'Ocean Data',
    source: 'Demo Ocean Service',
    timestamp: new Date().toISOString(),
    data: { SST: '29.1°C', Chlorophyll: '0.8 mg/m³', Condition: 'Moderate', 'Current': '1.2 kn SW' },
    isDemo: true,
  },
  {
    category: 'Risk Engine',
    source: 'ORCA Risk Assessment Engine',
    timestamp: new Date().toISOString(),
    data: { 'Wind Risk': 'HIGH', 'Wave Risk': 'HIGH', 'Lightning Risk': 'MODERATE', 'Final Risk': 'HIGH' },
    isDemo: true,
  },
];

const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: 's1', label: 'Understanding intent', status: 'pending' },
  { id: 's2', label: 'Checking weather conditions', status: 'pending' },
  { id: 's3', label: 'Analyzing ocean parameters', status: 'pending' },
  { id: 's4', label: 'Checking hazard alerts', status: 'pending' },
  { id: 's5', label: 'Checking geofences & restricted zones', status: 'pending' },
  { id: 's6', label: 'Assessing overall risk', status: 'pending' },
];

const AGENT_TRACE: AgentStep[] = [
  { agentName: 'Planner Agent', agentId: 'planner', status: 'complete', description: 'Intent understood, agents selected', duration: 1.2 },
  { agentName: 'Weather Agent', agentId: 'weather', status: 'complete', description: 'Weather conditions analyzed', duration: 0.8 },
  { agentName: 'Ocean Agent', agentId: 'ocean', status: 'complete', description: 'Ocean conditions analyzed', duration: 1.1 },
  { agentName: 'Geospatial Agent', agentId: 'geo', status: 'complete', description: 'Location & geofences checked', duration: 0.6 },
  { agentName: 'Risk Assessment Agent', agentId: 'risk', status: 'complete', description: 'Risk calculated: HIGH', duration: 0.4 },
  { agentName: 'Reasoning Agent', agentId: 'reasoning', status: 'complete', description: 'Evidence synthesized', duration: 0.7 },
];

// Nav items
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'map', label: 'Marine Map', icon: MapIcon },
  { id: 'fishing', label: 'Fishing Zones', icon: Fish },
  { id: 'weather', label: 'Weather & Ocean', icon: CloudSun },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'route', label: 'Safe Route', icon: Route },
  { id: 'data', label: 'Data Sources', icon: Database },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' },
];

function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'LOW': return 'var(--green-400)';
    case 'MODERATE': return 'var(--amber-400)';
    case 'HIGH': return 'var(--red-400)';
    case 'EXTREME': return '#fca5a5';
  }
}

// =====================================================
// MAIN DASHBOARD
// =====================================================
export default function Dashboard() {
  const [activePage, setActivePage] = useState('home');
  const [demoMode, setDemoMode] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [currentRisk, setCurrentRisk] = useState<RiskAssessment | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [currentWeather] = useState<WeatherData>(DEMO_WEATHER);
  const [currentOcean] = useState<OceanData>(DEMO_OCEAN);
  const [currentAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [mapActiveTab, setMapActiveTab] = useState('Map');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, analysisSteps]);

  // Clock is computed only on the client after mount to avoid SSR/CSR text mismatch
  const [dateTime, setDateTime] = useState<{ date: string; time: string }>({ date: '', time: '' });

  useEffect(() => {
    const formatDateTime = () => {
      const now = new Date();
      return {
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).toUpperCase() + ' IST',
      };
    };
    setDateTime(formatDateTime());
    const interval = setInterval(() => setDateTime(formatDateTime()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleUserQuery = useCallback(async (query: string) => {
    const steps = ANALYSIS_STEPS.map(s => ({ ...s, status: 'pending' as const }));
    setAnalysisSteps(steps);
    setIsAnalyzing(true);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 200 + Math.random() * 200));
      setAnalysisSteps(prev => prev.map((s, idx) => ({
        ...s,
        status: idx < i ? 'complete' as const : idx === i ? 'running' as const : 'pending' as const,
      })));
      await new Promise(r => setTimeout(r, 150 + Math.random() * 150));
      setAnalysisSteps(prev => prev.map((s, idx) => ({
        ...s,
        status: idx <= i ? 'complete' as const : 'pending' as const,
      })));
    }

    try {
      const response = await api.chat(query, DEMO_LOCATION, language);
      setIsAnalyzing(false);
      if (response.riskAssessment) {
        setCurrentRisk(response.riskAssessment);
      }
      setMessages(prev => [...prev, response.message]);
    } catch {
      setIsAnalyzing(false);
      setCurrentRisk(DEMO_RISK);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: DEMO_RISK.recommendation,
        timestamp: new Date().toISOString(),
        riskAssessment: DEMO_RISK,
        agentTrace: { steps: AGENT_TRACE, totalDuration: 4.8, isDemo: true },
        evidence: DEMO_EVIDENCE,
      };
      setMessages(prev => [...prev, assistantMsg]);
    }
  }, [language]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isAnalyzing) return;

    const query = inputValue.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setShowTrace(false);
    setShowEvidence(false);
    handleUserQuery(query);
  }, [inputValue, isAnalyzing, handleUserQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const { date, time } = dateTime;

  const MAP_TABS = ['Map', 'SST', 'Chlorophyll', 'Fishing Zones', 'Hazards', 'Geofences', 'Safe Route'];

  return (
    <div className="app-layout">
      {/* ========== HEADER ========== */}
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo">🐋</div>
          <div className="header-title">
            <h1>ORCA</h1>
            <p>Marine Ecosystem Reasoning with Collaborative Agents</p>
          </div>
          <button
            className="theme-toggle"
            onClick={() => {
              const nextTheme = theme === 'dark' ? 'light' : 'dark';
              setTheme(nextTheme);
              document.documentElement.setAttribute('data-theme', nextTheme);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: 'var(--navy-800)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              marginLeft: 12,
              transition: 'all 0.15s ease',
            }}
            title="Toggle Dark / Light Mode"
            aria-label="Toggle dark or light theme"
          >
            {theme === 'dark' ? <Sun size={14} color="var(--amber-400)" /> : <Moon size={14} color="var(--cyan-400)" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <span className="header-tagline" style={{ marginLeft: 16 }}>
            Safer Seas &bull; Smarter Decisions &bull; Stronger Communities
          </span>
        </div>
        <div className="header-right">
          <div className="header-info">
            <div className="date" suppressHydrationWarning>{date && time ? `${date} | ${time}` : ''}</div>
          </div>
          <button
            className="demo-toggle"
            onClick={() => setDemoMode(!demoMode)}
            aria-label="Toggle demo mode"
          >
            <span className="dot" />
            Demo Mode
          </button>
          <select
            className="lang-selector"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            aria-label="Select language"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="app-body">
        {/* ========== SIDEBAR ========== */}
        <nav className="app-sidebar" role="navigation" aria-label="Main navigation">
          <div className="sidebar-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
                aria-current={activePage === item.id ? 'page' : undefined}
              >
                <item.icon />
                {item.label}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="user-avatar">FU</div>
            <div className="user-info">
              <div className="name">Fisherman User</div>
              <div className="role">
                <MapPin size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> Visakhapatnam, AP
              </div>
            </div>
          </div>
        </nav>

        {/* ========== MAIN CONTENT ========== */}
        <main className="app-main">
          {/* ---- CHAT PANEL (LEFT) ---- */}
          <section className="panel-left" aria-label="Chat panel">
            <div className="chat-panel">
              <div className="chat-header">
                <h2>
                  <MessageSquare size={16} />
                  Ask ORCA
                </h2>
                {demoMode && <span className="demo-badge">Demo Mode</span>}
              </div>

              <div className="chat-messages">
                {/* Welcome Message */}
                {messages.length === 0 && !isAnalyzing && (
                  <div className="msg-assistant animate-fade-in">
                    <div className="msg-assistant-inner">
                      <div className="msg-avatar">🐋</div>
                      <div className="msg-content">
                        <p style={{ fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
                          Welcome to ORCA
                        </p>
                        <p style={{ fontSize: 12.5, color: 'var(--gray-300)', lineHeight: 1.6 }}>
                          I&apos;m your marine intelligence assistant. Ask me about sea conditions, fishing safety, routes, or alerts near your coast.
                        </p>
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {[
                            'Is it safe to go fishing tomorrow morning?',
                            'Where is the nearest fishing zone?',
                            'What is the safest route to the fishing zone?',
                          ].map((q) => (
                            <button
                              key={q}
                              onClick={() => {
                                const userMsg: ChatMessage = {
                                  id: `msg-${Date.now()}`,
                                  role: 'user',
                                  content: q,
                                  timestamp: new Date().toISOString(),
                                };
                                setMessages(prev => [...prev, userMsg]);
                                handleUserQuery(q);
                              }}
                              style={{
                                background: 'var(--navy-700)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 8,
                                padding: '8px 12px',
                                fontSize: 12,
                                color: 'var(--cyan-400)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontFamily: 'inherit',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'var(--navy-600)'; }}
                              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'var(--navy-700)'; }}
                            >
                              &ldquo;{q}&rdquo;
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                {messages.map((msg) => (
                  <div key={msg.id} className={msg.role === 'user' ? 'msg-user animate-fade-in' : 'msg-assistant animate-fade-in'}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <div className="msg-assistant-inner">
                        <div className="msg-avatar">🐋</div>
                        <div className="msg-content">
                          {/* Risk Result */}
                          {msg.riskAssessment && (
                            <>
                              <p style={{ fontSize: 12.5, color: 'var(--gray-300)', marginBottom: 6 }}>
                                Analysis complete. Here&apos;s the result...
                              </p>
                              <div className={`risk-result-card risk-${msg.riskAssessment.overall}`}>
                                <span className={`risk-level-badge ${msg.riskAssessment.overall}`}>
                                  <Shield size={12} />
                                  {msg.riskAssessment.overall} RISK
                                </span>
                                <p style={{ fontSize: 13, marginTop: 8, fontWeight: 500 }}>
                                  {msg.riskAssessment.recommendation}
                                </p>
                                <div className="risk-reasons">
                                  {msg.riskAssessment.reasons.map((r, i) => (
                                    <div key={i} className="risk-reason">• {r}</div>
                                  ))}
                                </div>
                                <div style={{ marginTop: 10, padding: 8, background: 'rgba(255, 255, 255, 0.04)', borderRadius: 8, borderLeft: '3px solid var(--cyan-400)' }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan-400)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Anchor size={12} /> Recommended Action:
                                  </div>
                                  <div style={{ fontSize: 11.5, color: 'var(--gray-300)', lineHeight: 1.4 }}>
                                    Stay anchored in harbor. Avoid venturing beyond 5 nautical miles. Monitor INCOIS weather alerts.
                                  </div>
                                </div>
                                {demoMode && (
                                  <div style={{ marginTop: 8 }}>
                                    <span className="demo-badge">Demo Data</span>
                                  </div>
                                )}
                              </div>

                              {/* Evidence Toggle */}
                              <button
                                className="agent-trace-toggle"
                                onClick={() => setShowEvidence(!showEvidence)}
                                style={{ marginTop: 4 }}
                              >
                                {showEvidence ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                <Info size={12} />
                                View Evidence & Data Sources
                              </button>
                              {showEvidence && msg.evidence && (
                                <div className="evidence-panel animate-fade-in">
                                  {msg.evidence.map((ev, i) => (
                                    <div key={i} className="evidence-card">
                                      <div className="evidence-card-header">
                                        <span className="evidence-card-title">
                                          <Database size={12} />
                                          {ev.category}
                                        </span>
                                        <span className="evidence-card-source">
                                          {ev.isDemo && <span className="demo-badge" style={{ marginRight: 4 }}>Demo</span>}
                                          {ev.source}
                                        </span>
                                      </div>
                                      {Object.entries(ev.data).map(([k, v]) => (
                                        <div key={k} className="evidence-data-row">
                                          <span className="key">{k}</span>
                                          <span className="value" style={{
                                            color: String(v).includes('HIGH') ? 'var(--red-400)' :
                                              String(v).includes('MODERATE') ? 'var(--amber-400)' : '#fff'
                                          }}>{String(v)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Agent Trace Toggle */}
                              <button
                                className="agent-trace-toggle"
                                onClick={() => setShowTrace(!showTrace)}
                              >
                                {showTrace ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                <Layers size={12} />
                                How ORCA reached this decision
                              </button>
                              {showTrace && msg.agentTrace && (
                                <div className="agent-trace-content animate-fade-in">
                                  {msg.agentTrace.steps.map((step, i) => (
                                    <div key={i} className="trace-step">
                                      <div className="trace-step-left">
                                        <div className={`trace-step-icon ${step.status}`}>
                                          <CheckCircle2 size={12} />
                                        </div>
                                        <div>
                                          <div className="trace-step-name">{step.agentName}</div>
                                          <div className="trace-step-desc">{step.description}</div>
                                        </div>
                                      </div>
                                      <div className="trace-step-time">
                                        {step.duration?.toFixed(1)}s
                                      </div>
                                    </div>
                                  ))}
                                  <div className="trace-total">
                                    <span>Total execution time</span>
                                    <span>{msg.agentTrace.totalDuration.toFixed(1)}s</span>
                                  </div>
                                  {msg.agentTrace.isDemo && (
                                    <div style={{ marginTop: 8, textAlign: 'center' }}>
                                      <span className="demo-badge">Simulated Execution</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}

                          {/* Plain text response */}
                          {!msg.riskAssessment && (
                            <p style={{ fontSize: 13, lineHeight: 1.6 }}>{msg.content}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Active Analysis Steps */}
                {isAnalyzing && (
                  <div className="msg-assistant animate-fade-in">
                    <div className="msg-assistant-inner">
                      <div className="msg-avatar">🐋</div>
                      <div className="msg-content">
                        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                          <span style={{ color: 'var(--cyan-400)' }}>ORCA</span> Analyzing your request...
                        </p>
                        <div className="analysis-steps">
                          {analysisSteps.map(step => (
                            <div key={step.id} className={`analysis-step ${step.status}`}>
                              <span className="step-icon">
                                {step.status === 'complete' && <CheckCircle2 size={14} color="var(--green-400)" />}
                                {step.status === 'running' && <div className="step-spinner" />}
                                {step.status === 'pending' && <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--navy-600)' }} />}
                              </span>
                              {step.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-area">
                <div className="chat-input-wrapper">
                  <input
                    className="chat-input"
                    placeholder="Ask me anything about the sea..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isAnalyzing}
                    aria-label="Chat message input"
                  />
                  <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isAnalyzing}
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ---- MAP (CENTER) ---- */}
          <section className="panel-center" aria-label="Marine map">
            {/* Map Tabs */}
            <div className="map-tabs">
              {MAP_TABS.map(tab => (
                <button
                  key={tab}
                  className={`map-tab ${mapActiveTab === tab ? 'active' : ''}`}
                  onClick={() => setMapActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Map Search */}
            <div className="map-search">
              <Search size={14} color="var(--gray-400)" />
              <input placeholder="Search location..." aria-label="Search location on map" />
            </div>

            {/* Leaflet Map */}
            <MarineMap activeTab={mapActiveTab} />
          </section>

          {/* ---- CONDITIONS PANEL (RIGHT) ---- */}
          <aside className="panel-right" aria-label="Current conditions">
            {/* Weather */}
            <div className="conditions-section">
              <div className="conditions-section-header">
                <h3><CloudSun size={14} /> Weather</h3>
                <span className="demo-badge">Demo Data</span>
              </div>
              <div className="condition-card">
                <div className="condition-row">
                  <div>
                    <div className="condition-label">Temperature</div>
                    <div className="condition-value large">{currentWeather.temperature}{currentWeather.temperatureUnit}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                      {currentWeather.rainfall}
                    </div>
                  </div>
                  <div className="condition-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="condition-grid-item">
                      <div className="label">Wind</div>
                      <div className="value" style={{ color: 'var(--amber-400)' }}>
                        {currentWeather.windSpeed} {currentWeather.windSpeedUnit} {currentWeather.windDirection}
                      </div>
                    </div>
                    <div className="condition-grid-item">
                      <div className="label">Waves</div>
                      <div className="value" style={{ color: 'var(--red-400)' }}>
                        {currentWeather.waveHeight} {currentWeather.waveHeightUnit}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ocean */}
            <div className="conditions-section">
              <div className="conditions-section-header">
                <h3><Waves size={14} /> Ocean Conditions</h3>
              </div>
              <div className="condition-card">
                <div className="condition-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div className="condition-grid-item">
                    <div className="label">SST</div>
                    <div className="value">{currentOcean.sst}{currentOcean.sstUnit}</div>
                  </div>
                  <div className="condition-grid-item">
                    <div className="label">Chlorophyll</div>
                    <div className="value">{currentOcean.chlorophyll} {currentOcean.chlorophyllUnit}</div>
                  </div>
                  <div className="condition-grid-item">
                    <div className="label">Condition</div>
                    <div className="value" style={{ color: currentOcean.condition === 'Favorable' ? 'var(--green-400)' : 'var(--amber-400)' }}>
                      {currentOcean.condition}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="conditions-section">
              <div className="conditions-section-header">
                <h3><Shield size={14} /> Risk Assessment</h3>
              </div>
              <div className={`risk-card risk-${currentRisk?.overall || DEMO_RISK.overall}`}>
                <div className="condition-label">Current Assessment</div>
                <div className={`risk-card-level ${currentRisk?.overall || DEMO_RISK.overall}`}>
                  {currentRisk?.overall || DEMO_RISK.overall} RISK
                </div>
                <div className="risk-card-rec">
                  {currentRisk?.recommendation || DEMO_RISK.recommendation}
                </div>
                <div className="risk-card-reasons">
                  {(currentRisk?.reasons || DEMO_RISK.reasons).slice(0, 3).map((r, i) => (
                    <div key={i} className="risk-card-reason">
                      <span className="dot" style={{ background: getRiskColor(currentRisk?.overall || DEMO_RISK.overall) }} />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="conditions-section">
              <div className="conditions-section-header">
                <h3>
                  <AlertTriangle size={14} />
                  Active Alerts
                  <span style={{
                    background: 'var(--red-500)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    marginLeft: 4,
                  }}>{currentAlerts.length}</span>
                </h3>
                <span className="conditions-section-header .view-all" style={{ fontSize: 11, color: 'var(--cyan-400)', cursor: 'pointer' }}>
                  View All →
                </span>
              </div>
              {currentAlerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-item-left">
                    <div className={`alert-icon ${alert.severity === 'HIGH' || alert.severity === 'EXTREME' ? 'danger' : 'warning'}`}>
                      {alert.type === 'cyclone' ? <CloudLightning size={14} /> : <Waves size={14} />}
                    </div>
                    <div>
                      <div className="alert-title">{alert.title}</div>
                      <div className="alert-detail">
                        {alert.distance ? `${alert.distance} ${alert.distanceUnit} ${alert.direction}` : 'Next 24 hours'}
                      </div>
                    </div>
                  </div>
                  <span className={`alert-severity ${alert.severity}`}>{alert.severity}</span>
                </div>
              ))}
            </div>

            {/* Recommended Action Panel */}
            <div className="conditions-section">
              <div className="conditions-section-header">
                <h3><Anchor size={14} /> Recommended Actions</h3>
              </div>
              <div className="condition-card" style={{ borderLeft: '3px solid var(--amber-400)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber-400)', marginBottom: 6 }}>
                  ⚠️ Safety Action Guidelines
                </div>
                <ul style={{ fontSize: 11.5, color: 'var(--gray-300)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4, lineHeight: 1.4 }}>
                  <li>Do not venture into offshore waters tomorrow morning.</li>
                  <li>Secure all fishing vessels at Visakhapatnam Fishing Harbour.</li>
                  <li>Monitor active IMD & INCOIS cyclone advisories.</li>
                  <li>Follow safe coastal corridor if emergency transit is required.</li>
                </ul>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
