from fastapi import APIRouter, Query
from backend.agents.orchestrator import AgentOrchestrator

router = APIRouter()
orchestrator = AgentOrchestrator()

@router.get("/agent-trace")
def get_agent_trace(query: str = Query("Is it safe to go fishing tomorrow morning?", description="Sample or custom query")):
    """Runs agent orchestration for a test query and returns full multi-agent execution trace."""
    result = orchestrator.process_query(
        message=query,
        location={"lat": 17.6868, "lon": 83.2185},
        language="en"
    )
    return {
        "query": query,
        "agentTrace": result.get("agent_trace"),
        "evidence": result.get("evidence"),
        "riskAssessment": result.get("risk_assessment")
    }
