import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.api import chat, weather, ocean, alerts, geospatial, risk, route, agent_trace
from backend.config import settings
from backend.logger import logger

app = FastAPI(
    title=settings.APP_NAME,
    description="Marine Ecosystem Reasoning with Collaborative Agents Backend API",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception on {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc), "path": str(request.url)}
    )

# Register API Routers
app.include_router(chat.router, prefix="/api", tags=["Chat & Agent Intelligence"])
app.include_router(weather.router, prefix="/api", tags=["Weather Intelligence"])
app.include_router(ocean.router, prefix="/api", tags=["Ocean State & PFZ"])
app.include_router(alerts.router, prefix="/api", tags=["Marine Advisories & Hazards"])
app.include_router(geospatial.router, prefix="/api", tags=["GIS & Geofences"])
app.include_router(risk.router, prefix="/api", tags=["Deterministic Risk Engine"])
app.include_router(route.router, prefix="/api", tags=["Navigation & Safe Routing"])
app.include_router(agent_trace.router, prefix="/api", tags=["Agent Execution Trace"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "demoMode": settings.DEMO_MODE,
        "docs": "/docs",
        "endpoints": [
            "/api/chat",
            "/api/weather",
            "/api/ocean",
            "/api/alerts",
            "/api/geospatial",
            "/api/risk",
            "/api/route",
            "/api/agent-trace"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
