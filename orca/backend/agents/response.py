from typing import Dict, Any
from backend.agents.base import BaseAgent

class ResponseAgent(BaseAgent):
    def __init__(self):
        super().__init__("Response Agent", "response")

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        risk = state.get("risk_assessment", {})
        language = state.get("language", "en")
        intent = state.get("intent", "FISHING_SAFETY")

        # Multilingual natural language responses
        if language == "te":
            if intent == "FISHING_SAFETY":
                content = f"అధిక ప్రమాదం ({risk.get('overall')} RISK). రేపు ఉదయం విశాఖపట్నం సమీపంలో చేపల వేటకు వెళ్లడం సురక్షితం కాదు. సముద్రంలో గాలులు మరియు అలల తీవ్రత ఎక్కువగా ఉంది."
            else:
                content = f"సముద్ర పరిస్థితులు విశ్లేషించబడ్డాయి. ప్రస్తుత ప్రమాద స్థాయి: {risk.get('overall')} RISK."
        elif language == "hi":
            if intent == "FISHING_SAFETY":
                content = f"उच्च जोखिम ({risk.get('overall')} RISK)। कल सुबह विशाखापट्टनम के पास मछली पकड़ने जाना सुरक्षित नहीं है। तेज हवाएं और ऊंची लहरें चल रही हैं।"
            else:
                content = f"समुद्री स्थितियों का विश्लेषण किया गया है। वर्तमान जोखिम स्तर: {risk.get('overall')} RISK।"
        else:
            if intent == "FISHING_SAFETY":
                content = f"{risk.get('overall')} RISK. {risk.get('recommendation')}"
            else:
                content = f"Marine analysis complete for Visakhapatnam region. Current overall risk level: {risk.get('overall')} RISK."

        state["response_content"] = content

        return {
            "description": f"Formulated response in target language ({language}).",
            "summary": "Final Natural Language Response Generated",
            "output": {"content": content}
        }
