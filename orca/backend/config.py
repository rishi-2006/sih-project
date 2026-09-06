import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "ORCA Marine Intelligence Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "True").lower() in ("true", "1", "t")
    
    # API Keys & Endpoints (Loaded from ENV, default empty string for security)
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    INCOIS_API_KEY: str = os.getenv("INCOIS_API_KEY", "")
    IMD_API_KEY: str = os.getenv("IMD_API_KEY", "")
    COPERNICUS_API_KEY: str = os.getenv("COPERNICUS_API_KEY", "")
    
    # GIS / PostGIS Configuration
    POSTGIS_HOST: str = os.getenv("POSTGIS_HOST", "localhost")
    POSTGIS_PORT: int = int(os.getenv("POSTGIS_PORT", 5432))
    POSTGIS_DB: str = os.getenv("POSTGIS_DB", "orca_gis")
    POSTGIS_USER: str = os.getenv("POSTGIS_USER", "postgres")
    POSTGIS_PASSWORD: str = os.getenv("POSTGIS_PASSWORD", "postgres")

settings = Settings()
