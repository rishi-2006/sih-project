# ORCA — Marine Ecosystem Reasoning with Collaborative Agents
> **Smart India Hackathon (SIH) Project — Problem Statement ID: 26176**  
> *Agentic AI-Powered Marine Intelligence & Decision-Support Platform*

---

## 🌊 Overview

**ORCA** is an enterprise-grade, agentic AI platform designed for coastal safety, marine spatial planning, and artisanal fishery decision support. Operating on deterministic oceanographic and meteorological datasets, ORCA replaces generic LLM hallucination with evidence-backed multi-agent reasoning.

---

## 🏛️ System Architecture

```
                               ┌────────────────────────────────┐
                               │     Next.js 16 Dashboard UI    │
                               │ (Light/Dark, Map, Risk, Trace) │
                               └───────────────┬────────────────┘
                                               │ HTTP / REST
                               ┌───────────────▼────────────────┐
                               │     FastAPI Backend Gateway    │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │       Agent Orchestrator       │
                               └───────────────┬────────────────┘
                                               │
      ┌──────────────┬────────────────┼────────────────┬──────────────┬──────────────┐
      │              │                │                │              │              │
┌─────▼─────┐  ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
│  Planner  │  │  Weather  │    │   Ocean   │    │    Geo    │  │   Risk    │  │ Reasoning │
│   Agent   │  │   Agent   │    │   Agent   │    │   Agent   │  │   Agent   │  │   Agent   │
└───────────┘  └─────┬─────┘    └─────┬─────┘    └─────┬─────┘  └─────┬─────┘  └───────────┘
                     │                │                │              │
               ┌─────▼────────────────▼────────────────▼──────────────▼─────┐
               │                Standardized Data Adapter Layer             │
               │ (Weather, Ocean, Satellite, Alerts, GIS, Marine Advisories) │
               └──────────────────────────────┬─────────────────────────────┘
                                              │
                               ┌──────────────▼────────────────┐
                               │   PostGIS & External Live APIs │
                               │ (INCOIS, IMD, NOAA, Copernicus)│
                               └───────────────────────────────┘
```

---

## 🤖 Multi-Agent Architecture

ORCA deploys **6 specialized collaborative agents**:

1. **Planner Agent (`planner.py`)**: Dynamically analyzes user queries to select required tools and dispatch agents.
2. **Weather Agent (`weather.py`)**: Evaluates wind speed, direction, gusting, rainfall, and atmospheric visibility.
3. **Ocean Agent (`ocean.py`)**: Processes Sea Surface Temperature (SST), Chlorophyll-a concentration, wave height, and ocean currents.
4. **Geospatial Agent (`geo.py`)**: Performs Haversine geodesic distance calculations, geofence breach detection, and pgRouting safe path synthesis.
5. **Risk Agent (`risk.py`)**: Executes a deterministic, rule-based risk evaluation matrix (LOW, MODERATE, HIGH, EXTREME).
6. **Reasoning & Explanation Agent (`reasoning.py` & `response.py`)**: Synthesizes cross-source evidence items and renders localized responses in English, Hindi (हिन्दी), and Telugu (తెలుగు).

---

## 📡 Data Adapters & Real Public API Mapping

Every adapter produces a standardized JSON response envelope:
```json
{
  "source": "INCOIS Ocean State Forecast (Demo Mode)",
  "timestamp": "2026-09-05T12:00:00Z",
  "location": { "lat": 17.6868, "lon": 83.2185 },
  "data": { ... },
  "metadata": { "is_demo": true, "provider": "INCOIS" }
}
```

### Real Public Dataset Integration Matrix:

| Domain | Demo Data Source | Real Public API / Dataset Replacement | Access Provider |
| :--- | :--- | :--- | :--- |
| **Weather** | IMD Simulation | [OpenWeatherMap One Call 3.0](https://openweathermap.org/api/one-call-3) / IMD Web API | IMD / OpenWeatherMap |
| **Ocean** | INCOIS OSF Simulation | [INCOIS Ocean State Forecast (OSF)](https://incois.gov.in/portal/osf/osf.jsp) / [Copernicus Marine (CMEMS)](https://marine.copernicus.eu/) | INCOIS / Copernicus |
| **Satellite** | Sentinel-3 & MODIS-Aqua | [Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu/) / [NASA Earthdata LAADS DAAC](https://ladsweb.modaps.eosdis.nasa.gov/) | ESA / NASA |
| **Alerts** | IMD Bulletin Simulation | [IMD Severe Weather Bulletins](https://mausam.imd.gov.in/) / [INCOIS SAMUDRA CAP Feed](https://incois.gov.in/) | IMD / INCOIS |
| **GIS Layer** | GeoJSON Polygon Mock | [PostGIS 15 Spatial Database](https://postgis.net/) + [OpenStreetMap Maritime Lines](https://www.openstreetmap.org/) | PostGIS / OSM |
| **Marine Advisories** | INCOIS PFZ Simulation | [INCOIS Potential Fishing Zone (PFZ) Advisories](https://incois.gov.in/portal/pfz/pfz.jsp) | INCOIS |

---

## 🔌 API Reference Endpoints

ORCA exposes 8 RESTful FastAPI endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Main multi-agent natural language query entrypoint. |
| `GET` | `/api/weather` | Meteorological parameter lookup (wind, rainfall, visibility). |
| `GET` | `/api/ocean` | Oceanographic parameter lookup (SST, Chlorophyll, swell). |
| `GET` | `/api/alerts` | Active marine hazard, cyclone, and lightning alerts. |
| `GET` | `/api/geospatial` | Geofences, international boundary lines (IMBL), and restricted areas. |
| `GET` | `/api/risk` | Deterministic risk assessment output. |
| `POST`/`GET` | `/api/route` | Haversine safe route vs. shortest route comparison. |
| `GET` | `/api/agent-trace` | Step-by-step execution trace of multi-agent reasoning. |

---

## 🛠️ Quickstart & Local Setup Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (Optional for containerized run)

### 2. Backend Setup
```bash
# Clone & Navigate
cd orca

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI application
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Start Next.js Development Server
npm run dev
```
Dashboard available at: `http://localhost:3000`

---

## 🐳 Docker Deployment

To launch the complete stack (FastAPI Backend + Next.js Frontend + PostGIS Database) in Docker:

```bash
# Build and start containers
docker-compose up --build -d

# View logs
docker-compose logs -f
```

---

## ⚙️ Environment Variables (`.env`)

Copy `.env.example` to `.env` and fill in API keys if running in Live mode:
```ini
DEMO_MODE=True
OPENWEATHER_API_KEY=your_key_here
INCOIS_API_KEY=your_key_here
POSTGIS_HOST=localhost
POSTGIS_PORT=5432
POSTGIS_DB=orca_gis
```

---

## 📜 License
Smart India Hackathon (SIH) 2026 Project — Developed for Indian Coastal & Maritime Intelligence.
