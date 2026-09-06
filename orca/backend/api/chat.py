import time
from fastapi import APIRouter, HTTPException, status
from backend.models.schemas import ChatRequestModel, ChatResponseModel, ChatMessageModel
from backend.agents.orchestrator import AgentOrchestrator
from backend.logger import logger

router = APIRouter()
orchestrator = AgentOrchestrator()

@router.post("/chat", response_model=ChatResponseModel)
def handle_chat(request: ChatRequestModel):
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query message cannot be empty."
            )

        location = request.location.dict() if request.location else {"lat": 17.6868, "lon": 83.2185}
        logger.info(f"Processing chat query: '{request.message}' for location {location}")

        result = orchestrator.process_query(
            message=request.message,
            location=location,
            language=request.language or "en"
        )

        msg_id = f"msg-{int(time.time() * 1000)}"
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        chat_message = ChatMessageModel(
            id=msg_id,
            role="assistant",
            content=result.get("response", "Analysis completed."),
            timestamp=timestamp,
            riskAssessment=result.get("risk_assessment"),
            agentTrace=result.get("agent_trace"),
            evidence=result.get("evidence"),
            language=request.language
        )

        return ChatResponseModel(
            message=chat_message,
            weatherData=result.get("weather_data"),
            oceanData=result.get("ocean_data"),
            alerts=result.get("alerts"),
            riskAssessment=result.get("risk_assessment"),
            fishingZones=result.get("fishing_zones"),
            agentTrace=result.get("agent_trace"),
            evidence=result.get("evidence")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing your request: {str(e)}"
        )
