from datetime import datetime, timedelta

TIMESTAMP_NOW = datetime.utcnow().isoformat() + "Z"

DEMO_LOCATION = {"lat": 17.6868, "lon": 83.2185, "name": "Visakhapatnam Coast"}

DEMO_WEATHER_DATA = {
    "temperature": 28.0,
    "temperatureUnit": "°C",
    "windSpeed": 28.0,
    "windSpeedUnit": "km/h",
    "windDirection": "NE",
    "waveHeight": 2.4,
    "waveHeightUnit": "m",
    "rainfall": "Moderate Rain",
    "visibility": 8.0,
    "visibilityUnit": "km",
    "humidity": 78.0,
    "forecast": "Deteriorating conditions expected overnight with squally winds",
    "source": {
        "name": "DEMO DATA (INCOIS / IMD Simulation Adapter)",
        "timestamp": TIMESTAMP_NOW,
        "isDemo": True
    }
}

DEMO_OCEAN_DATA = {
    "sst": 29.1,
    "sstUnit": "°C",
    "chlorophyll": 0.8,
    "chlorophyllUnit": "mg/m³",
    "condition": "Moderate",
    "currentSpeed": 1.2,
    "currentDirection": "SW",
    "source": {
        "name": "DEMO DATA (MODIS / NOAA Satellite Simulation)",
        "timestamp": TIMESTAMP_NOW,
        "isDemo": True
    }
}

DEMO_ALERTS = [
  {
    "id": "alert-cyclone-1",
    "type": "cyclone",
    "severity": "MODERATE",
    "title": "Cyclone Advisory",
    "description": "Cyclonic disturbance detected 300 km East off Bay of Bengal. Moving WNW.",
    "distance": 300.0,
    "distanceUnit": "km",
    "direction": "East",
    "validFrom": TIMESTAMP_NOW,
    "validUntil": (datetime.utcnow() + timedelta(days=2)).isoformat() + "Z",
    "source": {
        "name": "DEMO DATA (IMD Cyclone Warning Center)",
        "timestamp": TIMESTAMP_NOW,
        "isDemo": True
    }
  },
  {
    "id": "alert-waves-1",
    "type": "high_waves",
    "severity": "HIGH",
    "title": "High Wave Alert",
    "description": "High waves in the range of 2.4 - 3.1 meters forecasted along AP coast.",
    "distance": 15.0,
    "distanceUnit": "km",
    "direction": "Offshore",
    "validFrom": TIMESTAMP_NOW,
    "validUntil": (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z",
    "source": {
        "name": "DEMO DATA (INCOIS High Wave Warning)",
        "timestamp": TIMESTAMP_NOW,
        "isDemo": True
    }
  }
]

DEMO_FISHING_ZONES = [
  {
    "id": "pfz-visakha-1",
    "name": "Visakha Offshore North (PFZ-1)",
    "center": [17.75, 83.45],
    "boundary": [
      [17.78, 83.40],
      [17.78, 83.52],
      [17.71, 83.50],
      [17.70, 83.38]
    ],
    "distance": 28.5,
    "distanceUnit": "km",
    "sst": 29.1,
    "chlorophyll": 0.8,
    "suitability": "High",
    "safetyScore": 45.0,
    "risk": "HIGH",
    "hazards": ["Elevated wave height", "Strong squally wind"],
    "source": {
        "name": "DEMO DATA (INCOIS PFZ Bulletin)",
        "timestamp": TIMESTAMP_NOW,
        "isDemo": True
    }
  },
  {
    "id": "pfz-visakha-2",
    "name": "Bheemunipatnam Sector (PFZ-2)",
    "center": [17.88, 83.50],
    "boundary": [
      [17.92, 83.45],
      [17.92, 83.58],
      [17.84, 83.55],
      [17.84, 83.42]
    ],
    "distance": 38.0,
    "distanceUnit": "km",
    "sst": 28.8,
    "chlorophyll": 0.6,
    "suitability": "Moderate",
    "safetyScore": 30.0,
    "risk": "HIGH",
    "hazards": ["Approaching cyclone fringe", "High wave zone"],
    "source": {
        "name": "DEMO DATA (INCOIS PFZ Bulletin)",
        "timestamp": TIMESTAMP_NOW,
        "isDemo": True
    }
  }
]

DEMO_GEOFENCES = [
  {
    "id": "geo-imbl-1",
    "name": "International Maritime Boundary Line (IMBL)",
    "type": "international_boundary",
    "boundary": [
      [17.90, 83.90],
      [17.90, 84.10],
      [17.30, 84.10],
      [17.30, 83.95]
    ],
    "description": "International territorial waters boundary",
    "reason": "Restricted military & international boundary line"
  },
  {
    "id": "geo-mpa-1",
    "name": "Kambalakonda Marine Reserve Buffer",
    "type": "mpa",
    "boundary": [
      [17.75, 83.32],
      [17.78, 83.35],
      [17.73, 83.37],
      [17.70, 83.34]
    ],
    "description": "Marine protected coastal ecosystem zone",
    "reason": "Ecologically sensitive coral & turtle breeding habitat"
  }
]

DEMO_ROUTE_DATA = {
  "shortest": {
    "name": "Direct Route",
    "distance": 38.2,
    "distanceUnit": "km",
    "duration": "1h 45m",
    "path": [
      [17.6868, 83.2185],
      [17.50, 83.55],
      [17.75, 83.45]
    ],
    "hazardExposure": "HIGH",
    "waypoints": ["Visakhapatnam Port", "High Wave Center", "PFZ-1"]
  },
  "recommended": {
    "name": "Safer Coastal Route",
    "distance": 42.6,
    "distanceUnit": "km",
    "duration": "2h 05m",
    "path": [
      [17.6868, 83.2185],
      [17.70, 83.32],
      [17.72, 83.38],
      [17.75, 83.45]
    ],
    "hazardExposure": "MODERATE",
    "waypoints": ["Visakhapatnam Port", "Coastal Inshore Corridor", "PFZ-1"]
  },
  "hazardZones": [
    {
      "id": "hz-1",
      "name": "High Wave Exposure Zone",
      "type": "high_waves",
      "center": [17.40, 83.55],
      "radius": 25000.0,
      "severity": "HIGH"
    },
    {
      "id": "hz-2",
      "name": "Cyclone Outer Peripheral Fringe",
      "type": "cyclone",
      "center": [17.50, 83.85],
      "radius": 35000.0,
      "severity": "MODERATE"
    }
  ]
}
