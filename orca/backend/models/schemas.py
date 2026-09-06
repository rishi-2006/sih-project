from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union

class LocationModel(BaseModel):
    lat: float
    lon: float

class DataSourceInfo(BaseModel):
    name: str = "IMD / INCOIS Data Service"
    timestamp: str = "2026-09-05T12:00:00Z"
    isDemo: bool = True

class WeatherDataModel(BaseModel):
    temperature: float
    temperatureUnit: str = "°C"
    windSpeed: float
    windSpeedUnit: str = "km/h"
    windDirection: str = "NE"
    waveHeight: float
    waveHeightUnit: str = "m"
    rainfall: str
    visibility: float
    visibilityUnit: str = "km"
    humidity: float
    forecast: str
    source: Optional[DataSourceInfo] = Field(default_factory=lambda: DataSourceInfo(name="IMD / OpenWeatherMap"))

class OceanDataModel(BaseModel):
    sst: float
    sstUnit: str = "°C"
    chlorophyll: float
    chlorophyllUnit: str = "mg/m³"
    condition: str
    currentSpeed: float
    currentDirection: str
    source: Optional[DataSourceInfo] = Field(default_factory=lambda: DataSourceInfo(name="INCOIS OSF"))

class AlertModel(BaseModel):
    id: str
    type: str
    severity: str
    title: str
    description: str
    distance: Optional[float] = None
    distanceUnit: Optional[str] = "km"
    direction: Optional[str] = None
    validFrom: str
    validUntil: str
    source: Optional[DataSourceInfo] = Field(default_factory=lambda: DataSourceInfo(name="IMD Warning Center"))

class FishingZoneModel(BaseModel):
    id: str
    name: str
    center: List[float]
    boundary: List[List[float]]
    distance: float
    distanceUnit: str = "km"
    sst: float
    chlorophyll: float
    suitability: str
    safetyScore: float
    risk: str
    hazards: List[str]
    source: Optional[DataSourceInfo] = Field(default_factory=lambda: DataSourceInfo(name="INCOIS PFZ"))

class RiskAssessmentModel(BaseModel):
    overall: str
    wind: str
    wave: str
    lightning: str
    cyclone: str
    visibility: str
    recommendation: str
    reasons: List[str]
    confidence: float

class EvidenceItemModel(BaseModel):
    category: str
    source: str
    timestamp: str
    data: Dict[str, Any]
    isDemo: bool = True

class AgentStepModel(BaseModel):
    agentName: str
    agentId: str
    status: str
    description: str
    duration: float
    result: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class AgentTraceModel(BaseModel):
    steps: List[AgentStepModel]
    totalDuration: float
    isDemo: bool = True

class ChatRequestModel(BaseModel):
    message: str
    location: Optional[LocationModel] = None
    language: Optional[str] = "en"
    demoMode: Optional[bool] = True

class ChatMessageModel(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str
    riskAssessment: Optional[RiskAssessmentModel] = None
    agentTrace: Optional[AgentTraceModel] = None
    evidence: Optional[List[EvidenceItemModel]] = None
    language: Optional[str] = "en"

class ChatResponseModel(BaseModel):
    message: ChatMessageModel
    weatherData: Optional[WeatherDataModel] = None
    oceanData: Optional[OceanDataModel] = None
    alerts: Optional[List[AlertModel]] = None
    riskAssessment: Optional[RiskAssessmentModel] = None
    fishingZones: Optional[List[FishingZoneModel]] = None
    agentTrace: Optional[AgentTraceModel] = None
    evidence: Optional[List[EvidenceItemModel]] = None

class RouteRequestModel(BaseModel):
    start: LocationModel
    end: LocationModel

class RouteSegmentModel(BaseModel):
    name: str
    distance: float
    distanceUnit: str = "km"
    duration: str
    path: List[List[float]]
    hazardExposure: str
    waypoints: List[str]

class HazardZoneModel(BaseModel):
    id: str
    name: str
    type: str
    center: List[float]
    radius: float
    severity: str

class RouteResponseModel(BaseModel):
    shortest: RouteSegmentModel
    recommended: RouteSegmentModel
    hazardZones: List[HazardZoneModel]
